---
layout: post
title:  "Is Memory64 actually worth using?"
date:   2025-01-14 18:00:00 -0600
author: Ben Visness
---

After many long years, the [Memory64 proposal](https://github.com/WebAssembly/memory64/) for WebAssembly has finally been [released](https://webassembly.org/features/#table-row-memory64) in both Firefox 134 and Chrome 133. In short, this proposal adds 64-bit pointers to WebAssembly.

If you are like most readers, you may be wondering: "Why wasn't WebAssembly 64-bit to begin with?" Yes, it's the year 2025 and WebAssembly has only just added 64-bit pointers. Why did it take so long, when 64-bit devices are the majority and 8GB of RAM is considered the bare minimum?

It's easy to think that 64-bit WebAssembly would run better on 64-bit hardware, but unfortunately that's simply not the case. WebAssembly apps tend to run slower in 64-bit mode than they do in 32-bit mode. This is not due to a lack of optimization; instead, the performance of Memory64 is restricted by hardware, operating systems, and the design of WebAssembly itself.

**TL;DR:** 32-bit WebAssembly can take advantage of an optimization that speeds up all memory accesses, while 64-bit cannot.


## What is Memory64, actually?

To understand why Memory64 is slow, we first must understand how WebAssembly represents memory.

When you compile a program to WebAssembly, the result is a WebAssembly module. A module is analogous to an executable file, and contains all the information needed to bootstrap and run a program, including:

- A description of how much memory will be necessary (the _memory section_)
- Static data to be copied into memory (the _data section_)
- The actual WebAssembly bytecode to execute (the _code section_)

These are encoded in an efficient binary format, but WebAssembly also has an official text syntax used for debugging and authoring directly. This article will use the text syntax. You can convert any WebAssembly module to the text syntax using tools like [WABT](https://github.com/WebAssembly/wabt) (wasm2wat) or [wasm-tools](https://github.com/bytecodealliance/wasm-tools/) (wasm-tools print).

Here's a simple but complete WebAssembly module that allows you to store and load an `i32` at address 16 of its memory.

```wasm
(module
  ;; Declare a memory with a size of 1 page (64KiB, or 65536 bytes)
  (memory 1)

  ;; Declare, and export, our store function
  (func (export "storeAt16") (param i32)
    i32.const 16  ;; push address 16 to the stack
    local.get 0   ;; get the i32 param and push it to the stack
    i32.store     ;; store the value to the address
  )

  ;; Declare, and export, our load function
  (func (export "loadFrom16") (result i32)
    i32.const 16  ;; push address 16 to the stack
    i32.load      ;; load from the address
  )
)
```

Now let's modify the program to use Memory64:

```wasm
(module
  ;; Declare an i64 memory with a size of 1 page (64KiB, or 65536 bytes)
  (memory i64 1)

  ;; Declare, and export, our store function
  (func (export "storeAt16") (param i32)
    i64.const 16  ;; push address 16 to the stack
    local.get 0   ;; get the i32 param and push it to the stack
    i32.store     ;; store the value to the address
  )

  ;; Declare, and export, our load function
  (func (export "loadFrom16") (result i32)
    i64.const 16  ;; push address 16 to the stack
    i32.load      ;; load from the address
  )
)
```

You can see that our memory declaration now includes `i64`, indicating that it uses 64-bit addresses. We therefore also change `i32.const 16` to `i64.const 16`. That's it. This is pretty much the entirety of the Memory64 proposal[^1].

[^1]: The proposal also adds an `i64` mode to _tables_. Tables in WebAssembly are the primary mechanism used for function pointers and indirect calls, but for simplicity they are omitted from this post. The rest of the proposal fleshes out these new `i64` modes, such as by modifying instructions like `memory.fill` to accept either `i32` or `i64` depending on the memory's address type.

## How is memory implemented?

So why does this tiny change make a difference for performance? We need to understand how WebAssembly engines actually implement memories.

Thankfully, this is very simple. The host (in this case, a browser) simply allocates memory for the WebAssembly module using a system call like [`mmap`](https://man7.org/linux/man-pages/man2/mmap.2.html) or [`VirtualAlloc`](https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualalloc). WebAssembly code is then free to read and write within that region, and the host (the browser) ensures that WebAssembly addresses (like `16`) are translated to the correct address within the allocated memory.

However, WebAssembly has an important constraint: accessing memory out of bounds will _trap_, analogous to a segmentation fault (segfault). It is the host's job to ensure that this happens, and in general it does so with _bounds checks_. These are simply extra instructions inserted into the machine code on each memory access—the equivalent of writing `if (address >= memory.length) { trap(); }` before every single load[^2]. You can see this in the actual x64 machine code [generated](https://searchfox.org/mozilla-central/rev/29e186485fe1b835f05bde01f650e371545de98e/js/src/jit/x64/MacroAssembler-x64.cpp#1718-1725) by SpiderMonkey for an `i32.load`[^3]:

```asm
  movq 0x08(%r14), %rax       ;; load the size of memory from the instance (%r14)
  cmp %rax, %rdi              ;; compare the address (%rdi) to the limit
  jb .load                    ;; if the address is ok, jump to the load
  cmovb %rax, %rdi            ;; spectre mitigation
  ud2                         ;; trap
.load:
  movl (%r15,%rdi,1), %eax    ;; load an i32 from memory (%r15 + %rdi)
```

These instructions have several costs! Besides taking up CPU cycles, they require an extra load from memory, they increase the size of machine code, and they take up branch predictor resources. But they are critical for ensuring the security and correctness of WebAssembly code.

Unless...we could come up with a way to remove them entirely.

[^2]: In practice the instructions may actually be more complicated, as they also need to account for integer overflow, [`offset`](https://webassembly.github.io/spec/core/syntax/instructions.html#syntax-memarg), and [`align`](https://webassembly.github.io/spec/core/syntax/instructions.html#syntax-memarg).

[^3]: If you're using the SpiderMonkey JS shell, you can try this yourself by using `wasmDis(func)` on any exported WebAssembly function.


## How is memory _really_ implemented?

The maximum possible value for a 32-bit integer is about 4 billion. 32-bit pointers therefore allow you to use up to 4GB of memory. The maximum possible value for a 64-bit integer, on the other hand, is about 18 sextillion, allowing you to use up to 18 exabytes of memory. This is truly enormous, tens of millions of times bigger than  the memory in even the most advanced consumer machines today. In fact, because this difference is so great, most "64-bit" devices are actually 48-bit in practice, using just 48 bits of the memory address to map from virtual to physical addresses[^4].

[^4]: Some hardware now also supports addresses larger than 48 bits, such as Intel processors with 57-bit addresses and [5-level paging](https://en.wikipedia.org/wiki/Intel_5-level_paging), but this is not yet commonplace.

Even a 48-bit memory is enormous: 65,000 times larger than the largest possible 32-bit memory. This gives every process 281 terabytes of _address space_ to work with, even if the device has only a few gigabytes of physical memory.

This means that address space is cheap. If you like, you can _reserve_ 4GB of address space from the operating system to ensure that it remains free for later use. Even if most of that memory is never used, this will have little to no impact on most systems.

How do browsers take advantage of this fact? **By reserving 4GB of memory for every single WebAssembly module.**

In our first example, we declared a 32-bit memory with a size of 64KB. But if you run this example on a 64-bit operating system, the browser will actually reserve 4GB of memory. The first 64KB of this 4GB block will be read-write, and the remaining 3.9999GB will be reserved.

By reserving 4GB of memory for all 32-bit WebAssembly modules, **it is impossible to go out of bounds.** The largest possible pointer value, 2^32-1, will simply land inside the reserved region of memory and trap. This means that, when running 32-bit wasm on a 64-bit system, **we can omit all bounds checks entirely[^5].**

[^5]: In practice, a few extra pages beyond 4GB will be reserved to account for `offset` and `align`, called "guard pages". We could reserve another 4GB of memory (8GB in total) to account for every possible offset on every possible pointer, but in SpiderMonkey we instead choose to reserve just 32MiB + 64KiB for guard pages and fall back to explicit bounds checks for any offsets larger than this. (In practice, large offsets are very uncommon.) For more information about how we handle bounds checks on each supported platform, see [this SMDOC comment](https://searchfox.org/mozilla-central/rev/d788991012a1a8ec862787f9799db4954a33045f/js/src/wasm/WasmMemory.cpp#70) (which seems to be slightly out of date), [these constants](https://searchfox.org/mozilla-central/rev/d788991012a1a8ec862787f9799db4954a33045f/js/src/wasm/WasmMemory.h#198), and [this Ion code](https://searchfox.org/mozilla-central/rev/d788991012a1a8ec862787f9799db4954a33045f/js/src/wasm/WasmIonCompile.cpp#1581-1590).

This optimization is impossible for Memory64. The size of the WebAssembly address space is the same as the size of the host address space. Therefore, we must pay the cost of bounds checks on every access, and as a result, Memory64 is slower.

## So why use Memory64?

The only reason to use Memory64 is if you need more than 4GB of memory.

It may seem disappointing, but it's true: 64-bit pointers allow you to address more memory, at the cost of slower loads and stores. Engines can attempt to improve performance by eliminating some bounds checks when compiling, but this is not always possible, and you can’t beat the absolute removal of bounds checks found in 32-bit WebAssembly.

Furthermore, the WebAssembly JS API constrains memories to a maximum size of 16GB. This may be quite disappointing for developers used to native memory limits. Unfortunately, because WebAssembly makes no distinction between “reserved” and “committed” memory, engines cannot freely allocate large quantities of memory without running into system commit limits.

Still, being able to access 16GB is very useful for some applications. If you need more memory, and can tolerate worse performance, then Memory64 might be the right choice for you.

Where can WebAssembly go from here? Memory64 may be of limited use today, but there are some exciting possibilities for the future:

- Bounds checks could be supported in hardware in the future. There has already been some research in this direction—for example, see [this 2023 paper](https://dl.acm.org/doi/10.1145/3582016.3582023) by Narayan et. al. With the growing popularity of WebAssembly and other sandboxed VMs, this could be a very impactful change that improves performance while also eliminating the wasted address space from large reservations. (Not all WebAssembly hosts can spend their address space as freely as browsers.)

- The [memory control proposal](https://github.com/WebAssembly/memory-control/) for WebAssembly, which I co-champion, is exploring new features for WebAssembly memory. While none of the current ideas would remove the need for bounds checks, they could take advantage of virtual memory hardware to enable larger memories, more efficient use of large address spaces (such as reduced fragmentation for memory allocators), or alternative memory allocation techniques.

Memory64 may not matter for most developers today, but we think it is an important stepping stone to an exciting future for memory in WebAssembly.

---

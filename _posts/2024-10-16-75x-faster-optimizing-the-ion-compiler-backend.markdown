---
layout: post
title:  "75x faster: optimizing the Ion compiler backend"
date:   2024-10-16 18:00:00 +0100
---

In September, machine learning engineers at Mozilla filed [a bug report](https://bugzilla.mozilla.org/show_bug.cgi?id=1916442) indicating that Firefox was consuming excessive memory and CPU resources while running Microsoft's [ONNX Runtime](https://github.com/microsoft/onnxruntime) (a machine learning library) compiled to WebAssembly.

This post describes how we addressed this and some of our longer-term plans for improving WebAssembly performance in the future.

## The problem

SpiderMonkey has two compilers for WebAssembly code. First, a Wasm module is compiled with the Wasm Baseline compiler, a compiler that generates decent machine code very quickly. This is good for startup time because we can start executing Wasm code almost immediately after downloading it. Andy Wingo wrote a nice [blog post](https://wingolog.org/archives/2020/03/25/firefoxs-low-latency-webassembly-compiler) about this Baseline compiler.

When Baseline compilation is finished, we compile the Wasm module with our more advanced Ion compiler. This backend produces faster machine code, but compilation time is a lot higher.

The issue with the ONNX module was that the Ion compiler backend took a long time and used a lot of memory to compile it. On my Linux x64 machine, Ion-compiling this module took about 5 minutes and used more than 4 GB of memory. Even though this work happens on background threads, this was still too much overhead.

## Optimizing the Ion backend

When we investigated this, we noticed that this Wasm module had some extremely large functions. For the largest one, Ion's MIR control flow graph contained 132856 [basic blocks](https://en.wikipedia.org/wiki/Basic_block). This uncovered some performance cliffs in our compiler backend.

### VirtualRegister live ranges

In Ion's register allocator, each `VirtualRegister` has a list of `LiveRange` objects. We were using a linked list for this, sorted by start position. This caused quadratic behavior when allocating registers: the allocator often splits live ranges into smaller ranges and we'd have to iterate over the list for each new range to insert it at the correct position to keep the list sorted. This was very slow for virtual registers with thousands of live ranges.

To address this, I tried a few different data structures. The [first attempt](https://bugzilla.mozilla.org/show_bug.cgi?id=1916442#c17) was to use an AVL tree instead of a linked list and that was a big improvement, but the performance was still not ideal and we were also worried about memory usage increasing even more.

After this we [realized](https://bugzilla.mozilla.org/show_bug.cgi?id=1918970) we could store live ranges in a vector (instead of linked list) that's optionally sorted by decreasing start position. We also [made some changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1917817) to ensure the initial live ranges are sorted when we create them, so that we could just append ranges to the end of the vector.

The observation here was that the core of the register allocator, where it assigns registers or stack slots to live ranges, doesn't actually require the live ranges to be sorted. We therefore now just append new ranges to the end of the vector and mark the vector unsorted. Right before the final phase of the allocator, where we again rely on the live ranges being sorted, we do a single `std::sort` operation on the vector for each virtual register with unsorted live ranges. Debug assertions are used to ensure that functions that require the vector to be sorted are not called when it's marked unsorted.

Vectors are also better for cache locality and they let us use binary search in a few places. When I was discussing this with Julian Seward, he pointed out that Chris Fallin also [moved away](https://cfallin.org/blog/2022/06/09/cranelift-regalloc2/) from linked lists to vectors in Cranelift's port of Ion's register allocator. It's always good to see convergent evolution :)

This change from sorted linked lists to optionally-sorted vectors made Ion compilation of this Wasm module about 20 times faster, down to 14 seconds.

### Semi-NCA

The next problem that stood out in performance profiles was the Dominator Tree Building compiler pass, in particular a function called `ComputeImmediateDominators`. This function determines the [immediate dominator](https://en.wikipedia.org/wiki/Dominator_\(graph_theory\)) block for each basic block in the MIR graph.

The algorithm we used for this (based on *A Simple, Fast Dominance Algorithm* by Cooper et al) is relatively simple but didn't scale well to very large graphs.

Semi-NCA (from *Linear-Time Algorithms for Dominators and Related Problems* by Loukas Georgiadis) is a different algorithm that's also used by LLVM and the Julia compiler. I prototyped this and was surprised to see how much faster it was: it got our total compilation time down from 14 seconds to less than 8 seconds. For a single-threaded compilation, it reduced the time under `ComputeImmediateDominators` from 7.1 seconds to 0.15 seconds.

Fortunately it was easy to run both algorithms in debug builds and assert they computed the same immediate dominator for each basic block. After a week of fuzz-testing, no problems were found and we [landed a patch](https://bugzilla.mozilla.org/show_bug.cgi?id=1919025) that removed the old implementation and enabled the [Semi-NCA code](https://searchfox.org/mozilla-central/rev/d56687458d4e6e8882c4b740e78413a0f0a69d59/js/src/jit/DominatorTree.cpp#19).

### Sparse BitSets

For each basic block, the register allocator allocated a (dense) [bit set](https://en.wikipedia.org/wiki/Bit_array) with a bit for each virtual register. These bit sets are used to check which virtual registers are live at the start of a block.

For the largest function in the ONNX Wasm module, this used a lot of memory: 199477 virtual registers x 132856 basic blocks is at least 3.1 GB just for these bit sets\! Because most virtual registers have short live ranges, these bit sets had relatively few bits set to 1\.

We [replaced](https://bugzilla.mozilla.org/show_bug.cgi?id=1920430) these dense bit sets with a new [`SparseBitSet`](https://searchfox.org/mozilla-central/source/js/src/jit/SparseBitSet.h) data structure that uses a hashmap to store 32 bits per entry. Because most of these hashmaps contain a small number of entries, it uses an `InlineMap` to optimize for this: it's a data structure that stores entries either in a small inline array or (when the array is full) in a hashmap. We also [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1920433) `InlineMap` to use a variant (a union type) for these two representations to save memory.

This saved at least 3 GB of memory but also improved the compilation time for the Wasm module to 5.4 seconds.

### Faster move resolution

The last issue that showed up in profiles was a function in the register allocator called `createMoveGroupsFromLiveRangeTransitions`. After the register allocator assigns a register or stack slot to each live range, this function is responsible for connecting pairs of live ranges by inserting *moves*.

For example, if a value is stored in a register but is later spilled to memory, there will be two live ranges for its virtual register. This function then inserts a move instruction to copy the value from the register to the stack slot at the start of the second live range.

This function was slow because it had a number of loops with quadratic behavior: for a move's destination range, it would do a linear lookup to find the best source range. We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1920951) the main two loops to run in linear time instead of being quadratic, by taking more advantage of the fact that live ranges are sorted.

With these changes, Ion can compile the ONNX Wasm module in less than 3.9 seconds on my machine, more than 75x faster than before these changes.

## Adobe Photoshop

These changes not only improved performance for the ONNX Runtime module, but also for a number of other WebAssembly modules. A large Wasm module downloaded from the free online [Adobe Photoshop demo](https://photoshop.adobe.com/discover) can now be Ion-compiled in 14 seconds instead of 4 minutes.

The JetStream 2 benchmark has a HashSet module that was [affected](https://bugzilla.mozilla.org/show_bug.cgi?id=1918970#c14) by the quadratic move resolution code. Ion compilation time for it improved from 2.8 seconds to 0.2 seconds.

## New Wasm compilation pipeline

Even though these are great improvements, spending at least 14 seconds (on a fast machine\!) to fully compile Adobe Photoshop on background threads still isn't an *amazing* user experience. We expect this to only get worse as more large applications are compiled to WebAssembly.

To address this, our WebAssembly team is making great progress rearchitecting the Wasm compiler pipeline. This work will make it possible to Ion-compile individual Wasm functions as they warm up instead of compiling everything immediately. It will also unlock exciting new capabilities such as (speculative) inlining.

Stay tuned for updates on this as we start rolling out these changes in Firefox.

\- Jan de Mooij, engineer on the SpiderMonkey team  


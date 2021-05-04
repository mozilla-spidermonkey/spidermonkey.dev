---
layout: post
title:  "SpiderMonkey Newsletter 2 (Firefox 73)"
author: SpiderMonkey Team
date:   2020-01-10 15:00:00 +0100
---

Happy new year from the SpiderMonkey team!

Heads up: the next newsletter will likely cover both Firefox 74 and Firefox 75 due to the shorter release cycles this year.

### JavaScript
#### New features
*   The relatedYear field type for Intl.DateTimeFormat.prototype.formatToParts is now part of the spec so André Bargull [made it](https://bugzilla.mozilla.org/show_bug.cgi?id=1591664) ride the trains.


#### Project Visage

Project Visage is a project to write a new frontend (parser and bytecode emitter) for JavaScript in Rust that’s more maintainable, modular, efficient, and secure than the current frontend. The team (Jason Orendorff, Nicolas Pierron, Tooru Fujisawa, Yulia Startsev) is currently [experimenting](https://github.com/mozilla-spidermonkey/jsparagus) with a parser generator that generates a custom LR parser.

There’s a [fork of mozilla-central](https://github.com/mozilla-spidermonkey/rust-frontend) where passing `--rust-frontend` to the shell makes it try the new frontend, falling back on the C++ frontend for scripts it can’t handle (currently almost everything). LibFuzzer is used as a way to identify issues where the new parser accepts inputs which are currently rejected by the current parser.

Jason also [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1602530) most of our bytecode [documentation](https://wiki.developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Internals/Bytecode).

(Jason pronounces it “VIZZ-udge”, like the English word, but you can say whatever you want.)


#### JSScript/LazyScript unification

Ted Campbell [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1600705) the parser to avoid saving trivial data between syntax parsing and the eventual delazification. This saves memory and brings us closer to being able to reconstruct a lazy script directly from its non-lazy version.

The [js::BaseScript](https://searchfox.org/mozilla-central/rev/be7d1f2d52dd9474ca2df145190a817614c924e4/js/src/vm/JSScript.h#1986) type now contains the fields it needed to represent lazy and non-lazy scripts. This is an important milestone on the path to unifying JSScript and LazyScript.


#### Project Stencil

As the GC-free parser work continues, Project Stencil aims to define a meaningful data format for the parser to generate. This paves the way to integrating a new frontend (Visage) and allows us to modernize the bytecode caches and improve page-load performance. We call it ‘stencil’ because this data structure is the template from which the VM’s JSScript will be instantiated.



*   Matthew Gaudet started fuzzing the deferred allocation path in the front end. The hope is that we will enable this code path by default early in the Firefox 74 cycle. The end goal of turning this on by default is to avoid having to maintain two allocation paths indefinitely.
*   The LazyScript unification work continues to simplify (and clarify) the semantics of internal script flags that the parser must generate. These flags will become part of the stencil data structures.


#### Regular expression engine update

Iain Ireland is writing a shim layer to enable Irregexp, V8’s regexp engine, to be embedded in SpiderMonkey with minimal changes relative to upstream. He is currently working on rewriting the existing regular expression code to call the new engine.


#### Bytecode and IonBuilder simplifications

The previous newsletter mentioned some large IonBuilder code simplifications landing in Firefox 72. This cycle Jan de Mooij [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1598548) all loops to have the same bytecode structure so IonBuilder can use the same code for all of them. This also allowed us to [remove](https://bugzilla.mozilla.org/show_bug.cgi?id=1601599) more source notes and JIT compilation no longer has to look up any source notes.

These changes help the new frontend because it’s now easier to generate correct bytecode and also laid the groundwork for more Ion cleanup work this year. Finally, it ended up fixing some performance cliffs: [yield\* expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*), for example, can be [at least 5x faster](https://bugzilla.mozilla.org/show_bug.cgi?id=1601072#c4).


#### toSource/uneval removal

Tom Schuster [is investigating](https://bugzilla.mozilla.org/show_bug.cgi?id=1565170#c5) removing the non-standard toSource and uneval functions. This requires fixing a lot of code and [tests in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1605854) so as a first step we may do this only for content code. André Bargull [helped out](https://bugzilla.mozilla.org/show_bug.cgi?id=1565001) by fixing SpiderMonkey tests to stop using these functions.


#### Debugger

Logan Smyth [rewrote](https://bugzilla.mozilla.org/show_bug.cgi?id=1602699) debugger hooks to use the exception-based implementation for forced returns. This ended up removing and simplifying a lot of code in the debugger, interpreter and JITs because the exception handler is now the only place where forced returns have to be handled.


#### Miscellaneous



*   André Bargull [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1474914) an Array.prototype.reverse performance issue by avoiding GC post barriers if the array is in the nursery.
*   André also contributed more BigInt optimizations. He [reduced allocations and added fast paths](https://bugzilla.mozilla.org/show_bug.cgi?id=1599465) for uint64 BigInts. For example, certain multiplications are now 3-11x faster and exponentiations can be up to 30x faster!


### WebAssembly


#### JS BigInt <-> wasm I64 conversion

Igalia (Asumu Takikawa) has [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1511958) the [JS-BigInt-integration proposal](https://github.com/WebAssembly/JS-BigInt-integration), so i64 values in WebAssembly can be converted to/from JavaScript BigInt.  This is behind a flag and Nightly-only for the time being.


#### Reference types and bulk memory

SpiderMonkey continues to track the [reference types](https://github.com/webassembly/reference-types) and [bulk memory proposals](https://github.com/webassembly/bulk-memory-operations/), with several tweaks and bug fixes having landed recently.


#### Wasm Cranelift

[Cranelift](https://github.com/CraneStation/cranelift) is a code generator (written in Rust) that we want to[ use in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1488718) as the next optimizing compiler for WebAssembly.



*   Andrew Brown (from Intel) has kept on implementing more opcodes for the wasm SIMD proposal.
*   Undergoing work is still being carried out by Julian Seward & Benjamin Bouvier to implement different register allocation algorithms: a simple linear scan as well as a backtracking allocator à la IonMonkey.
*   Ryan Hunt has added WebAssembly bulk memory operations support to Cranelift. This is enabled when using Cranelift as the wasm backend in Firefox.
*   Yury Delendik has implemented basic support for the reference types proposal. It is not complete yet, so it is not available in general in Cranelift.
*   Sean Stangl and @bjorn3 have landed [initial](https://github.com/bytecodealliance/cranelift/pull/1298) [support](https://github.com/bytecodealliance/cranelift/pull/1308) for automatically determining what the REX prefix should be for x86 instructions, which will ease supporting more x86 instructions.


#### Ongoing work



*   The [multi-value proposal](https://github.com/WebAssembly/multi-value/blob/master/proposals/multi-value/Overview.md) allows WebAssembly functions and blocks to return multiple values. Andy Wingo from Igalia is [making steady progress](https://bugzilla.mozilla.org/show_bug.cgi?id=1401675) implementing this feature in SpiderMonkey. It works for blocks, function calls are in progress.
*   Tom Tung, Anne van Kesteren and others are [working](https://bugzilla.mozilla.org/show_bug.cgi?id=1477743) on [re-enabling](https://groups.google.com/forum/#!msg/mozilla.dev.platform/IHkBZlHETpA/dwsMNchWEQAJ) SharedArrayBuffer by default.
*   Lars Hansen has done [initial work](https://bugzilla.mozilla.org/show_bug.cgi?id=1335652) (based on older work by David Major) on implementing the [exception handling proposal](https://github.com/WebAssembly/exception-handling) in our production compilers and in the runtime.

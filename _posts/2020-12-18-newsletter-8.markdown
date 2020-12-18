---
layout: post
title:  "SpiderMonkey Newsletter 8 (Firefox 84-85)"
date:   2020-12-18 18:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 84 and 85 Nightly release cycles.

If you like these newsletters, you may also enjoy Yulia's [Compiler Compiler live stream](https://developer.mozilla.com/events/compiler-compiler-yulia-startsev/).

This has been an unusual year for many of us, but the team is proud of everything we accomplished in 2020. Happy Holidays!


### 👷🏽‍♀️ New features


#### Firefox 84-85



*   André [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1645107) support for the `fractionalSecondDigits` option for `Intl.DateTimeFormat`.
*   André [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1670062) support for the `collation` option for `Intl.Collator`.


#### In progress



*   Tom [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1658308) the [`at()` proposal](https://github.com/tc39/proposal-relative-indexing-method) (Nightly-only)
*   Yulia [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1519100) support for [top-level await](https://github.com/tc39/proposal-top-level-await) (disabled by default)


### ⚡ WebAssembly



*   Dmitry from Igalia [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1639153) patches to make the internal call ABI more efficient.
*   Julian [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1676624) the Cranelift compiler on ARM64 hardware (in Nightly).
*   Lars [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1625130) many changes to improve SIMD support.
*   Ryan [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1675602) the TypedObject code more by using Wasm's type system.
*   Mike Hommey [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1678226) crashes on Apple ARM64 hardware.
*   Jan [prototyped](https://bugzilla.mozilla.org/show_bug.cgi?id=1673557) support for large (more than 2 GB) ArrayBuffers, DataViews and typed arrays. Lars [did some work](https://bugzilla.mozilla.org/show_bug.cgi?id=1676441) to take advantage of this for WebAssembly.
*   Asumu and Ioanna from Igalia started [landing](https://bugzilla.mozilla.org/show_bug.cgi?id=1335652) patches for Wasm exception handling.


### ❇️ Stencil

[Stencil](https://bugzilla.mozilla.org/show_bug.cgi?id=1601332) is our project to create an explicit interface between the frontend (parser, bytecode emitter) and the rest of the VM, decoupling those components. This lets us improve web-browsing performance, simplify a lot of code and improve bytecode caching.



*   Ted [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1672172) line/column source notes relative to the initial line/column to allow more bytecode sharing.
*   Arai [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1671895) Stencil instantiation by moving more malloc allocations off-thread.
*   Arai and Ted [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1674674) [many](https://bugzilla.mozilla.org/show_bug.cgi?id=1671960) [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1676673) [to](https://bugzilla.mozilla.org/show_bug.cgi?id=1675670) optimize conversion from parser atoms to GC atoms.
*   Ted [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1675074) more parser atoms `constexpr`.
*   Arai replaced pointers to [atoms](https://bugzilla.mozilla.org/show_bug.cgi?id=1675241) and [script-things](https://bugzilla.mozilla.org/show_bug.cgi?id=1675804) with indexes to save memory and to optimize bytecode caching.
*   Ted [used](https://bugzilla.mozilla.org/show_bug.cgi?id=1668672) a LifoAlloc (bump allocator) to speed up allocations for Stencil data structures.


### 🚀 WarpBuilder

[WarpBuilder](https://bugzilla.mozilla.org/show_bug.cgi?id=1613592) is the JIT project to replace the frontend of our optimizing JIT (IonBuilder) and the engine's Type Inference mechanism with a new MIR builder based on compiling CacheIR to MIR.

After [enabling](https://hacks.mozilla.org/2020/11/warp-improved-js-performance-in-firefox-83/) Warp by default in Firefox 83, we started removing IonBuilder and TI in Firefox 85. This has let us remove about 50,000 lines of complicated code.



*   Jan [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1673553) more than 100 patches to remove most of the IonBuilder/TI code.
*   Ted and Tom also [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1677177) [various](https://bugzilla.mozilla.org/show_bug.cgi?id=1678675) [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1677184) to delete code we no longer needed.
*   Iain [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1673497) [many](https://bugzilla.mozilla.org/show_bug.cgi?id=1675084) [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1680621) to the bailout code to eliminate bailout loops. The goal is to detect this class of subtle performance cliffs in debug builds with assertions.
*   André [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1674719) support for sparse element operations to the transpiler.
*   Jan [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1672650) support for optimizing `typeof` operations to the transpiler.


### 🧹Garbage Collection



*   Steve [switched](https://bugzilla.mozilla.org/show_bug.cgi?id=1672428) the static analysis (for rooting hazards) in automation to use the new `mach` command.
*   Steve [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1680159) an OOM issue when running the static analysis locally.
*   Jon [used](https://bugzilla.mozilla.org/show_bug.cgi?id=1681690) nursery strings in more places.
*   Yoshi [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1522186) a change to stop string pre-tenuring when many strings are finalized.
*   Jon [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1673408) marking of slot value ranges.
*   Jon [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1674126) private slots of objects to store a `PrivateValue` or `PrivateGCThingValue` to simplify GC code.


### 📚 Miscellaneous changes



*   Tom [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1673440) the 'illegal character' parser error message to include the character.
*   Ted [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1677580) some bytecode operations for global bindings, to make the bytecode more compact and to speed up the bytecode emitter.
*   Christian [replaced](https://bugzilla.mozilla.org/show_bug.cgi?id=1677045) the more-deterministic configure option with a shell flag to simplify differential testing.
*   Jeff [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1672865) test262 to the latest revision.
*   Nicolas [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1582804) it possible to dump telemetry values in the JS shell.
*   Yozaam [converted](https://bugzilla.mozilla.org/show_bug.cgi?id=1531479) more code to the new `BytecodeLocation` interface.
*   Ted [reduced](https://bugzilla.mozilla.org/show_bug.cgi?id=1670238) the number of functions that are delazified for debugger breakpoints.
*   Jeff [moved](https://bugzilla.mozilla.org/show_bug.cgi?id=1663365) more code out of jsfriendapi.h into smaller header files.

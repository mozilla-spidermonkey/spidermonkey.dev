---
layout: post
title:  "SpiderMonkey Newsletter 6 (Firefox 80-81)"
date:   2020-08-28 17:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 80 and 81 Nightly release cycles. If you like these newsletters, you may also enjoy Yulia's [Compiler Compiler live stream](https://developer.mozilla.com/events/compiler-compiler-yulia-startsev/).

With the recent changes at Mozilla, some may be worried about what this means for SpiderMonkey. The team continues to remain strong, supported and is excited to show off a lot of cool things this year and into the future.

### JavaScript
#### 👷🏽‍♀️ New features
##### Firefox 80
*   Ted [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1496852) support for the `export * as ns from “module”` syntax in modules [proposal](https://github.com/tc39/proposal-export-ns-from).

##### In progress
*   Matthew [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1642476) [private class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields), behind a pref. He also [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1644160) support for adding private class fields to proxies.
*   Adam [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1435826) support for [private methods and accessors](https://github.com/tc39/proposal-private-methods), behind a pref.
*   Adam [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1647794) [more](https://bugzilla.mozilla.org/show_bug.cgi?id=1647796) [Iterator helper](https://tc39.es/proposal-iterator-helpers/) methods.
*   Jeff [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1502355) more changes for `ReadableStream` `pipeTo/pipeThrough`.
*   André [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1496584) `Intl.DateTimeFormat.prototype.formatRange` and `formatRangeToParts`.
*   Yulia [started](https://bugzilla.mozilla.org/show_bug.cgi?id=1519100) implementing [Top-level await](https://github.com/tc39/proposal-top-level-await).


#### 🗑️ Garbage Collection
*   Jon [moved](https://bugzilla.mozilla.org/show_bug.cgi?id=1652019) more decommit code to the background thread.
*   Jon [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1657850) prefs and improved heuristics for the number of helper threads doing GC work.
*   Yoshi [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1653914) GC sub-categories to the profiler.
*   Paul [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1482089) some unused GC telemetry code to improve memory usage.
*   Jon [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1657122) compacting for ObjectGroups.
*   Yoshi [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1649702) shutdown GCs to not start compression tasks.


#### ❇️ Stencil

[Stencil](https://bugzilla.mozilla.org/show_bug.cgi?id=1601332) is our project to create an explicit interface between the frontend (parser, bytecode emitter) and the rest of the VM, decoupling those components. This lets us improve performance, simplify a lot of code and improve bytecode caching. It also makes it possible to rewrite our frontend in Rust (see SmooshMonkey item below).

We expect to [switch](https://bugzilla.mozilla.org/show_bug.cgi?id=1660798) the frontend to use `ParserAtoms` in the next Nightly cycle (Firefox 82). At that point the frontend will work without doing any GC allocations and will be more independent from the rest of the engine, unblocking further (performance) improvements.



*   Arai [decoupled](https://bugzilla.mozilla.org/show_bug.cgi?id=1641202) Stencil structures more from the frontend data structures.
*   Ted [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1614041) module parsing work with Stencils and without allocating GC things.
*   Ted [deferred](https://bugzilla.mozilla.org/show_bug.cgi?id=1652472) GC allocation of `ScriptSourceObject`.
*   Ted [cleaned](https://bugzilla.mozilla.org/show_bug.cgi?id=1653248) up scope/environment handling.
*   Arai [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1654149) a `dumpStencil(code)` function to the JS shell to print the Stencil data structures.
*   Kannan [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1651750) [more](https://bugzilla.mozilla.org/show_bug.cgi?id=1652176) [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1654037) preparing for the switch to `ParserAtom`.


#### 🐒 SmooshMonkey

[SmooshMonkey](https://github.com/mozilla-spidermonkey/jsparagus) is our project to reimplement the frontend in a safe language (Rust) and will make it easier to implement new features and improve long-term maintainability of the code base.



*   Arai [hooked up](https://bugzilla.mozilla.org/show_bug.cgi?id=1648574) the output of the Rust frontend to Stencil’s function data structures.


#### 🚀 WarpBuilder

[WarpBuilder](https://bugzilla.mozilla.org/show_bug.cgi?id=1613592) is the JIT project to replace the frontend of our optimizing JIT (IonBuilder) and the engine's Type Inference mechanism with a new MIR builder based on compiling CacheIR to MIR. WarpBuilder will let us improve security, performance, memory usage and maintainability of the whole engine. Since the previous newsletter we've ported a lot of optimizations to CacheIR and Warp.



*   André, Caroline, Iain, Jan and Tom [ported optimizations](https://bugzilla.mozilla.org/show_bug.cgi?id=1638111) for many builtins to CacheIR and Warp.
*   They also [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1628222) a lot of CacheIR instructions in the transpiler.
*   Iain [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1646378) support for Trial Inlining of JS functions.
*   Tom [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1657088) [code](https://bugzilla.mozilla.org/show_bug.cgi?id=1658786) generated for `for-of` loops and [adding](https://bugzilla.mozilla.org/show_bug.cgi?id=1659133) new properties to objects.
*   Caroline [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1656552) and [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1657022) JSON output for the CacheIR health analysis tool.
*   Jan made [IsPackedArray](https://bugzilla.mozilla.org/show_bug.cgi?id=1651645), [MaybeInIteration](https://bugzilla.mozilla.org/show_bug.cgi?id=1655451) and the [arguments analysis](https://bugzilla.mozilla.org/show_bug.cgi?id=1657303) work without depending on IonBuilder and TI.


#### 🧹 Miscellaneous changes



*   Tom [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1559253) syntax errors in regular expressions to use the correct source location.
*   Jan [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1657559) a cache for atomizing strings to [fix](https://bugzilla.mozilla.org/show_bug.cgi?id=1654087) a performance cliff affecting Reddit.
*   Yoshi [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1649887) [more](https://bugzilla.mozilla.org/show_bug.cgi?id=1650393) [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1651944) for [integrating](https://bugzilla.mozilla.org/show_bug.cgi?id=1559660) SpiderMonkey’s helper threads with the browser’s thread pool.
*   Philip Chimento [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1606568) public APIs for working with BigInts.
*   Evan Welsh [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1654696) a public API for enabling code coverage.
*   Kanishk [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1527839) an over-recursion bug in `ExtractLinearSum`.
*   Logan [cleaned up](https://bugzilla.mozilla.org/show_bug.cgi?id=1647342) Debugger frames code.
*   Jan [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1657830) and cleaned up some jump relocation and jump code on x64 and ARM64.
*   Tom [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1651445) [some](https://bugzilla.mozilla.org/show_bug.cgi?id=1651815) `CallNonGenericMethod` calls for `Number` and `Date` functions. This improved certain error messages.
*   André [converted](https://bugzilla.mozilla.org/show_bug.cgi?id=1651732) code from `ValueToId` to `ToPropertyKey` to fix subtle correctness bugs.
*   Jeff [moved](https://bugzilla.mozilla.org/show_bug.cgi?id=1656411) [more](https://bugzilla.mozilla.org/show_bug.cgi?id=1654927) [code](https://bugzilla.mozilla.org/show_bug.cgi?id=1659885) out of `jsfriendapi.h` into smaller headers.
*   Barun [renamed](https://bugzilla.mozilla.org/show_bug.cgi?id=1483269) `gc::AbortReason` to `GCAbortReason` to fix a conflict with `jit::AbortReason`.


### WebAssembly



*   The [Cranelift](https://github.com/bytecodealliance/wasmtime/tree/main/cranelift) team [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1655928) [various](https://bugzilla.mozilla.org/show_bug.cgi?id=1649928) [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1656638) to prepare for [enabling](https://bugzilla.mozilla.org/show_bug.cgi?id=1649932) Cranelift by default for ARM64 platforms in Nightly. On ARM64 we currently only have the Wasm Baseline compiler so it’s the first platform where Cranelift will be rolled out.
*   Ryan [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1561521) non-nullable references.
*   Lars [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1640669) optimizations for SIMD and [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1656226) some experimental Wasm SIMD opcodes.
*   Lars [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1646663) alignment of loop headers to the Ion backend.

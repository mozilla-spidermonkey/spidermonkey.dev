---
layout: post
title:  "SpiderMonkey Newsletter 9 (Firefox 86-87)"
date:   2021-02-26 17:30:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 86 and 87 Nightly release cycles.

If you like these newsletters, you may also enjoy Yulia's [Compiler Compiler live stream](https://developer.mozilla.com/events/compiler-compiler-yulia-startsev/).


### 🏆 New contributors



*   Jonatan fixed [a subtle bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1683784) in how our error messages got printed around private fields. 


### 👷🏽‍♀️ JS features



*   Yulia attended the TC39 meeting in January and took [notes](https://github.com/codehag/TC39-news/blob/master/meetings/2021/tc39-01-2021.md).
*   André [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1670044) support for the 'Arbitrary module namespace identifier names' [spec change](https://github.com/tc39/ecma262/pull/2154).
*   Jan added support for large ArrayBuffers to [structured cloning](https://bugzilla.mozilla.org/show_bug.cgi?id=1686445), [JITs](https://bugzilla.mozilla.org/show_bug.cgi?id=1687441), [typed arrays](https://bugzilla.mozilla.org/show_bug.cgi?id=1686936) and the [JSAPI](https://bugzilla.mozilla.org/show_bug.cgi?id=1674777). This is now available behind a pref in Nightly and will let us [support](https://bugzilla.mozilla.org/show_bug.cgi?id=1673619) WebAssembly memories larger than 2 GB on 64-bit platforms.
*   André [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1672862) typed array elements to appear configurable, following a recent [spec change](https://github.com/tc39/ecma262/pull/2164).
*   Jason [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1683746) the bytecode generated for private fields.
*   André [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1685481) timezone information [twice](https://bugzilla.mozilla.org/show_bug.cgi?id=1689294).
*   Yulia [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1689499) the Top Level Await implementation to fix a spec bug.
*   Yulia [reviewed](https://bugzilla.mozilla.org/show_bug.cgi?id=1693261) an incoming potential change to the TLA specification.
*   André [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1654116) the Intl.DisplayNames constructor by default.


### ⚡ WebAssembly



*   Lars and Yury [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1625130) many changes for SIMD support.
*   Ioanna and Asumu from Igalia [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1335652) support for the exception handling [proposal](https://github.com/WebAssembly/exception-handling) in the Wasm Baseline compiler.
*   Lars [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1678542) various issues to support the Ion backend for Wasm on ARM64.
*   Luke Wagner [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1647791) telemetry for duplicate imports, to see if this could be disallowed in the future.
*   Tom [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1687063) error messages when trying to consume a `Response` for Wasm.
*   Ryan [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1686755) support for optional parameters in the `WebAssembly.Table` API.
*   Ryan continues to work on implementing the draft wasm GC specification.


### 🧹 Garbage Collection



*   Jon [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1677765) arena unmarking to happen concurrently at the start of GC.
*   Jon [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1681533) nursery collections during major GCs to happen only when necessary.
*   Steve [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1658866) counters for various string operations.
*   Steve [used](https://bugzilla.mozilla.org/show_bug.cgi?id=1682947) `MADV_FREE_REUSE` on macOS when using decommitted memory to improve the accuracy of memory usage data.
*   Jon [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1685128) idle collections to collect and shrink the nursery when it's underused.
*   Jon [moved](https://bugzilla.mozilla.org/show_bug.cgi?id=1686219) chunk metadata from the end of the chunk to the start, so that it can be accessed more efficiently, and [cleaned up](https://bugzilla.mozilla.org/show_bug.cgi?id=1687956) the chunk code.
*   Jon [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1689394) the tracing/marking code more to fix a telemetry regression.
*   Steve [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1691361) nursery collections by not adding strings and BigInts without children to the fixup list. He also [split](https://bugzilla.mozilla.org/show_bug.cgi?id=1692359) `collectToFixedPoint` in separate object and string parts to improve GC statistics.


### ❇️ Stencil

[Stencil](https://bugzilla.mozilla.org/show_bug.cgi?id=1601332) is our project to create an explicit interface between the frontend (parser, bytecode emitter) and the rest of the VM, decoupling those components. This lets us improve web-browsing performance, simplify a lot of code and improve bytecode caching.



*   Nicolas [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1668361#c4) shell tests a lot faster by using cached bytecode for self-hosted code.
*   Arai [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1674306) a large number of changes to improve performance of the Stencil XDR (bytecode serialization) format.
*   Ted [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1667804) stencil-mvp by default. This switched bytecode caching to use the new Stencil-based format and fixes performance-cliffs related to GC blocking off-thread parsing.
*   Matthew later [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1690115) the stencil-mvp pref to unblock more optimization work.
*   Ted [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1687338) `ScriptSource` to XDR encoding and main-thread GC function [allocations](https://bugzilla.mozilla.org/show_bug.cgi?id=1687602).
*   Arai [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1688534) main-thread GC allocations for object literals.
*   Arai [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1660275) the frontend to use a snapshot of scope information.
*   Ted [cleaned up](https://bugzilla.mozilla.org/show_bug.cgi?id=1690943) code for missing class constructor by synthesizing these functions in the parser instead of cloning self-hosted functions.
*   Arai [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1689892) [many](https://bugzilla.mozilla.org/show_bug.cgi?id=1687428) performance and memory usage improvements for parser atoms.
*   Ted [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1691612) a public API for Stencil data structures. This will be used in the browser to improve bytecode caching more.


### 🚀 JIT



*   Matthew [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1680602) support for compiling async functions and generators with Warp. [Enabling this by default showed a 4% win on Ares6](https://bugzilla.mozilla.org/show_bug.cgi?id=1682623#c5).
*   Iain improved the bailout code and [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1673497) a mechanism to catch bailout loops in debug builds. Bailout loops can result in performance cliffs, and this work [caught](https://bugzilla.mozilla.org/show_bug.cgi?id=1686207) [various](https://bugzilla.mozilla.org/show_bug.cgi?id=1687672) issues.
*   Nicolas [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1679922) use of the `JSCVT` instruction on Apple ARM64 hardware.
*   Caroline [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1672787) filtering for the JSON output used by the CacheIR health report tool, to get it down to reasonable size for complex websites. 
*   André, Tom and Jan [cleaned up](https://bugzilla.mozilla.org/show_bug.cgi?id=1682767) [and](https://bugzilla.mozilla.org/show_bug.cgi?id=1687255) [deleted](https://bugzilla.mozilla.org/show_bug.cgi?id=1686692) [even](https://bugzilla.mozilla.org/show_bug.cgi?id=1689990) [more](https://bugzilla.mozilla.org/show_bug.cgi?id=1657367) [code](https://bugzilla.mozilla.org/show_bug.cgi?id=1683093) following the IonBuilder and TI removal in Firefox 85.
*   Iain [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1674143) CacheIR and Warp optimizations for `Math.min/max` spread calls with arrays.
*   André added CacheIR and Warp optimizations for [`Object.prototype.toString`](https://bugzilla.mozilla.org/show_bug.cgi?id=1687229), [`Atomics` functions](https://bugzilla.mozilla.org/show_bug.cgi?id=1638295) with `BigInt64Array` and `BigUint64Array`, and [various](https://bugzilla.mozilla.org/show_bug.cgi?id=1692517) `TypedArray`, `DataView` and `RegExp` getters.
*   Tom [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1666009) a mechanism to inline certain self-hosted functions in Warp even if they're normally too big to be considered for inlining.
*   André [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1679750) `BigInt` operations in Warp by supporting them in the CacheIR-to-MIR transpiler.
*   Iain is [making](https://bugzilla.mozilla.org/show_bug.cgi?id=1688033) progress on replacing the heavyweight lazy-`arguments` optimization with a simpler implementation based on scalar replacement in the JIT backend.


### 📚 Miscellaneous


#### Documentation



* Ted [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1685958) a SpiderMonkey overview [page](https://firefox-source-docs.mozilla.org/js/index.html) to Firefox source docs.
* Jon [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1686772) GC [documentation](https://firefox-source-docs.mozilla.org/js/gc.html).
* Iain [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1690092) a high-level [overview](https://firefox-source-docs.mozilla.org/js/MIR-optimizations/index.html) of MIR optimizations.
* Matthew [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1682846) the JIT frame layout comment.


#### Old bugs



*   Jan [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=944846) `Number.prototype.{toFixed, toExponential, toPrecision}` to use the double-conversion code in MFBT instead of dtoa. This fixes a `toExponential` rounding issue and is also faster in most cases.
*   Calixte Denizet [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1676708) a date parsing bug for GMT values starting with '00'.
*   arai [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1579792) an old bug where function stringification could include too much source code.


#### Modern C++



*   Chris Peterson [replaced](https://bugzilla.mozilla.org/show_bug.cgi?id=1684092) `MOZ_MUST_USE` with the C++17 `[[nodiscard]]` attribute.
*   André [replaced](https://bugzilla.mozilla.org/show_bug.cgi?id=1687463) calls to various array-related functions in MFBT with STL equivalents.


#### Other



*   Jason [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1671391) debugger regressions from generator optimizations.
*   Jan [moved](https://bugzilla.mozilla.org/show_bug.cgi?id=1693483) the `TypeDescr` for typed objects from the `ObjectGroup` to typed objects to prepare for upcoming object layout changes.
*   Julian [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1686658) the `IONFLAGS` logging output.
*   Jan [renamed](https://bugzilla.mozilla.org/show_bug.cgi?id=1592712) the confusingly-named `IfEq` and `IfNe` bytecode instructions to `JumpIfFalse` and `JumpIfTrue`.
*   Jon [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1691004) a flag to make it easier to run shell tests with a non-standard 'GC zeal'.

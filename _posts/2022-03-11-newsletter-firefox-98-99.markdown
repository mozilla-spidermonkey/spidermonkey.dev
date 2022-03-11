---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 98-99)"
date:   2022-03-11 18:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 98 and 99 Nightly release cycles.

### 👷🏽‍♀️ JS features

* Contributors Rolf Glomsrud and Sigurd Sesta [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1739648) [Array grouping](https://github.com/tc39/proposal-array-grouping) (Nightly-only).
* Igalia [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1744975) the `Tuple.prototype` methods from the Record and Tuple [proposal](https://github.com/tc39/proposal-record-tuple/blob/main/README.md) (disabled by default).


### ⚡ WASM features

* We landed more [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1708743) adding [support](https://bugzilla.mozilla.org/show_bug.cgi?id=1750846) for AVX2 instructions.
* Relaxed SIMD is now [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1748807) by default in Firefox Nightly builds.


### ❇️ Stencil

[Stencil](https://bugzilla.mozilla.org/show_bug.cgi?id=1601332) is our project to create an explicit interface between the frontend (parser, bytecode emitter) and the rest of the VM, decoupling those components. This lets us improve web-browsing performance, simplify a lot of code and improve bytecode caching.


* We [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1745664) more [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1746380) to simplify and [optimize](https://bugzilla.mozilla.org/show_bug.cgi?id=1758088) the JS string and atom code after we completed the switch to Stencil.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1715976) a mechanism to allow delazifying functions off-thread based on the Stencil.


### 🚿DOM Streams

We're [moving](https://bugzilla.mozilla.org/show_bug.cgi?id=1730556) our implementation of the [Streams specification](https://streams.spec.whatwg.org/) out of SpiderMonkey into the DOM. This lets us take advantage of Gecko's WebIDL machinery, making it much easier for us to implement this complex specification in a standards-compliant way and stay up-to-date. 


* We've [switched](https://bugzilla.mozilla.org/show_bug.cgi?id=1752206) Firefox to use the DOM implementation of ReadableStream.
* We've [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1755391) the incomplete implementation of WritableStream and pipeTo in SpiderMonkey, because we'll implement these features outside the JS engine too.


### 🚀 JIT optimizations

* Contributors from Loongson [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1746350) a new JIT/Wasm backend for LoongArch64.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1753633) a new property caching mechanism to optimize megamorphic property lookups from JIT code better. This improves performance for frameworks like React.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1752281) CacheIR optimization support for null/undefined/bool values for unary and binary arithmetic operators.
* We [reimplemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1755489) `Array.prototype.indexOf` (and `lastIndexOf`, `includes`) in C++.


### 🏎️ Performance

* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1755053) the representation of Wasm exceptions and Wasm tag objects.
* We [reverted](https://bugzilla.mozilla.org/show_bug.cgi?id=1753061) a number of Wasm `call_indirect` changes after we discovered various problems with it and then [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1754377) a simpler optimization for it.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1751162) heuristics for nursery collection to shrink the nursery if collections take a long time.
* We [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1755534) more unnecessary checks for permanent atoms from the string marking code.
* We now [trigger](https://bugzilla.mozilla.org/show_bug.cgi?id=1661293) major GCs during idle time if we are nearing a memory usage threshold, to avoid forcing a later GC at a bad time when we hit the actual threshold.
* We optimized certain Firefox DevTools operations with a [new](https://bugzilla.mozilla.org/show_bug.cgi?id=1756941) debugger API.


### 📚 Miscellaneous

* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1749298) a memory leak involving `FinalizationRegistry` that affected certain websites.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1746090) the rooting hazard static analysis to avoid a class of false positives involving reference counted values.
* We [switched](https://bugzilla.mozilla.org/show_bug.cgi?id=1749665) the atomic operation intrinsics to inline assembly. This allowed us to add a mechanism to [disable](https://bugzilla.mozilla.org/show_bug.cgi?id=1732362) the JIT backend completely in certain Firefox processes, which let us [improve](https://bugzilla.mozilla.org/show_bug.cgi?id=1734470) the sandbox.

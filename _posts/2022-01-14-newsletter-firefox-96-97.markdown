---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 96-97)"
date:   2022-01-14 15:00:00 +0100
---

SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 96 and 97 Nightly release cycles.


### 👷🏽‍♀️ JS features



* Contributor Nicolò Ribaudo [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1730843) the [Records/tuples proposal](https://github.com/tc39/proposal-record-tuple) (disabled by default).
* Contributor Jake Champion [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1566146) the [New Set methods](https://github.com/tc39/proposal-set-methods) proposal (disabled by default).
* Contributor Jonatan Klemets [finished](https://bugzilla.mozilla.org/show_bug.cgi?id=1736060) the implementation of [Import Assertions](https://github.com/tc39/proposal-import-assertions).


### ⚡ WebAssembly



* We landed the last bits of [exception handling](https://bugzilla.mozilla.org/show_bug.cgi?id=1695715)
* We [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1742383) support for [Memory64](https://github.com/WebAssembly/memory64/blob/main/proposals/memory64/Overview.md) by default in Nightly.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1713092) compiler [optimizations](https://bugzilla.mozilla.org/show_bug.cgi?id=1716580) for certain Int64 operations in the JIT backend.
* We're [experimenting](https://bugzilla.mozilla.org/show_bug.cgi?id=1708743) with AVX2 support to [optimize](https://bugzilla.mozilla.org/show_bug.cgi?id=1747304) SIMD code better.
* We [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1639153) various [optimizations](https://bugzilla.mozilla.org/show_bug.cgi?id=1743586) to speed up indirect calls.
* We [randomized](https://bugzilla.mozilla.org/show_bug.cgi?id=1744943) stub placement to avoid icache thrashing.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1747265) a performance cliff in the instruction reordering pass that slowed down compilation of certain modules.


### ❇️ Stencil

[Stencil](https://bugzilla.mozilla.org/show_bug.cgi?id=1601332) is our project to create an explicit interface between the frontend (parser, bytecode emitter) and the rest of the VM, decoupling those components. This lets us improve web-browsing performance, simplify a lot of code and improve bytecode caching.



* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1734098) the off-thread compilation APIs to work with stencils instead of scripts.
* Now that all off-thread parsing works with Stencils, we were able to remove a lot of complicated code: the off-thread parse [global](https://bugzilla.mozilla.org/show_bug.cgi?id=1655768), the atom table [lock](https://bugzilla.mozilla.org/show_bug.cgi?id=538450), [support](https://bugzilla.mozilla.org/show_bug.cgi?id=1611437) for off-thread GC allocations, and [parts](https://bugzilla.mozilla.org/show_bug.cgi?id=1743519) of the XDR code. This is a significant milestone for the team.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1721849) a mechanism to compile lazy functions based on a Stencil. This will let us delazify functions off-thread which is a new capability for the engine.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1722962) and simplified the creation of permanent atoms on startup.

With these changes, we have completed our overhaul of the parser to the Stencil format. This included removing tricky off-thread GC allocations, replacing our bytecode format, decoupling the parser output from specific globals/documents, redesigning self-hosted JS, cleaning up internal representations of scripts, and cleaning up how script delazification works. Overall this has reduced memory usage (particularly for browser-internal JS), removed a lot of complexity and made the parser architecture more robust. This unlocks interesting future opportunities for better caching, scheduling, and speculation within the browser’s script-loader.


### 🚿DOM Streams

We're [moving](https://bugzilla.mozilla.org/show_bug.cgi?id=1730556) our implementation of the [Streams specification](https://streams.spec.whatwg.org/) out of SpiderMonkey into the DOM. This lets us take advantage of Gecko's WebIDL machinery, making it much easier for us to implement this complex specification in a standards-compliant way and stay up-to-date. 

A complete implementation of ReadableStreams is under review, and we are working on making sure that the transition between the JS implementation and DOM implementation goes smoothly and invisibly. In parallel, contributor Tom Schuster has [contributed an implementation of WritableStreams](https://bugzilla.mozilla.org/show_bug.cgi?id=1735664) and is [working on the pipeTo algorithm](https://bugzilla.mozilla.org/show_bug.cgi?id=1734241). 


### 🌍 Unified Intl implementation 

Work is underway to [unify](https://bugzilla.mozilla.org/show_bug.cgi?id=1686965) the Intl (Internalization) code in SpiderMonkey and the rest of Gecko as a shared `mozilla::intl` component. This results in less code duplication and will make it easier to [migrate](https://bugzilla.mozilla.org/show_bug.cgi?id=1713916) from the ICU library to [ICU4X](https://github.com/unicode-org/icu4x) in the future. 



* We unified the implementation of [DisplayNames](https://bugzilla.mozilla.org/show_bug.cgi?id=1719735).


### 🚀 JIT optimizations



* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1743612) IC support for adding properties to objects with an addProperty hook. This speeds up adding properties to DOM objects.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1131996) support for out-of-bounds accesses on optimized-out `arguments` objects.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1739610) code generation for derived class constructors by improving code folding.
* We added [array](https://bugzilla.mozilla.org/show_bug.cgi?id=1739650) and [arguments](https://bugzilla.mozilla.org/show_bug.cgi?id=1740737) scalar replacement for spread calls.
* We also [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1700398) scalar replacement support for rest-parameters.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1739660) Warp transpiler support for spread-new and spread-super calls.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1742594) the in-operator for `arguments` objects.


### 🏎️ Performance



* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1736841) helper thread task scheduling by deprioritizing JIT compilation tasks when no JS is running.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1739396) some issues that caused us to underestimate the nursery promotion rate.
* We [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1740745) some unnecessary checks from GC barriers.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1742127) arena unmarking to avoid locking overhead.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1672121) support for interruptible GC slice budgets.
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1744208) the nursery's fixup list to add items to the front instead of the back, to improve cache locality for nursery collections.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1744770) heuristics for decommitting memory to decommit less when allocating a lot of memory.


### 📚 Miscellaneous



* We [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1738422) ICU to version 70.
* We [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1724123) our implementation of async generators to reflect the latest spec changes.
* We [cleaned up](https://bugzilla.mozilla.org/show_bug.cgi?id=1740053) the VMFunction type definitions and templates.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1742142) a [lot](https://bugzilla.mozilla.org/show_bug.cgi?id=1742628) of header file includes to improve compilation times.

---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 110-111)"
date:   2023-02-16 20:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 110 and 111 Nightly release cycles.


### 🛠️ RISC-V backend
SpiderMonkey now [has](https://bugzilla.mozilla.org/show_bug.cgi?id=1800431) a JIT/Wasm backend for the 64-bit [RISC-V](https://en.wikipedia.org/wiki/RISC-V) architecture! This port was contributed by [PLCT Lab](https://plctlab.github.io/) and they'll also be maintaining it going forward. Adding a backend for a new platform is a lot of work so we're grateful to them for making SpiderMonkey run well on this exciting new architecture.


### 🚀 Performance
We're working on improving performance for popular web frameworks such as React. We can't list all of these improvements here, but the list below covers some of this work.

* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1799025) an optimization for property accesses inside a for-in loop. This lets us avoid slower megamorphic property lookups in React and other frameworks.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1809359) megamorphic property gets/sets [more](https://bugzilla.mozilla.org/show_bug.cgi?id=1807159).
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1808673) atomization more to avoid flattening ropes in certain cases.
* We [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1795640) more improvements for our GC's parallel marking implementation. We're currently performing some experiments to evaluate its performance.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1810688) some performance issues with the ARM64 fast paths for truncating doubles.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1812055) some fast paths for objects/arrays to structured clone reading.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1810299) support for optimizing more relational comparison types with CacheIR.


### ⚙️ Modernizing JS modules
We're working on improving our implementation of modules. This includes supporting modules in Workers, adding support for Import Maps, and ESMification (replacing the JSM module system for Firefox internal JS code with standard ECMAScript modules).

* As of this week, there are more ESM modules than JSM modules 🎉. See the AreWeESMifiedYet [website](https://spidermonkey.dev/areweesmifiedyet/) for the status of ESMification. 
* We've [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1247687) some large changes to the DOM Worker code to add support for modules. We're now working on extending this support to shared workers and enabling it by default.
* We [continue](https://bugzilla.mozilla.org/show_bug.cgi?id=1806136) to [improve](https://bugzilla.mozilla.org/show_bug.cgi?id=1808572) our modules implementation to be more efficient and easier to work with.


### ⚡ Wasm GC
High-level programming languages currently need to bring their own GC if they want to run on WebAssembly. This can result in memory leaks because it cannot collect cycles that form with the browser. The Wasm GC [proposal](https://github.com/WebAssembly/gc/blob/main/proposals/gc/Overview.md) adds struct and array types to Wasm so these languages can use the browser's GC instead.

* We [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1808613) enough changes to be able to run a Dart Wasm GC benchmark. We then profiled this benchmark and [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1811024) various [performance](https://bugzilla.mozilla.org/show_bug.cgi?id=1812283) problems.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1811368) struct and array allocation.
* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1803826) a constant-time algorithm for downcasting types.
* We [used](https://bugzilla.mozilla.org/show_bug.cgi?id=1803381) signal handlers to remove more null pointer checks.


### 💾 Robust Caching
We're working on better (in-memory) caching of JS scripts based on the new Stencil format. This will let us integrate better with other resource caches used in Gecko and might also allow us to potentially cache JIT-related hints in the future.

The team is currently working on [removing](https://bugzilla.mozilla.org/show_bug.cgi?id=1759123) the dependency on `JSContext` for off-thread parsing. This will make it easier to integrate with browser background threads and will let us further simplify and optimize the JS engine.

* A lot of changes landed the past weeks to stop using `JSContext` in the bytecode [emitter](https://bugzilla.mozilla.org/show_bug.cgi?id=1814550), the [parser](https://bugzilla.mozilla.org/show_bug.cgi?id=1805622), and many [other](https://bugzilla.mozilla.org/show_bug.cgi?id=1808881) data structures.


### 📚 Miscellaneous
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1811355) our `perf` jitdump support by annotating more trampoline code.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1811411) profiler markers for discarding JIT code.
* We fixed some devtools problems with eager evaluation of [getters](https://bugzilla.mozilla.org/show_bug.cgi?id=1806598) and [async](https://bugzilla.mozilla.org/show_bug.cgi?id=1815152) functions.

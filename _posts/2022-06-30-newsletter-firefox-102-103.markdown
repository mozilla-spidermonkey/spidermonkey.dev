---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 102-103)"
date:   2022-06-30 19:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 102 and 103 Nightly release cycles.


### 👷🏽‍♀️ New features



* We've [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1704385) the array `findLast`/`findLastIndex` [proposal](https://github.com/tc39/proposal-array-find-from-last) (disabled by default).
* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1556604) support for structured cloning of `Error` objects.
* We've [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1764646) WebAssembly relaxed SIMD [dot-instructions](https://github.com/WebAssembly/relaxed-simd/issues/52).


### ⚙️ Modernizing JS modules

We're working on improving our implementation of modules. This includes supporting modules in Workers, adding support for Import Maps, and ESMification (replacing the JSM module system for Firefox internal JS code with standard ECMAScript modules).



* See the ESMification [update](https://groups.google.com/a/mozilla.org/g/dev-platform/c/Dr2OVHL2ZSk) sent to dev-platform for the status of that project.
    * We [removed use of `globalThis`](https://bugzilla.mozilla.org/show_bug.cgi?id=1607331) to prepare for moving to ESM.
    * We [added support](https://bugzilla.mozilla.org/show_bug.cgi?id=1771092) for ESMs in ChromeUtils.registerWindowActor.
    * We [added support](https://bugzilla.mozilla.org/show_bug.cgi?id=1768870) for lazy loading ESMs.
    * We added linting and [cleaned up](https://bugzilla.mozilla.org/show_bug.cgi?id=1610653) use of `this` for lazy getters.
    * We [introduced a shim](https://bugzilla.mozilla.org/show_bug.cgi?id=1766761) to make the transition to ESM as painless as possible.
* We implemented a prototype of [ImportMaps](https://bugzilla.mozilla.org/show_bug.cgi?id=1688879).
* We refactored both the [representation of scripts](https://bugzilla.mozilla.org/show_bug.cgi?id=1764596) and [the loader](https://bugzilla.mozilla.org/show_bug.cgi?id=1764598) itself. 


### ⏱️ Profiler support

We've collaborated with the performance team to improve support for external profilers such as perf on Linux:



* The performance team has [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1759173) support for perf's jitdump format. This makes it possible to see JS functions in perf profiles. It also lets us annotate assembly code with LIR and CacheIR instruction names.
* We made [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1771085) to the JITs to preserve and use frame pointers for all JIT frames. Profilers such as perf (and other stack unwinders) are now able to reliably unwind through JIT frames by following frame pointers.
* We've simplified and [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1774390) code in the JITs by taking advantage of frame pointers.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1774848) an issue with the C++ interpreter's profiler instrumentation for resumed async functions and generators. This could result in missing frames in the Firefox profiler.


### 🚀 JS Performance



* We've [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1766730) the bytecode we generate for `try-finally` to support functions with `finally` blocks in the optimizing JIT. This fixes an old performance cliff.
* We've [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1767966) the code we generate for test expressions.
* More typed array builtins that use a callback function are now [marked](https://bugzilla.mozilla.org/show_bug.cgi?id=1774049) as inlinable.
* We've [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1765358) arguments-object allocation for inlined functions.
* We've [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1770509) a new bytecode instruction for closing iterators, to reduce bytecode size for for-of loops.
* We've [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1774796) more [optimizations](https://bugzilla.mozilla.org/show_bug.cgi?id=1773682) for concurrent delazification (disabled by default).


### 🏎️ WebAssembly Performance



* We've [re-enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1763645) code caching with a new serialization system.
* We've [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1690538) more [optimizations](https://bugzilla.mozilla.org/show_bug.cgi?id=1693500) for SIMD instructions.
* We've [replaced](https://bugzilla.mozilla.org/show_bug.cgi?id=1772282) some uses of splay trees with AVL trees to improve compilation time.
* We've [reduced](https://bugzilla.mozilla.org/show_bug.cgi?id=1442544) the offset guard memory reservation from 2 GB to 32 MB. This shrinks the amount of virtual memory we reserve for Wasm code by 33%.


### 📚 Miscellaneous



* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1772587) a [checklist](https://firefox-source-docs.mozilla.org/js/feature_checklist.html) for implementing new JS language features.
* We've [imported](https://bugzilla.mozilla.org/show_bug.cgi?id=1769093) the latest version of Test262.
* We've [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1771747) tracking and assertions for the GC retained heap size.
* We've [migrated](https://bugzilla.mozilla.org/show_bug.cgi?id=1770158) our string-to-double code to use the modern double-conversion library instead of our old dtoa.c fork.
* We've [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1769518) support for `Rooted<Result<V,E>>`.
* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1771315) a command-line argument to the JS shell for setting GC parameters.
* We've [started](https://bugzilla.mozilla.org/show_bug.cgi?id=1773368) to [remove](https://bugzilla.mozilla.org/show_bug.cgi?id=1773778) typedefs for various GC types. For example, we now use `Rooted<Shape*>` instead of the old `RootedShape` typedef.
* We've [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1772894) telemetry for full GCs to be more useful.

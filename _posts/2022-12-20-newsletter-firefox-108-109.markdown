---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 108-109)"
date:   2022-12-20 17:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 108 and 109 Nightly release cycles.

The SpiderMonkey team is proud of everything we accomplished this year. Happy Holidays!

### 👷🏽‍♀️ New features

* We've [shipped](https://bugzilla.mozilla.org/show_bug.cgi?id=1795647) Import Maps in Firefox 108.
* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1795452) `Array.fromAsync` (disabled by default).
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1797933) [support](https://bugzilla.mozilla.org/show_bug.cgi?id=1796315) for [more](https://bugzilla.mozilla.org/show_bug.cgi?id=1803043) Wasm GC instructions (disabled by default).
* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1793959) more parts of the decorators proposal (disabled by default).


### ⚙️ Modernizing JS modules

We're working on improving our implementation of modules. This includes supporting modules in Workers, adding support for Import Maps, and ESMification (replacing the JSM module system for Firefox internal JS code with standard ECMAScript modules).

* See the AreWeESMifiedYet [website](https://spidermonkey.dev/areweesmifiedyet/) for the status of ESMification.
* We [modernized](https://bugzilla.mozilla.org/show_bug.cgi?id=1804254) the module implementation to use more native C++ data structures instead of JS objects.

### 💾 Robust Caching

We're working on better (in-memory) caching of JS scripts based on the new Stencil format. This will let us integrate better with other resource caches used in Gecko and might also allow us to potentially cache JIT-related hints.

The team is currently working on [removing](https://bugzilla.mozilla.org/show_bug.cgi?id=1759123) the dependency on `JSContext` for off-thread parsing. This will make it easier to integrate with browser background threads and will further simplify the JS engine.

* We [converted](https://bugzilla.mozilla.org/show_bug.cgi?id=1782573) more code to use `ErrorContext` for allocations.
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1786834) [some](https://bugzilla.mozilla.org/show_bug.cgi?id=1797024) data structures to use global singletons instead of `JSContext`.


### 🚀 Performance

We continue to look for performance wins in a variety of areas to improve Speedometer and related benchmarks, as well as websites that are utilizing a lot of JavaScript code.

* We [inlined](https://bugzilla.mozilla.org/show_bug.cgi?id=1794439) the megamorphic has-property cache lookup directly in JIT code.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1671228) an optimization to fold multiple IC stubs if they're all identical except for a single shape guard. This [improves](https://bugzilla.mozilla.org/show_bug.cgi?id=1671228#c25) performance for polymorphic property accesses.
* We [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1795848) a lot of unnecessary C++ heap allocations in the IC code.
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1798284) the `Cell` header word to be non-atomic, to improve C++ code generation.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1262212) JIT inlining for `new Object()`.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1384562) a fast path for plain objects to `OrdinaryToPrimitive`.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1792228) shape guards for objects on the prototype to have fewer memory loads.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1799490) JIT inlining for the `.size` getter on `Map` and `Set`.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1799028) an optimization to cache for-in iterators on the shape.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1669942) `charAt` and `charCodeAt` JIT optimizations to support rope strings and out-of-bounds [indexes](https://bugzilla.mozilla.org/show_bug.cgi?id=1801865).
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=815255) JIT inlining for `parseInt`.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1799628) string-to-atom performance by caching recently atomized strings.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1802497) JIT inlining for `Number.prototype.toString` when called with a `base` argument.
* We [eliminated](https://bugzilla.mozilla.org/show_bug.cgi?id=1800384) redundant guards when adding multiple properties to an object.
* We [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1797755) a lot of changes to [implement](https://bugzilla.mozilla.org/show_bug.cgi?id=1802897) parallel marking in our GC (disabled by default).
* We [used](https://bugzilla.mozilla.org/show_bug.cgi?id=1799971) signal handlers to optimize null checks in Wasm GC code.
* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1798970) support for FMA3 instructions for Wasm Relaxed SIMD.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1599800) performance for growing Wasm tables by small amounts.


### 📚 Miscellaneous
* We [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1795914) the Streams implementation from SpiderMonkey, now that it's implemented outside the JS engine.
* The fuzzing team [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1794784) some code to improve differential testing with the Fuzzilli JS fuzzer.
* We [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1801875) the profiler's global JIT code table by reusing our `AvlTree` data structure instead of using a custom skip list implementation.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1804253) our `Shape` data structures to [use](https://bugzilla.mozilla.org/show_bug.cgi?id=1804394) derived classes more to improve type safety and to simplify future changes.

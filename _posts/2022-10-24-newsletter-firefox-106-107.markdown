---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 106-107)"
date:   2022-10-24 17:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 106 and 107 Nightly release cycles.


### 👷🏽‍♀️ New features
* We've [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1775424) support for module `import.meta.resolve` (disabled by default).
* We're working on [implementing](https://bugzilla.mozilla.org/show_bug.cgi?id=1774840) [more](https://bugzilla.mozilla.org/show_bug.cgi?id=1784156) Wasm GC instructions (disabled by default).


### ⚙️ Modernizing JS modules
We're working on improving our implementation of modules. This includes supporting modules in Workers, adding support for Import Maps, and ESMification (replacing the JSM module system for Firefox internal JS code with standard ECMAScript modules).

* See the AreWeESMifiedYet [website](https://spidermonkey.dev/areweesmifiedyet/) for the status of ESMification.


### 💾 Robust Caching
We're working on better (in-memory) caching of JS scripts based on the new Stencil format. This will let us integrate better with other resource caches used in Gecko and might also allow us to potentially cache JIT-related hints.

The team is currently working on [removing](https://bugzilla.mozilla.org/show_bug.cgi?id=1759123) the dependency on `JSContext` for off-thread parsing. This will make it easier to integrate with browser background threads and will further simplify the JS engine.

* We're [refactoring](https://bugzilla.mozilla.org/show_bug.cgi?id=1786494) exception handling in the frontend to be less dependent on JSContext.
* We've [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1788977) the Stencil APIs for off-thread parsing.


### 🚀 Performance
* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1786506) a separate GC Zone for shared permanent things. This allowed us to make some fields non-atomic.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1789457) the megamorphic cache by inlining certain cache lookups in JIT code.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1779940) a performance cliff in the frontend with concurrent delazification enabled.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1786844) scalar replacement of 'call objects' to work again.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1341937) performance of lexical environment objects.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1788039) bytecode generated for certain post-increment/decrement operations.
* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1564347) JIT inlining of `String.prototype.toLowerCase` based on a lookup table.
* We simplified and [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1790012) the object slots (re)allocation code.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1790791) a fast path for megamorphic property set/add for plain objects.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1791162) code in the JITs for adding new dense elements to objects.


### 📚 Miscellaneous
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1746699) GC allocations to avoid undefined behavior.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1788779) an API for the Firefox profiler to access JIT code.
* We [cleaned up](https://bugzilla.mozilla.org/show_bug.cgi?id=1785776) Wasm GC objects.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1778945) more documentation for the register allocator.
* We [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1783555) irregexp to the latest version.
* We [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1787554) [wast](https://crates.io/crates/wast) to the latest version. 
* We [cleaned up](https://bugzilla.mozilla.org/show_bug.cgi?id=1789243) a lot of code in the frontend.

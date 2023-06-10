---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 114-115)"
date:   2023-06-09 18:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 114 and 115 Nightly release cycles.

### 🚀 Performance

We're working on improving performance for popular web frameworks such as React. We can't list all of these improvements here, but the list below covers some of this work.



* We've [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1827338) more [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1828496) to improve the hit rate of the JIT megamorphic set-property cache.
* We've [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1828455) unique ids for objects: we can now store them in the object's slots instead of in the external hash table. We also [inlined](https://bugzilla.mozilla.org/show_bug.cgi?id=1832044) more of the lookup code.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1824772) a JIT hints mechanism to cache information about Baseline JIT compilations within a process.
* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1830773) frame pointers to compiled regular expression code to improve performance profiles.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1809189) a reported Wasm multi-threading performance issue on Apple M1 by using new ARM64 atomic instructions when available.
* We've [ported](https://bugzilla.mozilla.org/show_bug.cgi?id=1827258) `Array.prototype.concat` from self-hosted JS code to C++. The new implementation is a lot faster especially for arrays with many elements.
* We've also [rewritten](https://bugzilla.mozilla.org/show_bug.cgi?id=1831314) some regular expression builtins in C++. The fast paths we had for Ion are now also [used](https://bugzilla.mozilla.org/show_bug.cgi?id=1833624) in Baseline.
* We [moved](https://bugzilla.mozilla.org/show_bug.cgi?id=1833484) an optimization for constant global names like `undefined` from the JITs to the bytecode emitter, so that these are also optimized in the interpreters.
* We've [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1827918) the nursery object allocation code more to make it easier to [add](https://bugzilla.mozilla.org/show_bug.cgi?id=1827810) a fast path for this.


### 👷🏽‍♀️ New features



* We're [shipping](https://bugzilla.mozilla.org/show_bug.cgi?id=1795816) `Array.fromAsync` in Firefox 115.
* We're also [shipping](https://bugzilla.mozilla.org/show_bug.cgi?id=1811057) the ['Change Array By Copy proposal'](https://github.com/tc39/proposal-change-array-by-copy) in Firefox 115.
* We've [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1825005) the `isWellFormed` and `toWellFormed` [functions](https://github.com/tc39/proposal-is-usv-string) for strings (disabled by default).


### ⚡ Wasm GC

High-level programming languages currently need to bring their own GC if they want to run on WebAssembly. This can result in memory leaks because it cannot collect cycles that form between browser objects and the Wasm code. The Wasm GC [proposal](https://github.com/WebAssembly/gc/blob/main/proposals/gc/Overview.md) adds struct and array types to Wasm so these languages can use the browser's GC instead.



* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1819215) function subtyping.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1827952) new encodings for cast instructions.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1832296) allocation of Wasm GC structs more.
* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1799713) and [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1830155) the generalized casting instructions


### ⚙️ Modernizing JS modules

We're working on improving our implementation of modules. This includes supporting modules in Workers, adding support for Import Maps, and ESMification (replacing the JSM module system for Firefox internal JS code with standard ECMAScript modules).



* See the AreWeESMifiedYet [website](https://spidermonkey.dev/areweesmifiedyet/) for the status of ESMification. As of this week, more than 90% of modules have been ESMified 🎉
* We've [shipped](https://bugzilla.mozilla.org/show_bug.cgi?id=1812591) worker modules in Firefox 114.


### 📚 Miscellaneous



* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1439800) support for more formats to the date parser, to fix web compatibility issues.
* We've [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1830154) the `JSContext` dependency for off-thread parsing and [also](https://bugzilla.mozilla.org/show_bug.cgi?id=1804073) for the JSON parser. This lets us parse JS and JSON on background threads with very little overhead.
* We've [rewritten](https://bugzilla.mozilla.org/show_bug.cgi?id=1832582) some C++ code to work around a CPU issue that caused Firefox crashes on Intel Atom D2000/N2000 CPUs.

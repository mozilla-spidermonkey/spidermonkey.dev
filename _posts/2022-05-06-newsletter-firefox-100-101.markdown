---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 100-101)"
date:   2022-05-06 18:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 100 and 101 Nightly release cycles.

### 👷🏽‍♀️ New features
* `WritableStream` and `pipeTo` are now [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1759597) by default (Firefox 100)
* Wasm [exception handling](https://github.com/WebAssembly/exception-handling/blob/main/proposals/exception-handling/Exceptions.md) has been [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1759217) by default (Firefox 100)


### ⚙️Modernizing JS modules
We're working on improving our implementation of modules. This includes supporting modules in Workers, adding support for Import Maps, and ESM-ification (replacing the JSM module system for Firefox internal JS code with standard ECMAScript modules).

* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1436400) support for caching module scripts in the bytecode cache.
* We [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1752212) support for caching modules in the StartupCache.
* We've [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1759881) many [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1766274) to improve the browser's module loader code.
* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1763372) a common base class to work towards supporting modules in Workers.
* We’ve landed a [cleanup](https://bugzilla.mozilla.org/show_bug.cgi?id=1764596) for the Worker Script Loader.


### 🚀 JS Performance
* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=885514) support for functions with simple try-finally blocks to the optimizing JIT, fixing a very old performance cliff. Support for more complicated cases will be added in a later release.
* We've improved `instanceof` performance by removing the non-standard `JSClass` [hook](https://bugzilla.mozilla.org/show_bug.cgi?id=1270746), proxy [trap](https://bugzilla.mozilla.org/show_bug.cgi?id=1760844), and by [optimizing](https://bugzilla.mozilla.org/show_bug.cgi?id=1763351) polymorphic cases better in the JITs.
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1760605) how `function.call` and `function.apply` are [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1760989). This is more robust and fixes some performance cliffs.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1738413) support for optimizing builtin functions in CacheIR when called through `function.call`.
* We used this to [optimize](https://bugzilla.mozilla.org/show_bug.cgi?id=1765397) the common `slice.call(arguments)` pattern in the JITs.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1763592) certain calls into C++ from optimized JIT code by removing (unnecessary) dynamic stack alignment.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1763831) CacheIR support for property-init operations.
* We [reimplemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1282976) `new.target` as a real binding.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1765779) support for scalar replacement of array iterator objects.


### 🏎️ WebAssembly Performance
* We [moved](https://bugzilla.mozilla.org/show_bug.cgi?id=1680243) trap instructions out-of-line to improve branch prediction.
* We [merged](https://bugzilla.mozilla.org/show_bug.cgi?id=1753692) `wasm::Instance` and `TlsData`. This eliminates some memory loads.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1756739) Baseline code performance by pinning the Instance/TLS register on most platforms.
* We fixed some DevTools performance issues: opening the web console [no longer](https://bugzilla.mozilla.org/show_bug.cgi?id=1719615) results in using slower debugging code for Wasm modules and we [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1756951) debugging support to not clone Wasm code.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1762413) a common instruction sequence with SIMD instructions.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1757244) AVX support for all binary SIMD operations.
* We [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1759909) support for AVX instructions for Wasm SIMD on Nightly.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1642412) `table.get/set` for anyref tables.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1737266) `memory.copy/fill` for Memory64.


### 📚 Miscellaneous
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1762933) a number of compiler errors when compiling in C++20 mode.
* We've [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1763783) ICU to version 71.
* We [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1766844) a workaround for a glibc pthreads [bug](https://sourceware.org/bugzilla/show_bug.cgi?id=25847) that was causing intermittent hangs in CI for JS shell tests on Linux.
* We [stopped](https://bugzilla.mozilla.org/show_bug.cgi?id=1763103) using extended functions for most class methods, to reduce memory usage.

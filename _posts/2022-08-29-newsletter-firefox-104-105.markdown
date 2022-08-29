---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 104-105)"
date:   2022-08-29 17:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 104 and 105 Nightly release cycles.

### 👷🏽‍♀️ New features

* We've [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1767525) the `ShadowRealms` [proposal](https://github.com/tc39/proposal-shadowrealm/blob/main/explainer.md) (disabled by default).
* We've [shipped](https://bugzilla.mozilla.org/show_bug.cgi?id=1775026) the array `findLast` and `findLastIndex` functions (Firefox 104).
* We've [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1780545) range restrictions from various `Intl` objects to match spec changes.

Features that are in progress:
* We've [started](https://bugzilla.mozilla.org/show_bug.cgi?id=1783738) to implement the decorator [proposal](https://github.com/tc39/proposal-decorators).
* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1774840) more instructions for the Wasm GC [proposal](https://github.com/WebAssembly/gc/blob/main/proposals/gc/Overview.md) (disabled by default).
* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1655626) more instructions and optimizations for the Wasm function references [proposal](https://github.com/WebAssembly/function-references/blob/master/proposals/function-references/Overview.md) (disabled by default).
* We [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1774829) support for Wasm runtime types because this was removed from the spec.

### ⚙️ Modernizing JS modules

We're working on improving our implementation of modules. This includes supporting modules in Workers, adding support for Import Maps, and ESMification (replacing the JSM module system for Firefox internal JS code with standard ECMAScript modules).

* See the AreWeESMifiedYet [website](https://spidermonkey.dev/areweesmifiedyet/) for the status of ESMification.
* We've [ported](https://bugzilla.mozilla.org/show_bug.cgi?id=1774454) the module implementation from self-hosted JS to C++.
* We've made a [lot](https://bugzilla.mozilla.org/show_bug.cgi?id=1779421) of [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1779247) to the rewritten code to match the latest version of the spec better.


### 💾 Robust Caching

We're working on better (in-memory) caching of JS scripts based on the new Stencil format. This will let us integrate better with other resource caches used in Gecko, hit the cache in more cases, and will open the door to potentially cache JIT-related hints.

The team is currently working on [removing](https://bugzilla.mozilla.org/show_bug.cgi?id=1759123) the dependency on `JSContext` for off-thread parsing. This will make it easier to integrate with browser background threads and will further simplify the JS engine.

* We've [introduced](https://bugzilla.mozilla.org/show_bug.cgi?id=1773324) `ErrorContext` for reporting errors without using `JSContext`.
* We're now [using](https://bugzilla.mozilla.org/show_bug.cgi?id=1782569) `ErrorContext` to report out-of-memory exceptions in the frontend.
* We're now [using](https://bugzilla.mozilla.org/show_bug.cgi?id=1783935) `ErrorContext` to report allocation-overflow exceptions in the frontend.
* We've [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1781008) the over-recursion checks in the frontend to not depend on `JSContext`.


### 🚀 Performance

* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1782770) and reduced the size of Wasm metadata.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1774733) `StringBuffer` by reducing the number of memory (re)allocations.
* The performance team added SIMD optimizations to speed up some [string](https://bugzilla.mozilla.org/show_bug.cgi?id=1776013) and [array](https://bugzilla.mozilla.org/show_bug.cgi?id=1779807) builtins.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1782677) iterators used in self-hosted code to avoid some extra allocations.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1777222) the object allocation code more. This made the JSON parsing benchmark more than 30% [faster](https://bugzilla.mozilla.org/show_bug.cgi?id=1777222#c6).
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1779378) some [places](https://bugzilla.mozilla.org/show_bug.cgi?id=1779571) to [avoid](https://bugzilla.mozilla.org/show_bug.cgi?id=1779733) unnecessary GC tenuring.
* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1770768) a simpler heuristic for the GC heap limit and resizing (disabled by default).
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1782487) a performance cliff for certain objects with sparse elements.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1782959) some [optimizations](https://bugzilla.mozilla.org/show_bug.cgi?id=1784023) to inline the string `startsWith` and `endsWith` functions in the JIT in certain cases.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1782771) the code generated for string substring operations.
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1773434) our optimizing compiler to use frame pointer relative addressing (instead of stack pointer relative) for JS and Wasm code on x86/x64.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1774178) a browser pref (disabled by default) for disabling Spectre JIT mitigations in isolated Fission content processes.


### 📚 Miscellaneous

* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1609432) some [issues](https://bugzilla.mozilla.org/show_bug.cgi?id=1781061) with instant evaluation in the web console, to avoid unwanted side-effects from higher order self-hosted functions.
* The profiler team has [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1749521) labels to more builtin functions.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1782188) a bug that could result in missing stack frames in the profiler.
* We [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1776931) our telemetry code to be less error-prone and easier to work with.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1775254) `Math.pow` accuracy for large exponents.
* We [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1777529) the unmaintained TraceLogger integration.
* We [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1779849) our copy of irregexp to the latest upstream code.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1782212) more [linting](https://bugzilla.mozilla.org/show_bug.cgi?id=1783422) and code [formatting](https://bugzilla.mozilla.org/show_bug.cgi?id=1782273) for self-hosted code.
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1778077) non-Wasm `SharedArrayBuffer` to use `calloc` instead of mapped memory. This uses less memory and [avoids](https://bugzilla.mozilla.org/show_bug.cgi?id=1689948) out-of-memory exceptions in some cases.

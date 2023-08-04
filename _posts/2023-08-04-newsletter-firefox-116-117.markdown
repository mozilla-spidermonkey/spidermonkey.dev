---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 116-117)"
date:   2023-08-04 18:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 116 and 117 Nightly release cycles.

### 🚀 Performance

We're working on improving performance for popular web frameworks such as React. We can't list all of these improvements here, but the list below covers some of this work.

* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1837410) a fast path for `JSON.stringify`.
* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1838629) a fast path for allocating from the nursery in C++ code.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1839437) an optimization for `Object.keys` to take advantage of cached for-in iterators if available.
* We've [extended](https://bugzilla.mozilla.org/show_bug.cgi?id=1837192) the compilation hints mechanism to also cover Warp compilations. This means we spend less time in Baseline JIT code.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1829411) a trampoline to optimize polymorphic calls.
* We've [disabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1837602) Spectre mitigations in Fission content processes (Nightly-only for now).
* We also [disabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1835876) the use of `mprotect` for JIT code because this added significant performance overhead even though bypasses have been commoditized and this didn't significantly impact attackers.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1839078) a performance cliff with Warp-compiled generators.
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1837620) some GC pointers in IC stubs to be weak pointers to reclaim more memory and to discard dead stubs.
* A contributor [rewrote](https://bugzilla.mozilla.org/show_bug.cgi?id=1828326) some of our date computations to be much faster by reducing the number of branches and floating point operations.

### 👷🏽‍♀️ New features

We shipped some new JS features! 🎉

* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1826574) the RegExp unicode sets [proposal](https://github.com/tc39/proposal-regexp-v-flag) (Firefox 116).
* We [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1795756) `Intl.NumberFormat` version 3 by default (Firefox 117).

We also implemented features that are still disabled by default:

* We've [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1519167) the `Temporal` [proposal](https://tc39.es/proposal-temporal/docs/).
* We've [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1841113) the `ArrayBuffer` `transfer` [proposal](https://github.com/tc39/proposal-arraybuffer-transfer).
* We [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1840644) our Iterator Helpers implementation to match the latest [proposal](https://github.com/tc39/proposal-iterator-helpers).
* We also [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1782585) support for the Wasm multi-memory [proposal](https://github.com/WebAssembly/multi-memory).

We want to give a big shout-out 📣 to André Bargull (anba) who volunteered to implement many of these features. Especially Temporal is a very large feature: André landed more than a hundred patches for it!


### ⚡ Wasm GC

High-level programming languages currently need to bring their own GC if they want to run on WebAssembly. This can result in memory leaks because it cannot collect cycles that form with the browser. The Wasm GC [proposal](https://github.com/WebAssembly/gc/blob/main/proposals/gc/Overview.md) adds struct and array types to Wasm so these languages can use the browser's GC instead.

* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1825088) support for 'final' types.
* We optimized allocation of [struct](https://bugzilla.mozilla.org/show_bug.cgi?id=1839598) and [array](https://bugzilla.mozilla.org/show_bug.cgi?id=1841266) objects more.
* We also [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1831920) casting for the remaining Wasm types.


### 📚 Miscellaneous

* The final changes [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1759123) to remove the last uses of the `JSContext` type for helper threads. This is a large architectural improvement that unblocks [exciting](https://bugzilla.mozilla.org/show_bug.cgi?id=1773339) future [improvements](https://bugzilla.mozilla.org/show_bug.cgi?id=1845074).
* We tracked down and [worked around](https://bugzilla.mozilla.org/show_bug.cgi?id=1833315) a likely Samsung CPU bug.
* We [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1843842) some code for older Windows versions because Firefox 116 will only support Windows 10+.

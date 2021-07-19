---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 90-91)"
date:   2021-07-19 16:30:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 90 and 91 Nightly release cycles.

Firefox/SpiderMonkey 91 will become the next ESR branch and will remain supported over the next year.


### 👷🏽‍♀️ JS features



* Support for Private Fields has been [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1708235) by default (Firefox 90).
* The Ergonomic Brand Checks for Private Fields [proposal](https://github.com/tc39/proposal-private-fields-in-in) has been [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1710510) (Firefox 90).
* Support for the `.at()` [proposal](https://github.com/tc39/proposal-relative-indexing-method/) has been [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1681371) by default (Firefox 90).
* `Intl.DateTimeFormat.dayPeriod` is now [available](https://bugzilla.mozilla.org/show_bug.cgi?id=1645115) (Firefox 90).
* The Error Cause [proposal](https://github.com/tc39/proposal-error-cause) has been [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1679653) (Firefox 91). This is also [supported](https://twitter.com/FirefoxDevTools/status/1414965543593988104) in our DevTools.
* The `Object.hasOwn` [proposal](https://github.com/tc39/proposal-accessible-object-hasownproperty) has been [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1711872) (Firefox 91).
* `Intl.DisplayNames` v2 has been [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1693575) (Firefox 91).
* `Intl.DateTimeFormat` support for `formatRange` and `formatRangeToParts` has been [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1653024) by default (Firefox 91).


### 🌍 Unified Intl implementation 

Work is underway to [unify](https://bugzilla.mozilla.org/show_bug.cgi?id=1686965) the Intl (Internationalization) code in SpiderMonkey and the rest of Gecko as a shared `mozilla::intl` component. This results in less code duplication and will make it easier to [migrate](https://bugzilla.mozilla.org/show_bug.cgi?id=1713916) from the ICU library to [ICU4X](https://github.com/unicode-org/icu4x) in the future. The features and behaviour of this code continue to follow the [ECMA-402](https://tc39.es/ecma402/) specification.

The past months [number formatting](https://bugzilla.mozilla.org/show_bug.cgi?id=1701695), [PluralRules](https://bugzilla.mozilla.org/show_bug.cgi?id=1704509) and [DateTimeFormat](https://bugzilla.mozilla.org/show_bug.cgi?id=1711902) have been ported to the new `mozilla::intl` code module.


### ⚡ WebAssembly



* We've [revendored](https://bugzilla.mozilla.org/show_bug.cgi?id=1703105) the SIMD test suite with a new translator.
* More of the Baseline compiler has been [templatized](https://bugzilla.mozilla.org/show_bug.cgi?id=1697371) to clean up and simplify the code.
* The Extended Constant Expressions [proposal](https://github.com/WebAssembly/extended-const/blob/master/proposals/extended-const/Overview.md) is now [supported](https://bugzilla.mozilla.org/show_bug.cgi?id=1706124).
* [More](https://bugzilla.mozilla.org/show_bug.cgi?id=1690492) SIMD operations have been [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1690462).
* ARM64 codegen has been [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1710024) more.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1712078) a performance cliff caused by the LICM optimization pass hoisting too much code out of very large loops.
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1713400) memory length values from bytes to pages to prepare for 64-bit Wasm memory.


### 🧪 WASI port

Fastly and Igalia have [upstreamed](https://bugzilla.mozilla.org/show_bug.cgi?id=1701197) an initial WASI port of SpiderMonkey. We're very excited about bringing our JS engine to new platforms and exploring the [future](https://bytecodealliance.org/articles/making-javascript-run-fast-on-webassembly) of this technology.


### ❇️ Stencil

[Stencil](https://bugzilla.mozilla.org/show_bug.cgi?id=1601332) is our project to create an explicit interface between the frontend (parser, bytecode emitter) and the rest of the VM, decoupling those components. This lets us improve web-browsing performance, simplify a lot of code and improve bytecode caching.



* We're now [using](https://bugzilla.mozilla.org/show_bug.cgi?id=1458339) shared memory to share stencils and bytecode for our self-hosted JS code (builtins implemented in JS) across content processes. This has resulted in significant [memory usage](https://bugzilla.mozilla.org/show_bug.cgi?id=1710987#c5) and [content process startup](https://bugzilla.mozilla.org/show_bug.cgi?id=1709135#c5) improvements.
* To optimize and shrink self-hosted code [more](https://bugzilla.mozilla.org/show_bug.cgi?id=1688794), we've started work on simplifying self-hosted [bindings](https://bugzilla.mozilla.org/show_bug.cgi?id=1716901) and [certain](https://bugzilla.mozilla.org/show_bug.cgi?id=1707792) [intrinsics](https://bugzilla.mozilla.org/show_bug.cgi?id=1705819). 
* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1717002) testing functions for compiling to stencil off the main thread, to improve testing and fuzzing.
* More code in the browser has been [converted](https://bugzilla.mozilla.org/show_bug.cgi?id=1716934) to the new stencil-based APIs.


### 📐 ReShape

ReShape is a project to optimize and simplify our object layout and property representation after removing TI. This will help us fix some long-standing issues related to performance, memory usage and code complexity.



* We've [converted](https://bugzilla.mozilla.org/show_bug.cgi?id=1706900) `ShapeTable` (hash table for properties) from a custom hash table implementation to `mozilla::HashSet`. This has let us remove a lot of complicated code and is also [faster](https://bugzilla.mozilla.org/show_bug.cgi?id=1706900#c11).
* After [adding](https://bugzilla.mozilla.org/show_bug.cgi?id=1704441) better abstractions for property lookups, we [moved](https://bugzilla.mozilla.org/show_bug.cgi?id=1715512) property information out of Shapes into a new [PropMap](https://searchfox.org/mozilla-central/rev/42ae3bea104c37a9986c6f18d17bd9ddb387129c/js/src/vm/PropMap.h#23) (property map) data structure. This fixes some performance issues and has [reduced](https://bugzilla.mozilla.org/show_bug.cgi?id=1715512#c26) JS memory by 5-6% because it allows sharing more information.


### 🚀 JIT



* We've [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1701787) the Baseline IC code for `NewObject` to be shareable. These unshared IC stubs used to account for more than 65% of all Baseline IC compilations on certain websites.
* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1706309) Warp transpiler support for `NewObject` and `NewArray` IC stubs.
* These changes made it possible to [optimize](https://bugzilla.mozilla.org/show_bug.cgi?id=1710075) JitScript allocation by allocating Baseline IC fallback stubs as fixed size array instead of using a bump allocator. We were also able to [shrink](https://bugzilla.mozilla.org/show_bug.cgi?id=1682504) and simplify various IC-related data structures.
* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1699271) code generation based on YAML for MIR instructions, to remove C++ boilerplate code.
* We [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1700443) the old arguments analysis code after switching to a much simpler design in Firefox 89.
* We've [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1709216) polymorphic `Object.is` more to improve React performance.
* We added a mechanism to reorder type checks for polymorphic [TypeOf](https://bugzilla.mozilla.org/show_bug.cgi?id=1710905) and [ToBool](https://bugzilla.mozilla.org/show_bug.cgi?id=1712030) operations in Warp based on Baseline IC feedback.
* Contributor Garima hardened the JIT back-ends by [forcing the use of RAII patterns for scratch registers](https://bugzilla.mozilla.org/show_bug.cgi?id=1524481)


### 🧹Garbage Collection



* [Documentation](https://firefox-source-docs.mozilla.org/js/HazardAnalysis/index.html) for the hazard analysis was [moved](https://bugzilla.mozilla.org/show_bug.cgi?id=1708053) from the wiki to firefox-source-docs.
* We've [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1694538) the WeakMap marking algorithm to be much simpler and faster.
* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1711076) GC counts to performance profiles to help diagnose performance issues.
* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1711063) a new pre-tenuring mechanism for object allocations. We used to have a TI-based implementation, but the new version is a lot more precise and robust.
* The maximum store buffer size has been [increased](https://bugzilla.mozilla.org/show_bug.cgi?id=1717851) to avoid triggering nursery GCs too early on websites like Reddit.


### 📚 Miscellaneous



* We redesigned our website at [https://spidermonkey.dev/](https://spidermonkey.dev/) and introduced our new [logo](https://twitter.com/SpiderMonkeyJS/status/1389985112620736516).
* SpiderMonkey can now use an external thread pool for background tasks. This was [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1713335) in Firefox to reduce the number of background threads.
* `PropertyDescriptor` (and code using it) has been greatly [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1700958) and simplified. It now uses proper encapsulation and enforces important invariants.
* Storage for private methods has been [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1662559).
* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1709542) [debugger](https://bugzilla.mozilla.org/show_bug.cgi?id=1709956) API support for private fields and methods.
* We [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1624792) the old debugger instrumentation mechanism that was no longer being used.
* The team did a small sprint to [split up](https://bugzilla.mozilla.org/show_bug.cgi?id=1708400) the big jsapi.h header file more.
* We've [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1705777) the complicated rope flattening code [a lot](https://bugzilla.mozilla.org/show_bug.cgi?id=1706694).
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1709404) a new Fuzzilli CI build to help our fuzzing team.
* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1706866) more embedding APIs for working with `BigInt` values.
* We've [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1703740) irregexp to the latest version.
* `mozilla::Unused` is now [unused](https://bugzilla.mozilla.org/show_bug.cgi?id=1713212) in SpiderMonkey code.
* Contributor sagu [added](https://github.com/mozilla-spidermonkey/spidermonkey-embedding-examples/pull/35) CI support to the embedding examples repository.

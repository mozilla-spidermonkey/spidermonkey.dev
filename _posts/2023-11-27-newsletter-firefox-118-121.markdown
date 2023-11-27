---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 118-121)"
date:   2023-11-27 18:00:00 +0100
---

SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 118 to 121 Nightly release cycles.

The team wishes you Happy Holidays!

### 🚀 Performance

We're working with other Firefox teams to improve performance for popular web frameworks such as React. This work is largely driven by the Speedometer 3 benchmark that Mozilla is collaborating on with other browser vendors. The Performance Team recently [gave a talk all about Speedometer 3](https://www.youtube.com/watch?v=0RdDSGR6zYQ) at the `performance.now()` [conference](https://perfnow.nl/).

We can't list all of our improvements here, but the list below covers some of this work.

* We've [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1824051) JIT optimizations for property accesses involving proxies. As described in [this Mozilla Hacks](https://hacks.mozilla.org/2023/09/faster-vue-js-execution-in-firefox/) post, this significantly improved performance on the Vue.js 3 framework.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1853467) more [optimizations](https://bugzilla.mozilla.org/show_bug.cgi?id=1855705) for `Object.assign`.
* We've [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1863939) how some Baseline IC stubs are allocated to use less memory and to be faster.
* Array destructing has been [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1846051) with a fast path in the bytecode.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1848090) JSON parsing to help avoid GC time when parsing very large files.

We also partially [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1842701) a [long-standing](https://bugzilla.mozilla.org/show_bug.cgi?id=793345) performance issue with the DevTools Web Console: if the JS code doesn't use any of the special console variables, it will now run as fast as regular JS code on a website.


### ⚡ Wasm GC

We're [shipping](https://bugzilla.mozilla.org/show_bug.cgi?id=1845373) WebAssembly GC in Firefox 120! 🎉 This is a large feature that makes it possible for high-level languages to compile to WebAssembly and use the browser's garbage collector. The Wasm GC [proposal](https://github.com/WebAssembly/gc/blob/main/proposals/gc/Overview.md) adds struct and array types to WebAssembly for this.

If you're using Firefox 120 or later, you can [try this demo](https://kotlin-wasm-image-viewer.glitch.me/) of a Kotlin image viewer or [this Dart/Flutter demo](https://flutterweb-wasm.web.app/). Both of these use Wasm GC.


### 👷🏽‍♀️ Other features

We're also [shipping](https://bugzilla.mozilla.org/show_bug.cgi?id=1846789) Wasm tail calls in Firefox 121. This is an important feature for functional languages such as OCaml or Scheme that rely heavily on tail recursion.

We also shipped some new JS features in Firefox 119:

* We [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1850755) the well-formed Unicode Strings [proposal](https://github.com/tc39/proposal-is-usv-string). This adds `isWellFormed` and `toWellFormed` methods on `String.prototype`.
* We also [shipped](https://bugzilla.mozilla.org/show_bug.cgi?id=1792650) [`Object.groupBy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy) and [`Map.groupBy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy).

Additionally we will be [shipping](https://bugzilla.mozilla.org/show_bug.cgi?id=1845586) the `Promise.withResolvers` [proposal](https://github.com/tc39/proposal-promise-with-resolvers) in Firefox 121.

We implemented some features that are still disabled by default:

* We've [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1828144) the Symbols-as-WeakMap-keys [proposal](https://github.com/tc39/proposal-symbols-as-weakmap-keys).
* We [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1856338) our Temporal implementation to the latest spec version.


### ⏰ Date parsing improvements

The JS language specification does not define which date/time formats have to be accepted or rejected when converting strings to `Date` objects. This has resulted in a number of web compatibility [issues](https://bugzilla.mozilla.org/show_bug.cgi?id=1274354) because there are subtle differences between the date parsers of most JS engines.

Vinny Diehl has volunteered to improve compatibility with other browsers. Here are just a few of these changes:

* We now [accept](https://bugzilla.mozilla.org/show_bug.cgi?id=1175778) dates with a period after the month.
* We [accept](https://bugzilla.mozilla.org/show_bug.cgi?id=1557650) more numeric dashed dates, for example `1-1-2024`.
* We now [support](https://bugzilla.mozilla.org/show_bug.cgi?id=1863125) milliseconds in more cases.

The [release notes](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/121#javascript) for Firefox 121 (and earlier versions) list more cases.

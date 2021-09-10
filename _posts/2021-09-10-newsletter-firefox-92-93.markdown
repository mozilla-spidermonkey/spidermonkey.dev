---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 92-93)"
date:   2021-09-10 16:30:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 92 and 93 Nightly release cycles.


### 👷🏽‍♀️ JS features



* [Object.hasOwn](https://github.com/tc39/proposal-accessible-object-hasownproperty) is [shipping](https://bugzilla.mozilla.org/show_bug.cgi?id=1721149) in Firefox 92.
* Support for [class static blocks](https://github.com/tc39/proposal-class-static-block) has been [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1725689) by default in Firefox 93.
* The `Intl.NumberFormat` v3 [proposal](https://github.com/tc39/proposal-intl-numberformat-v3) has been [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1648137) in Firefox 93.
* The Intl enumeration [proposal](https://github.com/tc39/proposal-intl-enumeration) has been [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1670033) in Firefox 93.


### ⚡ WebAssembly



* We've [done](https://bugzilla.mozilla.org/show_bug.cgi?id=1717914) some [work](https://bugzilla.mozilla.org/show_bug.cgi?id=1726311) [towards](https://bugzilla.mozilla.org/show_bug.cgi?id=1727477) [Memory64](https://github.com/WebAssembly/memory64/blob/master/proposals/memory64/Overview.md) support.
* The final JS API for Wasm [exceptions](https://github.com/WebAssembly/exception-handling/blob/master/proposals/exception-handling/Exceptions.md) has been [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1703089).
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1715275) support for `WebAssembly.Function` from the js-types [proposal](https://github.com/WebAssembly/js-types/blob/master/proposals/js-types/Overview.md).
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1587757) unaligned floating point accesses on 32-bit ARM to not use signal handlers.
* Wasm code is now much faster and uses less memory when the debugger is [used](https://bugzilla.mozilla.org/show_bug.cgi?id=1714086).
* `memory.fill` and `memory.copy` are now [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1597790) with SIMD instructions.
* We [now](https://bugzilla.mozilla.org/show_bug.cgi?id=1728278) print better error messages to the console for asm.js


### ❇️ Stencil

[Stencil](https://bugzilla.mozilla.org/show_bug.cgi?id=1601332) is our project to create an explicit interface between the frontend (parser, bytecode emitter) and the rest of the VM, decoupling those components. This lets us improve web-browsing performance, simplify a lot of code and improve bytecode caching.



* We've [rewritten](https://bugzilla.mozilla.org/show_bug.cgi?id=1688794) our implementation of self-hosted code (builtins implemented in JS) to be based on the stencil format instead of cloning from a special zone. This has resulted in significant [memory](https://bugzilla.mozilla.org/show_bug.cgi?id=1688794#c27) and [performance](https://bugzilla.mozilla.org/show_bug.cgi?id=1688794#c29) improvements.
* We're [making](https://bugzilla.mozilla.org/show_bug.cgi?id=1719194) changes to function delazification to later allow doing this off-thread.
* We [hardened](https://bugzilla.mozilla.org/show_bug.cgi?id=1724803) XDR decoding more against memory/disk corruption.


### 🌍 Unified Intl implementation 

Work is underway to [unify](https://bugzilla.mozilla.org/show_bug.cgi?id=1686965) the Intl (Internalization) code in SpiderMonkey and the rest of Gecko as a shared `mozilla::intl` component. This results in less code duplication and will make it easier to [migrate](https://bugzilla.mozilla.org/show_bug.cgi?id=1713916) from the ICU library to [ICU4X](https://github.com/unicode-org/icu4x) in the future. 

The past weeks [Intl.Collator](https://bugzilla.mozilla.org/show_bug.cgi?id=1719550) and [Intl.RelativeTimeFormat](https://bugzilla.mozilla.org/show_bug.cgi?id=1719462) have been ported to the new `mozilla::intl` code.


### 🗂 ReShape

ReShape is a project to optimize and simplify our object layout and property representation after removing TI. This will help us fix some long-standing issues related to performance, memory usage and code complexity.



* We converted uses of object private slots to reserved slots and then [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1719457) private slots completely. This allowed us to [optimize](https://bugzilla.mozilla.org/show_bug.cgi?id=1723085) reserved slots.
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1724031) function objects to use reserved slots instead of a custom C++ layout.
* We [saved](https://bugzilla.mozilla.org/show_bug.cgi?id=1726533#c12) some memory by [storing](https://bugzilla.mozilla.org/show_bug.cgi?id=1726533) only the shape instead of an object for object literals.
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1717438) the shape teleporting optimization to avoid a performance cliff and to be simpler.
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1723715) global objects to [use](https://bugzilla.mozilla.org/show_bug.cgi?id=1724693) a C++ class instead of hundreds of reserved slots.
* We optimized object allocation, especially for [plain](https://bugzilla.mozilla.org/show_bug.cgi?id=1727328) objects, [array](https://bugzilla.mozilla.org/show_bug.cgi?id=1725348) objects and [functions](https://bugzilla.mozilla.org/show_bug.cgi?id=1728123) because these are so common.


### 🧹 Garbage Collection



* We now [avoid](https://bugzilla.mozilla.org/show_bug.cgi?id=1669669) marking and sweeping arenas for permanent atoms. 
* We [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1725357) the GC threshold code. This [resulted](https://bugzilla.mozilla.org/show_bug.cgi?id=1725357#c4) in a number of performance improvement alerts.
* We [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1723565) the GC allocation code for strings.
* We [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1434542) some changes to the way slice budgets are calculated to reduce jank caused by long GC pauses.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1717917) an issue with JIT code discarding heuristics that caused frequent OOMs in automation on 32-bit platforms.


### 📚 Miscellaneous



* We tidied up our meta bugs in Bugzilla. We now have a [tree](https://bugzilla.mozilla.org/showdependencytree.cgi?id=1729518&maxdepth=2&hide_resolved=1) of meta bugs.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1341265) `Map` and `Set` operations in the JITs.
* We fixed a number of correctness issues with [`super`](https://bugzilla.mozilla.org/show_bug.cgi?id=1720781), class [return values](https://bugzilla.mozilla.org/show_bug.cgi?id=1722269), [private methods](https://bugzilla.mozilla.org/show_bug.cgi?id=1723155) and date [parsing](https://bugzilla.mozilla.org/show_bug.cgi?id=1328672).
* We now [auto-generate](https://bugzilla.mozilla.org/show_bug.cgi?id=1699271) more LIR boilerplate code.
* A new contributor, sanketh, [added](https://bugzilla.mozilla.org/show_bug.cgi?id=531915) an option to use fdlibm for more `Math` functions to get consistent results across platforms and to avoid fingerprinting.
* We [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1725379) a [lot](https://bugzilla.mozilla.org/show_bug.cgi?id=1726737) of unnecessary includes. 

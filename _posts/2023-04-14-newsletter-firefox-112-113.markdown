---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 112-113)"
date:   2023-04-14 18:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 112 and 113 Nightly release cycles.


### 🛠️ Profiler instrumentation

We're working with the performance team to improve profiler support for JIT code. This work allows us to see JS functions (and JIT optimization data) in profiles from tools such as [samply](https://github.com/mstange/samply). This makes it much easier for us to find and investigate performance issues in the engine.



* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1820281) some JIT code trampolines to properly maintain frame pointers.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1530552) better frame unwinding information for Windows so external profilers can iterate through JIT frames using frame pointers.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1765402) Windows ETW events for mapping JIT code to method names.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1820605) an optional mode for profiling that adds frame pointers to Baseline IC code.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1815538) an optional mode for profiling that adds entry trampolines for scripts running in the interpreters. This makes it possible to distinguish between different scripts that are executing in the interpreter.


### 🚀 Performance

We're working on improving performance for popular web frameworks such as React. We can't list all of these improvements here, but the list below covers some of this work.



* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1799023) global name lookups to use a generation counter instead of shape guards.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1823811) an optimization to guess the size of objects allocated by constructor functions.
* We [rewrote](https://bugzilla.mozilla.org/show_bug.cgi?id=1483869) our implementation of `Function.prototype.bind` to be [faster](https://bugzilla.mozilla.org/show_bug.cgi?id=1820763), simpler and use [less memory](https://bugzilla.mozilla.org/show_bug.cgi?id=1483869#c28).
* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1819722) monomorphic function inlining for cases where we can skip the trial inlining phase.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1816981) inlining of megamorphic cache lookups to Baseline ICs in addition to Ion.
* We [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1824135) our `ArraySpeciesLookup` cache more robust.
* We [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1823622) some improvements to the GC's parallel marking implementation.
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1825014) our self-hosted builtins to use specialized intrinsics instead of `arguments`, to eliminate unnecessary arguments object allocations in the interpreter and Baseline tiers.


### ⚡ Wasm GC

High-level programming languages currently need to bring their own GC if they want to run on WebAssembly. This can result in memory leaks because it cannot collect cycles that form with the browser. The Wasm GC [proposal](https://github.com/WebAssembly/gc/blob/main/proposals/gc/Overview.md) adds struct and array types to Wasm so these languages can use the browser's GC instead.



* We profiled the dart-barista benchmark and [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1814519) various performance issues.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1817385) allocation and GC [support](https://bugzilla.mozilla.org/show_bug.cgi?id=1820120) for Wasm GC objects.
* We [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1824904) the memory layout of Wasm GC objects to be more efficient.


### ⚙️ Modernizing JS modules

We're working on improving our implementation of modules. This includes supporting modules in Workers, adding support for Import Maps, and ESMification (replacing the JSM module system for Firefox internal JS code with standard ECMAScript modules).



* See the AreWeESMifiedYet [website](https://spidermonkey.dev/areweesmifiedyet/) for the status of ESMification. As of this week, almost 70% of modules have been ESMified 🎉
* We've finished most of the work for worker modules. We're hoping to [ship](https://bugzilla.mozilla.org/show_bug.cgi?id=1812591) this soon.


### 📚 Miscellaneous



* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1773319) Stencil APIs for parsing code without using a `JSContext`.
* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1804310) the `memory.discard` instruction for WebAssembly.
* We improved mitigations for fingerprinting based on [time zones](https://bugzilla.mozilla.org/show_bug.cgi?id=1709867) and [math functions](https://bugzilla.mozilla.org/show_bug.cgi?id=1823880).
* We [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1817092) some [improvements](https://bugzilla.mozilla.org/show_bug.cgi?id=1816165) to the static analysis for GC hazards.
* We [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1793962) more [parts](https://bugzilla.mozilla.org/show_bug.cgi?id=1793960) of the decorator proposal.

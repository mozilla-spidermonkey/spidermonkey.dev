---
layout: post
title:  "SpiderMonkey Newsletter 3 (Firefox 74-75)"
date:   2020-03-12 15:00:00 +0100
---
### JavaScript

#### 🏆 New contributors
*   Rob Rico [tidied up](https://bugzilla.mozilla.org/show_bug.cgi?id=1605263) some code in the parser


#### 🎁 New features
*   Yulia [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1566143) the optional chaining (?.) operator (Firefox 74)
*   André [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1535804) public static class fields (Firefox 75)
*   André [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1613713) the Intl.Locale proposal (Firefox 75)


#### 🐒 SmooshMonkey

The [previous newsletter](https://mozilla-spidermonkey.github.io/blog/2020/01/10/newsletter-2.html#project-visage) introduced Visage, a [new JavaScript frontend](https://github.com/mozilla-spidermonkey/jsparagus) we’re working on that’s written in Rust. Visage has since been renamed to SmooshMonkey, a name that’s known and [well accepted](https://github.com/tc39/proposal-flatMap/pull/56) by the JavaScript community (#SmooshGate). After a dinner and discussions with project members, it got authoritatively renamed by [speaking about it](https://docs.google.com/presentation/d/1pY5KQzFmayfZi5eLYI5673UVv9-lzdugbg-kOFpRRf0/edit#slide=id.g6dd8ea1b81_0_17 ) at the All-Hands.

The team is making good [progress](https://github.com/mozilla-spidermonkey/jsparagus/issues/304):
*   SmooshMonkey has been [integrated in Gecko](https://bugzilla.mozilla.org/show_bug.cgi?id=1612515) behind a configure flag and a runtime flag.
*   [Passes 100%](https://github.com/mozilla-spidermonkey/jsparagus/milestone/1?closed=1) of SpiderMonkey tests (falling back on SpiderMonkey’s current parser for non-implemented features).
*   Added stats about the project using Github CI.
*   The bytecode emitter has been improved to prevent generating bytecode which might have undefined behaviour.
*   There’s a [new parser generator](https://github.com/mozilla-spidermonkey/jsparagus/pull/347) to support [context-dependent aspects](https://github.com/mozilla-spidermonkey/jsparagus/issues/359) of the JavaScript grammar instead of exploding the number of states of the equivalent context-free grammar.


#### ❇️ Stencil

Progress on [Project Stencil](https://bugzilla.mozilla.org/show_bug.cgi?id=1601332) is continuing. Huge thanks to André for helping knock [three](https://bugzilla.mozilla.org/show_bug.cgi?id=1619007) [blocking](https://bugzilla.mozilla.org/show_bug.cgi?id=1619010) [bugs](https://bugzilla.mozilla.org/show_bug.cgi?id=1619008) off in quick succession!

Matthew landed many patches to [clean up](https://bugzilla.mozilla.org/show_bug.cgi?id=1611528) our compilation management data structures. He also [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1615728) a SourceExtent structure to store source information and changed the frontend to [always defer](https://bugzilla.mozilla.org/show_bug.cgi?id=1610340) supported GC allocations.

Kannan is [working on](https://bugzilla.mozilla.org/show_bug.cgi?id=1592105) removing GC atom allocation from the frontend. The frontend uses atoms in many places and to make the frontend GC-free we need a different strategy for that.

Caroline is [working at](https://bugzilla.mozilla.org/show_bug.cgi?id=1620776) cleaning up the flags used throughout the frontend, to unify `BaseScript::ImmutableFlags`, `CompileOptions`, and `FunctionBox` flags into one representation.


#### 📚 JSScript/LazyScript unification

The JSScript/LazyScript [unification](https://bugzilla.mozilla.org/show_bug.cgi?id=1529456) is nearing completion. Ted has landed patches for Firefox 75 to [use the same GC TraceKind](https://bugzilla.mozilla.org/show_bug.cgi?id=1615143) for LazyScript and JSScript and after that [was able to merge](https://bugzilla.mozilla.org/show_bug.cgi?id=1615145) the GC arenas. The is-lazy state has been [moved](https://bugzilla.mozilla.org/show_bug.cgi?id=1591600) from JSFunction to BaseScript.

The next big step is delazifying/relazifying scripts [in place](https://bugzilla.mozilla.org/show_bug.cgi?id=1619803) so that we never have to keep both a JSScript and a LazyScript for a function.


#### 🛸 WarpBuilder

Ion, our optimizing JIT, currently relies on a global Type Inference (TI) mechanism. Ion and TI have a [number of shortcomings](https://bugzilla.mozilla.org/show_bug.cgi?id=1613592#c0) so we’re experimenting with a much simpler MIR builder for Ion that’s based on Baseline ICs (CacheIR) instead of TI. If this works out it will let us delete some of our most complicated code, allow us to do more work off-thread, and result in memory usage reductions and performance improvements across the engine.

The past weeks Jan landed patches [preparing](https://bugzilla.mozilla.org/show_bug.cgi?id=1613594) for [this](https://bugzilla.mozilla.org/show_bug.cgi?id=1616188) and [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1617564) a very primitive WarpBuilder implementation that’s able to build MIR off-thread. He’s now [adding support](https://bugzilla.mozilla.org/show_bug.cgi?id=1618198) for more bytecode instructions. 


#### ⏩ Regular expression engine update

Iain is working on [upstreaming](https://chromium-review.googlesource.com/c/v8/v8/+/2072858) some changes to v8 to improve case-insensitive match support. He also started posting patches to [implement](https://bugzilla.mozilla.org/show_bug.cgi?id=1620020) shim definitions to make the code work in SpiderMonkey.


#### 🏎 JIT optimizations for classes and spread calls

André [added Ion support](https://bugzilla.mozilla.org/show_bug.cgi?id=1378189) for derived class constructors. He then [made it possible](https://bugzilla.mozilla.org/show_bug.cgi?id=1557765) for Ion to inline class constructors. He also [added Ion support](https://bugzilla.mozilla.org/show_bug.cgi?id=1619343) for spread-new and spread-super calls.


#### ✏️ Miscellaneous
*   Steve [started converting](https://bugzilla.mozilla.org/show_bug.cgi?id=1619475) our JS test suites to support Python 3.
*   Steve also [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1614518) a `mach hazards` command to make it easier to run the GC rooting analysis locally.
*   Jon [enabled (browser) tests](https://bugzilla.mozilla.org/show_bug.cgi?id=1616230) for JS [WeakRefs](https://github.com/tc39/proposal-weakrefs).
*   André [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1530372) nursery allocation support for BigInts.
*   Iain noticed the C++ interpreter was not using [computed goto](https://gcc.gnu.org/onlinedocs/gcc/Labels-as-Values.html) on Windows (supported since the switch to clang-cl) and [fixed this](https://bugzilla.mozilla.org/show_bug.cgi?id=1609229). 
*   IRC has been shut down. You can now find us in [chat.mozilla.org’s Spidermonkey room](https://chat.mozilla.org/#/room/#spidermonkey:mozilla.org).


### WebAssembly
*   Ryan added support for using [Cranelift when reference types are enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1574865).  Reference types allow WebAssembly to pass JavaScript values as function arguments and return values, to store them in local variables, and to load and store them in [tables](https://webassembly.github.io/reference-types/core/syntax/instructions.html#syntax-instr-table).  Cranelift can now emit annotations that inform the JavaScript garbage collector of value locations, so that the GC can trace and relocate object pointers.
*   Andy from Igalia added support for [functions that return multiple values](https://github.com/WebAssembly/multi-value/blob/master/proposals/multi-value/Overview.md) to the WebAssembly [baseline compiler](https://bugzilla.mozilla.org/show_bug.cgi?id=1603140); when the corresponding implementation lands in the [optimizing compiler](https://bugzilla.mozilla.org/show_bug.cgi?id=1607200) (Firefox 76), the feature will finally be able to ride the train out of Nightly.
*   Work is ongoing to replace Cranelift’s instruction selection mechanism as well as register allocation. We can now compile basic wasm programs with either Wasmtime or Spidermonkey using Cranelift’s new pipeline.
*   We also bid a fond farewell to the `#wasm` IRC channel; you can now find the SpiderMonkey WebAssembly team over on [chat.mozilla.org’s WebAssembly room](https://chat.mozilla.org/#/room/#webassembly:mozilla.org).


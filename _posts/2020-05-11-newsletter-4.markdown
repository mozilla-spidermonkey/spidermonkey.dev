---
layout: post
title:  "SpiderMonkey Newsletter 4 (Firefox 76-77)"
author: SpiderMonkey Team
date:   2020-05-11 18:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 76 and 77 Nightly cycles.


### JavaScript


#### 🏆 New contributors
*   Kousuke Takaki fixed [bug 1601734](https://bugzilla.mozilla.org/show_bug.cgi?id=1601734), tidying up some naming.
*   Tuan fixed [bug 1566116](https://bugzilla.mozilla.org/show_bug.cgi?id=1566116), deleting dead code.


#### 🎁 New features
* **Firefox 76**: André [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1610512) ICU to version 66 with support for [Unicode 13](http://unicode.org/versions/Unicode13.0.0/).
* **Firefox 76**: `numberingSystem` and `calendar` for `Intl` objects can now be set through [options](https://bugzilla.mozilla.org/show_bug.cgi?id=1625975).
* **Firefox 77**: `String.prototype.replaceAll` is [no longer Nightly-only](https://bugzilla.mozilla.org/show_bug.cgi?id=1608168) and will ride the trains to release.
* **Firefox 77 (Nightly-only)**: André [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1629106) the [Logical Assignment Operators](https://github.com/tc39/proposal-logical-assignment/) proposal (adds the `||=`, `&&=`, `??=` operators).


#### 🗑️ Garbage Collection
*   Jon [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1632139) [various](https://bugzilla.mozilla.org/show_bug.cgi?id=1632534) [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1633752) to GC heuristics to avoid non-incremental GCs.
*   Steve [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1167452) and [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1633176) incremental marking for WeakMaps, a big change that will help reduce long GC slices, but to reduce risk this was backed out for Firefox 77. We’re hoping this sticks in Firefox 78!
*   Jon [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1632846) tracing of ‘auto rooters’ faster. He also noticed regressions on Linux64 from parallel unmarking and [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1622757) performance improvements to fix that.
*   Jon [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1425450) tracing of certain DOM objects in Firefox by allowing per-Zone tracing instead of tracing all of them.
*   Jon fixed various OOM (out of memory) crashes by [adding](https://bugzilla.mozilla.org/show_bug.cgi?id=1591276) memory accounting for malloc buffers associated with nursery cells and by [improving](https://bugzilla.mozilla.org/show_bug.cgi?id=1620213) GC malloc triggers.
*   Steve [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1626772) the static analysis for rooting hazards to GCC 9.


#### ⏩ Regular expression engine update

Iain [finished](https://bugzilla.mozilla.org/show_bug.cgi?id=1594545) [implementing](https://bugzilla.mozilla.org/show_bug.cgi?id=1628835) the SpiderMonkey shims and JIT [support](https://bugzilla.mozilla.org/show_bug.cgi?id=1630090) for the new regular expression engine and is planning to land these in the FF 78 cycle to [switch to](https://bugzilla.mozilla.org/show_bug.cgi?id=1634135) the new engine in Nightly! This will [bring](https://groups.google.com/forum/#!topic/mozilla.dev.platform/oHXLYkUKWGo) support for lookbehind assertions, the dotAll flag and unicode escape sequences.

Iain has also started working on supporting [named groups](https://bugzilla.mozilla.org/show_bug.cgi?id=1362154) and [match indices](https://bugzilla.mozilla.org/show_bug.cgi?id=1519483).


#### 📚 JSScript/LazyScript unification

With all the groundwork in place (see previous newsletters), Ted was able to [unify](https://bugzilla.mozilla.org/show_bug.cgi?id=1619803) JSScript and LazyScript! Functions no longer require a separate LazyScript and JSScript and delazification and relazification now happen in-place.

He then [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1620495) the LazyScript type completely and [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1567157) various follow-up changes to take advantage of the new system.


#### ❇️ Stencil

[Stencil](https://bugzilla.mozilla.org/show_bug.cgi?id=1601332) is our project to create an interface between the frontend (parser, bytecode emitter) and the rest of the VM, decoupling those components. This lets us improve performance, simplify a lot of code and improve bytecode caching. It also makes it possible to rewrite our frontend in Rust (see SmooshMonkey item below).

The team is making good progress:



*   Caroline [split](https://bugzilla.mozilla.org/show_bug.cgi?id=1619011) the script flags into multiple categories so it’s easier to assert correctness and reason about them. She [also](https://bugzilla.mozilla.org/show_bug.cgi?id=1619445) [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1633940) [various](https://bugzilla.mozilla.org/show_bug.cgi?id=1627358) [other](https://bugzilla.mozilla.org/show_bug.cgi?id=1632286) [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1625021) to improve the script flags.
*   Ted also [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1631997) some flags and then [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1632273) their documentation.
*   Matthew removed more dependencies on JSScript and was then able to [defer](https://bugzilla.mozilla.org/show_bug.cgi?id=1632260) JSScript allocation to a later point in the bytecode emitter.
*   Matthew [disconnected](https://bugzilla.mozilla.org/show_bug.cgi?id=1619345) FunctionBox from ScriptStencil and [started](https://bugzilla.mozilla.org/show_bug.cgi?id=1627374) [removing](https://bugzilla.mozilla.org/show_bug.cgi?id=1627047) dependencies on JSFunction. This will allow us to defer JSFunction allocation as well.
*   André [finished](https://bugzilla.mozilla.org/show_bug.cgi?id=1619001) deferring RegExpObject allocation, unlocking more code simplifications.
*   Jason and Caroline [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1605387) changes to [make](https://bugzilla.mozilla.org/show_bug.cgi?id=1615402) ImmutableScriptData a part of the Stencil interface instead of its field being duplicated in ScriptStencil.
*   Kannan is [making progress](https://bugzilla.mozilla.org/show_bug.cgi?id=1592105) removing the frontend dependency on JSAtoms.


#### 🐒 SmooshMonkey

[SmooshMonkey](https://github.com/mozilla-spidermonkey) is a reimplementation of the front end, with the goal of making it easier to add new features to the engine, and improve the long term perspective of maintaining the codebase. \




*   Nicolas Improved the generated parser speed [by a factor of 2](https://github.com/mozilla-spidermonkey/jsparagus/issues?q=label%3Aoptimization+assignee%3Anbp), and continues to make progress [on further speed improvements](https://github.com/nbp/jsparagus/tree/filter-states-and-replay-actions) to catch up with SpiderMonkey's current hand-written parser. At the moment, we are only [47% behind](https://chat.mozilla.org/#/room/#js-frontend:mozilla.org/$lWuOixzLNmt9WDDqpmkK8205MC8mgNt9eBqylMManZ4) SpiderMonkey.
*   Arai implemented [scope analysis](https://github.com/mozilla-spidermonkey/jsparagus/pull/482), and [started](https://github.com/mozilla-spidermonkey/jsparagus/pull/448) [working](https://github.com/mozilla-spidermonkey/jsparagus/pull/467) [on](https://github.com/mozilla-spidermonkey/jsparagus/pull/455) [functions](https://github.com/mozilla-spidermonkey/jsparagus/pull/453).
*   Jason cleaned up parts of the python codebase and improved the safety of the rust code
*   Yulia implemented [Labels](https://github.com/mozilla-spidermonkey/jsparagus/issues/224), [Breaks, Continues](https://github.com/mozilla-spidermonkey/jsparagus/issues/223) and [For/Do/While loops](https://github.com/mozilla-spidermonkey/jsparagus/issues/222)
*   The team is 55% through the ES3 implementation, and 50% through the MVP implementation.


#### 🚀 WarpBuilder

[WarpBuilder](https://bugzilla.mozilla.org/show_bug.cgi?id=1613592) is the JIT project to replace the frontend of our optimizing JIT (IonBuilder) and Type Inference with a new MIR builder based on compiling CacheIR to MIR. WarpBuilder will let us improve security, performance, memory usage and maintainability of the whole engine.



*   Jan [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1618198) support for most bytecode instructions (the slow paths) and [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1627174) a tier 2 ‘warp’ job to Treeherder that runs jit-tests with WarpBuilder enabled.
*   Jan [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1628227) the CacheIR Transpiler for transpiling CacheIR to MIR and started using it for certain instructions.
*   Tom implemented support for various [GetProp](https://bugzilla.mozilla.org/show_bug.cgi?id=1629439), [GetElem](https://bugzilla.mozilla.org/show_bug.cgi?id=1629867) [cases](https://bugzilla.mozilla.org/show_bug.cgi?id=1631920) in the transpiler.
*   Jan [moved](https://bugzilla.mozilla.org/show_bug.cgi?id=1629791) the list of all CacheIR instructions into a [YAML file](https://searchfox.org/mozilla-central/rev/7fd1c1c34923ece7ad8c822bee062dd0491d64dc/js/src/jit/CacheIROps.yaml) and used this to auto-generate reader/writer boilerplate and better debug [printing](https://bugzilla.mozilla.org/show_bug.cgi?id=1632067) code. This makes it easier and less error-prone to add new CacheIR instructions and to support new instructions in the transpiler.


#### 💣 Exception handling improvements
*   Tom [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1619177) the “extra warnings” mode. If the pref for this was enabled, the engine would report warnings in certain situations. Modern linters do a better job at many of these things.
*   Tom then [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1275508) the “werror” (warnings-as-errors) mode.
*   Tom [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1623226) location information for non-error uncaught exceptions.
*   Tom is now [working on](https://bugzilla.mozilla.org/show_bug.cgi?id=1595046) making it possible to inspect uncaught exceptions in the Web Console. Nicolas from the DevTools team is implementing the Console UI code for this.


#### 📈 Miscellaneous performance improvements
*   Jeff [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1626105) the UTF-8 parsing functions to never inflate to UTF-16.
*   Ted [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1626127) metadata source notes from self-hosted code. This saved about 40 KB per process.
*   Tom [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1607986) CacheIR support for binary operations involving a number and string to speed up paper.io
*   André [moved](https://bugzilla.mozilla.org/show_bug.cgi?id=1632561) the `Object.prototype.__proto__` getter to self-hosted code so it benefits from JIT inlining support for getPrototypeOf.
*   Christian [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1626905) some slow logging code that affected all debug builds.
*   André [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1620997) CacheIR support for `JSOp::Pow` (the `**`-operator).
*   André [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1626297) CacheIR support for `JSop::Pos` (the `+`-operator) and optimized `+string` (to convert strings to numbers).
*   Jan [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1632761) CacheIR support for `JSOp::ToNumeric` to improve WarpBuilder code generation.


#### 🧹 Miscellaneous code cleanups
*   Arai [converted](https://bugzilla.mozilla.org/show_bug.cgi?id=1622561) the source notes code from old C macros to modern C++.
*   Jeff [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=949220) a [lot](https://bugzilla.mozilla.org/show_bug.cgi?id=1630346) of patches to clean up object creation code.
*   André [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1627618) a lot of dead code from various MIR instructions.
*   Tom [continued](https://bugzilla.mozilla.org/show_bug.cgi?id=1633145) converting some ancient jsid functions to PropertyKey methods.
*   Ted [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1633425) a TrailingArray type and used it for various classes with variable-size trailing arrays.
*   André [converted](https://bugzilla.mozilla.org/show_bug.cgi?id=1623957) code to use &lt;type_traits> instead of our own mfbt/TypeTraits.h
*   Jeff [started](https://bugzilla.mozilla.org/show_bug.cgi?id=1629192) using the C++17 if/switch statements with initializers.
*   André and Jan [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1627955) [some](https://bugzilla.mozilla.org/show_bug.cgi?id=1627955) code with C++17 fold expressions.
*   Jon [converted](https://bugzilla.mozilla.org/show_bug.cgi?id=1628389) [code](https://bugzilla.mozilla.org/show_bug.cgi?id=1628751) using std type traits to the more concise *_v and *_t versions since C++17.
*   Jon [gave all Cells a CellHeader type](https://bugzilla.mozilla.org/show_bug.cgi?id=1625212) for the first word to improve the safety of GC flags and to make the code easier to understand.


#### ✏️ Miscellaneous



*   Jason [worked around](https://bugzilla.mozilla.org/show_bug.cgi?id=1524257) a CPU bug that affected the bytecode emitter.
*   Yoshi is [making](https://bugzilla.mozilla.org/show_bug.cgi?id=1628201) changes to the helper thread system to make it possible to eventually use Gecko’s shared thread pool for SpiderMonkey’s background tasks.
*   Jeff is [landing](https://bugzilla.mozilla.org/show_bug.cgi?id=1502355) code changes for ReadableStream pipeTo/pipeThrough support.
*   Jeff and Tom Tung are [working on](https://bugzilla.mozilla.org/show_bug.cgi?id=1624266) conditionally hiding the SharedArrayBuffer constructor.
*   A last minute [time zone data update](https://bugzilla.mozilla.org/show_bug.cgi?id=1633331) made it just in time for Firefox 76. Big thanks to the release team for their prompt reaction!
*   Matthew [added](https://firefox-source-docs.mozilla.org/js/build.html) in-tree documentation on how to build and test the SpiderMonkey shell with mach.


### WebAssembly



*   Andy from Igalia implemented support for [calling multi-result WebAssembly functions from JavaScript](https://bugzil.la/1625887) as well as having [JavaScript return multiple values to WebAssembly](https://bugzil.la/1622828).  With this work, the multi-value feature is complete! This feature will ride the train for Firefox 78. Thanks to [Bloomberg](https://www.techatbloomberg.com/) for their support implementing this feature.
*   Andy wrote an [introductory article on the design of SpiderMonkey’s WebAssembly compiler tiers](https://wingolog.org/archives/2020/03/25/firefoxs-low-latency-webassembly-compiler), as well as an [article diving into the performance of the baseline compiler](https://wingolog.org/archives/2020/04/14/understanding-webassembly-code-generation-throughput)
*   Andy also wrote a [couple](https://wingolog.org/archives/2020/04/03/multi-value-webassembly-in-firefox-from-1-to-n) of [articles](https://wingolog.org/archives/2020/04/08/multi-value-webassembly-in-firefox-a-binary-interface) on the implementation of the multi-value feature.
*   Andy also extended support in the debugger to access [multi-value and i64 results from return breakpoints](https://bugzil.la/1628426).
*   Lars implemented support for the WebAssembly SIMD proposal in the [x64 baseline compiler](https://bugzilla.mozilla.org/show_bug.cgi?id=1478632).
*   Ryan made a heroic patch set that culminated in the replacement of SpiderMonkey’s [nonstandard wasmTextToBinary](https://bugzilla.mozilla.org/show_bug.cgi?id=1527871) debugging function with the [standards-conforming wat crate](https://bugzil.la/1612534), written in Rust.
*   Ryan also [re-imported the upstream WebAssembly conformance tests as part of Firefox’s web-platform tests.](https://bugzil.la/1627854)
*   Ryan also [updated](https://bugzil.la/1612804) [SpiderMonkey’s](https://bugzil.la/1624363) [support](https://bugzil.la/1624490) for the experimental WebAssembly GC proposal in response to upstream changes.


#### 🏗︎ Cranelift

Cranelift is a low-level code generator written in Rust. While available in Firefox Nightly as backend for WebAssembly with the right `about:config` prefs, Cranelift is disabled by default, being still a work-in-progress. We’re continuing to refine performance and fill in some additional feature support before making this the default setting.

Experimental WebAssembly (MVP) support for the AArch64 (ARM64) instruction set has [landed in Cranelift](https://github.com/bytecodealliance/wasmtime/pull/1494) and [in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1618595), and large WebAssembly programs can now run correctly using it!

The new backend also brings with it an updated machine-backend design for Cranelift, which we believe will make future work and contributions easier to develop. We’ve developed a new register allocator as part of this that is designed to be a reusable library (Rust crate) called [regalloc.rs](https://github.com/bytecodealliance/regalloc.rs/). Finally, the AArch64 support also benefits other users of Cranelift, such as Wasmtime.

This is the result of months of work carried out by Chris, Julian and Benjamin, with the help of Joey Gouly (of ARM).

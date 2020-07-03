---
layout: post
title:  "SpiderMonkey Newsletter 5 (Firefox 78-79)"
date:   2020-07-03 16:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 78 and 79 Nightly release cycles.

If you like these newsletters, you may also enjoy Yulia's weekly [Compiler Compiler live stream](https://developer.mozilla.com/events/compiler-compiler-yulia-startsev/), a guided tour of what it is like to work on SpiderMonkey and improve spec compliance.


### JavaScript


#### 🎁 New features


##### Firefox 78
*   Iain's regular expression engine work (see below) resulted in support for:
    *   [dotAll flag](https://github.com/tc39/proposal-regexp-dotall-flag)
    *   [Named capture groups](https://github.com/tc39/proposal-regexp-named-groups)
    *   [Unicode property escapes](https://github.com/tc39/proposal-regexp-unicode-property-escapes)
    *   [Lookbehind assertions](https://github.com/tc39/proposal-regexp-lookbehind)
*   André [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1589095) [Intl.ListFormat](https://github.com/tc39/proposal-intl-list-format) by default.
*   André [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1633836) the [Unified NumberFormat API](https://github.com/tc39/proposal-unified-intl-numberformat) by default.


##### Firefox 79
*   Jon [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1639246) [WeakRef and FinalizationRegistry](https://github.com/tc39/proposal-weakrefs) by default.
*   André [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1639591) the [new logical assignment operators](https://github.com/tc39/proposal-logical-assignment/) (`&&=`, `||=`, `??=`) by default.
*   Jason [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1599769) [Promise.any and AggregateError](https://github.com/tc39/proposal-promise-any) by default.
*   André [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1557718) the [dateStyle and timeStyle options](https://github.com/tc39/proposal-intl-datetime-style) on Intl.DateTimeFormat.


#### 👷🏽‍♀️ Feature work



*   Matthew has [started](https://bugzilla.mozilla.org/show_bug.cgi?id=1635839) implementing [private class fields](https://github.com/tc39/proposal-class-fields).
*   Adam is [implementing](https://bugzilla.mozilla.org/show_bug.cgi?id=1568906) the [Iterator Helpers](https://github.com/tc39/proposal-iterator-helpers) proposal.
*   Yulia [started](https://bugzilla.mozilla.org/show_bug.cgi?id=1519100) implementing the [Top-level Await](https://github.com/tc39/proposal-top-level-await) proposal.
*   Jeff [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1502355) more changes for ReadableStream pipeTo/pipeThrough support.
*   Tom [defined](https://bugzilla.mozilla.org/show_bug.cgi?id=1277799) [Symbol.toStringTag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag) properties on DOM prototype objects and then [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1277801) the (non-standard) code for Object.prototype.toString where it used the internal JSClass name.
*   André [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1630706) Atomics methods to work on non-shared ArrayBuffers.
*   André [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1557727) the [Intl.DisplayNames](https://github.com/tc39/proposal-intl-displaynames) proposal (disabled by default).


#### ⏩ Regular Expression engine update



*   Iain fixed the last blockers and [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1634135) the new engine by default.
*   Iain then [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1362154) support for named capture groups and [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1635275) a fuzzing target for differential testing of interpreted vs compiled code with libfuzzer.
*   Finally, Iain [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1642493) the old engine in Firefox 79 and tidied up the code.

    See the [Mozilla Hacks blog post](https://hacks.mozilla.org/2020/06/a-new-regexp-engine-in-spidermonkey/) for more details.



#### 🗑️ Garbage Collection



*   Steve [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1633176) incremental WeakMap marking, a big change to help reduce GC pauses.
*   Steve [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1568923) changes to de-duplicate strings during nursery GC, based on work done by GC intern Krystal Yang and then rebased by Thinker Li.
*   Jon [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1635087) a header to nursery-allocated cells and [used this](https://bugzilla.mozilla.org/show_bug.cgi?id=1635692) to simplify code.
*   Steve [created](https://bugzilla.mozilla.org/show_bug.cgi?id=1633625) a GC micro-benchmark suite that can be used to compare GC performance on various workloads in different engines / browsers.
*   Jon [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1637318) [various](https://bugzilla.mozilla.org/show_bug.cgi?id=1637667) [issues](https://bugzilla.mozilla.org/show_bug.cgi?id=1637642) with GC telemetry data.
*   Jon [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1470369) incremental sweeping by no longer collecting the nursery for every slice.
*   Steve [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1644243) string allocation by allocating a tenured string directly for certain call sites.
*   Yoshi [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1644111) sending telemetry data of promotion rate when nursery was empty.


#### ❇️ Stencil

[Stencil](https://bugzilla.mozilla.org/show_bug.cgi?id=1601332) is our project to create an explicit interface between the frontend (parser, bytecode emitter) and the rest of the VM, decoupling those components. This lets us improve performance, simplify a lot of code and improve bytecode caching. It also makes it possible to rewrite our frontend in Rust (see SmooshMonkey item below).



*   Caroline [merged](https://bugzilla.mozilla.org/show_bug.cgi?id=1631106) LazyScriptCreationData into FunctionCreationData.
*   Ted [moved](https://bugzilla.mozilla.org/show_bug.cgi?id=1638470) the script atoms from RuntimeScriptData to PrivateScriptData. This allowed [merging](https://bugzilla.mozilla.org/show_bug.cgi?id=1638670) various classes into ScriptStencil.
*   Ted [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1636800) snapshotting for incoming scope data to better isolate the parser from the VM.
*   Ted [deferred](https://bugzilla.mozilla.org/show_bug.cgi?id=1599858) allocation of functions and scripts to the end of bytecode generation, moving us closer to [not doing](https://bugzilla.mozilla.org/show_bug.cgi?id=1544117) GC-allocations in the frontend.
*   Kannan [factored](https://bugzilla.mozilla.org/show_bug.cgi?id=1639612) non-GC state out of scope data and [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1642716) BindingIter to work with both GC atoms (JSAtom) and the future ParserAtom type.
*   Kannan [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1645845) the ParserAtom and ParserAtomsTable types. The next part is converting the frontend to use ParserAtom instead of JSAtom, another big step towards GC-free parsing.


#### 🐒 SmooshMonkey

[SmooshMonkey](https://github.com/mozilla-spidermonkey/jsparagus) is our project to reimplement the frontend in a safe language (Rust) and make it easier to implement new features and improve long-term maintainability of the code base. 



*   Arai is [implementing](https://github.com/mozilla-spidermonkey/jsparagus/issues/526) function compilation, while updating the [Stencil interface for function](https://bugzilla.mozilla.org/show_bug.cgi?id=1641202).
*   Arai [landed a tool](https://github.com/mozilla-spidermonkey/jsparagus/pull/567) and [automation](https://github.com/mozilla-spidermonkey/jsparagus/pull/570) to improve the development workflow.
*   Arai [bumped](https://github.com/mozilla-spidermonkey/jsparagus/pull/542) the supported Unicode version to 13.


#### 🚀 WarpBuilder

[WarpBuilder](https://bugzilla.mozilla.org/show_bug.cgi?id=1613592) is the JIT project to replace the frontend of our optimizing JIT (IonBuilder) and the engine's Type Inference mechanism with a new MIR builder based on compiling CacheIR to MIR. WarpBuilder will let us improve security, performance, memory usage and maintainability of the whole engine.

Since the last newsletter we've implemented a lot more CacheIR instructions in the transpiler (the part of WarpBuilder responsible for translating CacheIR to MIR). Although we're still missing a lot of pieces, we're starting to get very encouraging performance numbers.



*   Tom, Caroline, and Jan [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1638111) CacheIR and Warp support for many builtin functions (for example [Math.floor](https://bugzilla.mozilla.org/show_bug.cgi?id=1639534) and [Array.isArray](https://bugzilla.mozilla.org/show_bug.cgi?id=1641297)) and self-hosting intrinsics. These functions are now also properly optimized in the Baseline Interpreter and JIT.
*   Tom added support for [property sets](https://bugzilla.mozilla.org/show_bug.cgi?id=1634742), [double arithmetic](https://bugzilla.mozilla.org/show_bug.cgi?id=1635589), [TypedArray elements](https://bugzilla.mozilla.org/show_bug.cgi?id=1637220), and many other things to the transpiler.
*   Jan [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1636030) support for element sets, string concatenation and other things to the transpiler.
*   Caroline [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1640284) a CacheIR health report mechanism. In the future this will make it easier to analyze performance of JIT code.
*   Jan [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1636946) MIR optimizations for slot/element loads followed by an unbox.
*   Christian [started](https://bugzilla.mozilla.org/show_bug.cgi?id=1646039) [fuzzing](https://en.wikipedia.org/wiki/Fuzzing) WarpBuilder.


#### 📈 Miscellaneous optimizations



*   André [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1536699) JIT optimizations for BigInt64Array and BigUint64Array.
*   Denis [replaced](https://bugzilla.mozilla.org/show_bug.cgi?id=1501608) the ELEMENT_SLOT in ScriptSourceObject with a callback function.
*   Ted [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1643750) Object.prototype.toString when called with a primitive value to not create a temporary object. This is pretty common on the web.
*   André [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1065894) JIT optimizations for DataView methods.
*   Iain [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1644590) a fast path to our JIT stubs for simple atom regular expressions.
*   Jan [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1636916) post-barriers in JIT code.
*   Tom [ported](https://bugzilla.mozilla.org/show_bug.cgi?id=1645018) String.prototype.concat to self-hosted code so it can take advantage of JIT optimizations.
*   André [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1564942) various optimizations for Math.pow and the **-operator.
*   Tom [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1647370) MIR optimizations based on the type of certain objects.
*   Jan [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1640829) the generated JIT code for unboxing Values.


#### 🧹 Miscellaneous changes



*   Logan [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1601179) async-stacks when devtools are open.
*   Jon [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1386298) the GCTrace framework (it wasn't used and didn't even compile).
*   Jason [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1637424) support for using generators in self-hosted code, for implementing the Iterator Helpers proposal.
*   Chris [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1641684) documentation for cross-compiling SpiderMonkey for ARM64
*   Jon [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1647319) a NestedIterator template and used it to clean up some iterator classes.
*   André [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1635431) a helper method for more robust MIR type checks, using an allow list instead of deny list
*   Jan [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1634698) new.target handling for eval frames.
*   Yoshi [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1628204) minor refactoring on SourceCompressionTask.


### WebAssembly


#### 🎁 New features



*   Asumu (from Igalia) [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1623628) support for [JS BigInt &lt;-> Int64 conversion](https://github.com/WebAssembly/JS-BigInt-integration) in Firefox 78.
*   Andy (from Igalia) enabled support for [calling multi-result WebAssembly functions from JavaScript](https://bugzil.la/1625887) as well as having [JavaScript return multiple values to WebAssembly](https://bugzil.la/1622828). 
*   Ryan [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1637884) support for [Reference types](https://github.com/WebAssembly/reference-types) in Firefox 79.
*   Ryan [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1528294) support for [Bulk-memory operations](https://github.com/WebAssembly/bulk-memory-operations) in Firefox 79.
*   Tom (from the DOM team) [re-enabled shared memory](https://bugzilla.mozilla.org/show_bug.cgi?id=1619649) in JS (for desktop systems) in Firefox 79, and in turn this enables [wasm thread operations ](https://github.com/webassembly/threads)in that same release.


#### 🧹 Other changes



*   Lars added SIMD support on x64 to the [Baseline](https://bugzilla.mozilla.org/show_bug.cgi?id=1478632) and [Ion](https://bugzilla.mozilla.org/show_bug.cgi?id=1631228) compilers (behind a flag)
*   Lars [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1639464) [various](https://bugzilla.mozilla.org/show_bug.cgi?id=1639517) SIMD [operations](https://bugzilla.mozilla.org/show_bug.cgi?id=1644424) in the Ion backend.
*   Ryan [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1629998) subclassing of certain WebAssembly objects.
*   Dmitry (from Igalia) [started](https://bugzilla.mozilla.org/show_bug.cgi?id=1599722) [landing](https://bugzilla.mozilla.org/show_bug.cgi?id=1639153) some changes to improve the call ABI.
*   Ryan [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1607784) freezing of the exports object to fix a performance issue.
*   Benjamin, Julian, and Chris made Cranelift work on ARM64, thus providing us (soon!) with an optimizing wasm compiler for the platform.
*   Chris [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1641504) support for multi-values to Cranelift on ARM64.

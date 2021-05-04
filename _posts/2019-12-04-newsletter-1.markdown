---
layout: post
title:  "SpiderMonkey Newsletter 1 (Firefox 72)"
author: SpiderMonkey Team
date:   2019-12-04 15:00:00 +0100
---

The SpiderMonkey team is experimenting with a newsletter at the end of each release cycle for status updates on ongoing projects, new features and contributor work. The format may change over time as we figure out what works best. This is our first newsletter and we'd love to hear your feedback!


### Contributors
*   Adam Holm [converted](https://bugzilla.mozilla.org/show_bug.cgi?id=1572504) [more](https://bugzilla.mozilla.org/show_bug.cgi?id=1572870) code to the [bytecode iterator interface](https://bugzilla.mozilla.org/show_bug.cgi?id=1478034).
*   André Bargull contributed many patches, for example [JIT optimizations for BigInt](https://bugzilla.mozilla.org/show_bug.cgi?id=1526870), [code cleanup](https://bugzilla.mozilla.org/show_bug.cgi?id=1599416) and [TypedArray index changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1129202). He also implemented various new language features (see below).
*   Rohit Awate [improved](https://bugzilla.mozilla.org/show_bug.cgi?id=1589072) error messages in the parser for numeric separators.
*   Philip Chimento [contributed fixes](https://bugzilla.mozilla.org/show_bug.cgi?id=1590907) for embedding SpiderMonkey in other projects.


### JavaScript

#### New features
*   Yulia Startsev [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1566141) the nullish coalescing (??) operator.
*   André Bargull [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1540021) String.prototype.replaceAll (Nightly-only for now).
*   André also [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1568903) Promise.any (Nightly-only for now).
*   André also added support for many [stage 3 Intl](https://github.com/tc39/proposals/blob/master/ecma402/README.md#stage-3) proposals. Many of them are Nightly-only because they depend on missing ICU functionality.


#### GC-free parsing
The JS engine is able to parse scripts on a background thread to improve page load performance. This currently requires support for off-thread GC allocation and collection, but this comes with a lot of complexity and [performance cliffs](https://bugzilla.mozilla.org/show_bug.cgi?id=1543776). To address this, Matthew Gaudet is [refactoring the frontend](https://bugzilla.mozilla.org/show_bug.cgi?id=1544117) so all GC allocation will happen on the main thread.

This cycle Matthew has been working on moving an increasing number of GC allocations to after parsing or bytecode emission (this work currently requires a JS shell flag). Chris Fallin did the [object literal part](https://bugzilla.mozilla.org/show_bug.cgi?id=1580246) of this work.  Next up is investigating doing the same for atoms.


#### Merging JSScript and LazyScript
SpiderMonkey can do full parsing (and bytecode generation) of JS functions lazily. This is great for performance and memory usage because most functions are never called. However, our representation of such ‘lazy functions’ came with a lot of complexity and limitations. Ted Campbell has been incrementally [working towards](https://bugzilla.mozilla.org/show_bug.cgi?id=1529456) merging the JSScript and LazyScript types to simplify this and improve performance and memory usage.


#### Regular Expression backend update
Our regular expression backend is a fork of V8’s irregexp engine. To support [new](https://bugzilla.mozilla.org/show_bug.cgi?id=1225665) [regular](https://bugzilla.mozilla.org/show_bug.cgi?id=1361856) [expression](https://bugzilla.mozilla.org/show_bug.cgi?id=1361876) [features](https://bugzilla.mozilla.org/show_bug.cgi?id=1362154) and to improve performance, Iain Ireland is [working on](https://bugzilla.mozilla.org/show_bug.cgi?id=1367105) a new import of the upstream irregexp code. The plan is to use a shim layer where possible so it will be much easier to do future updates.


#### WeakRefs
The GC team has started [implementing](https://bugzilla.mozilla.org/show_bug.cgi?id=1561074) the [WeakRef/FinalizationGroup proposal](https://github.com/tc39/proposal-weakrefs/blob/master/README.md). This is an advanced feature that can be used to keep track of objects without keeping them alive, and also get a callback when an object dies (is collected by the GC). This is not expected to be widely used by developers, but is essential for some use cases. For example it can be used to create a system of cross-worker proxies, whereby objects in different processes can refer to one another without leaking memory. A motivating use case is in supporting collection of acyclic references between WebAssembly and JS.


#### WritableStream
[ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) was [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1272697) a few years ago, but we were still missing support for [WritableStream](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream). Jeff Walden has been [working on](https://bugzilla.mozilla.org/show_bug.cgi?id=1582348) landing WritableStream support (behind a pref for now).


#### Object representation investigation
Each JS object currently has [both](https://searchfox.org/mozilla-central/rev/073b138dcba41cd3f858522e5f0a9ee73e39afa0/js/src/vm/JSObject.h#86-87) a Shape and ObjectGroup pointer. The shape and group distinction is subtle and we’d like to get this down to one pointer per object. We’ve discussed various strategies here, from Shypes to the more recent [Shuples](https://bugzilla.mozilla.org/show_bug.cgi?id=1589142) idea. Chris Fallin is leading this effort. As part of this project he [noticed](https://bugzilla.mozilla.org/show_bug.cgi?id=1590198) JS functions currently account for a large number of groups and has been prototyping ways to address this.


#### IonBuilder changes
IonBuilder is the ‘front-end’ of the Ion optimizing JIT, where MIR is generated from bytecode. We’re planning some large changes in this area in 2020 and this cycle Jan de Mooij landed the [first part](https://bugzilla.mozilla.org/show_bug.cgi?id=1595476) of this work, simplifying how control flow is handled. This ended up removing around 2500 lines of code, helps decoupling IonBuilder from the bytecode emitter, and unlocks future bytecode and IonBuilder changes.


#### Debugger
Logan Smyth and Jim Blandy are extending the Debugger API to [include async/await calls in stack traces](https://bugzilla.mozilla.org/show_bug.cgi?id=dbg-async-stacks). When this work is complete, calls to async functions that are awaiting a promise of another async function’s return value will appear on the stack in the firefox JavaScript debugger. This requires Debugger API extensions to get the promise of the return value from a Debugger.Frame for an async call; to obtain a promise’s reaction records; and to access the script, bytecode offset, callee function, etc. of a suspended call.

#### Miscellaneous
*   Anthony Ramine from the Servo team [improved and slimmed down](https://bugzilla.mozilla.org/show_bug.cgi?id=1591538) standalone SpiderMonkey tarballs.
*   Jon Coppeard [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1592537) an issue where the GC could block the main thread when all helper threads were busy. Telemetry infrastructure [detected](https://groups.google.com/forum/#!topic/mozilla.dev.telemetry-alerts/JlDUfBworWQ) an improvement after this landed.
*   Jan de Mooij [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1330776) the internal JS string representation so strings are no longer null-terminated. This removed a lot of complexity and [saved](https://bugzilla.mozilla.org/show_bug.cgi?id=1330776#c12) a bit of memory.
*   Caroline Cullen is working on [landing](https://bugzilla.mozilla.org/show_bug.cgi?id=1588861) XDR encoded modules. This will eventually allow caching standard modules instead of JSM in the browser frontend.


### WebAssembly

#### Bulk memory operations

Ryan Hunt [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1570112) the `memory.copy` and `memory.fill` operations for the [bulk memory operations proposal](https://github.com/WebAssembly/bulk-memory-operations/).


#### Wasm/JS fast calls with references
Lars Hansen [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1581572) calls between JS and wasm much faster when JS values are passed via anyref.


#### Wasm Cranelift
[Cranelift](https://github.com/CraneStation/cranelift) is a code generator (written in Rust) that we want to [use in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1488718) as the next optimizing compiler for WebAssembly.



*   There has been a lot of work on the Wasm SIMD implementation on x86-64 by @abrown.
*   @nbp and @sstangl switched the control-flow layout representation from extended basic blocks (EBB) to basic blocks. (Extended blocks can have side-exits, i.e. conditional jumps within the block, and were supposed to reduce memory, but introduced more complexity for all optimization passes and algorithms.)
*   Support for wasm multi-value [has landed in Cranelift](https://bytecodealliance.org/articles/multi-value-all-the-wasm), thanks to @fitzgen. It’s not available in Cranelift-in-Spidermonkey yet.
*   Support for more int128 opcodes has been landing, thanks to @krk, @bjorn3 and @ryzokuken. While not directly useful for wasm in Spidermonkey, it’s useful for the rustc Cranelift backend.
*   Ongoing work on register allocation [is happening](https://github.com/bytecodealliance/cranelift/issues/1246), to replace the current graph coloring algorithm by the same backtracking algorithm as the one used in Spidermonkey’s high-end optimizing compiler IonMonkey.
*   Many miscellaneous contributions from external contributors: @jyn514, @data-pup, @projal, @XAMPPRocky, @oli-cosmian, @joshtriplett, @yjhmelody (in no particular order). From Mozilla contributors too: @peterhuene, @sstangl, @bnjbvr, @alexcrichton, @sunfishcode.


#### Ongoing work
*   The [multi-value proposal](https://github.com/WebAssembly/multi-value/blob/master/proposals/multi-value/Overview.md) allows WebAssembly functions and blocks to return multiple values. Andy Wingo from Igalia is [making steady progress](https://bugzilla.mozilla.org/show_bug.cgi?id=1401675) implementing this feature in SpiderMonkey.
*   Igalia (Asumu Takikawa) is also [working on](https://bugzilla.mozilla.org/show_bug.cgi?id=1511958) the [JS-BigInt-integration proposal](https://github.com/WebAssembly/JS-BigInt-integration), so i64 values in WebAssembly can be converted to/from JavaScript BigInt.
*   Tom Tung, Anne van Kesteren and others are [working](https://bugzilla.mozilla.org/show_bug.cgi?id=1477743) on [re-enabling](https://groups.google.com/forum/#!msg/mozilla.dev.platform/IHkBZlHETpA/dwsMNchWEQAJ) SharedArrayBuffer by default.

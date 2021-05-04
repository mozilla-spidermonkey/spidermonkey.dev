---
layout: post
title:  "SpiderMonkey Newsletter 7 (Firefox 82-83)"
author: SpiderMonkey Team
date:   2020-10-27 16:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 82 and 83 Nightly release cycles.

If you like these newsletters, you may also enjoy Yulia's [Compiler Compiler live stream](https://hacks.mozilla.org/2020/06/compiler-compiler-working-on-a-javascript-engine/).

### 🏆 New contributors
*   Yozaam [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1651208) part of our private fields implementation.


### 👷🏽‍♀️ New features

#### Firefox 82-83
*   Adam [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1658318) `Reflect[Symbol.toStringTag]` and Jeff [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1670053) `Intl[Symbol.toStringTag]`.

#### In progress
*   Tom [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1658308) the [.item proposal](https://github.com/tc39/proposal-item-method), but this feature had to be backed out after a few days because it caused various web compatibility issues.
*   Yulia is [making progress](https://bugzilla.mozilla.org/show_bug.cgi?id=1519100) implementing [Top-level await](https://github.com/tc39/proposal-top-level-await).
*   Jessica from Igalia [started](https://bugzilla.mozilla.org/show_bug.cgi?id=1651725) implementing the Wasm [type reflection proposal](https://github.com/WebAssembly/js-types/blob/master/proposals/js-types/Overview.md).
*   Ryan [started](https://bugzilla.mozilla.org/show_bug.cgi?id=1664361) implementing the Wasm function-references proposal.
*   Ryan [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1649247) the Wasm _eqref_ type.


### 🚀 WarpBuilder
[WarpBuilder](https://bugzilla.mozilla.org/show_bug.cgi?id=1613592) is the JIT project to replace the frontend of our optimizing JIT (IonBuilder) and the engine's Type Inference mechanism with a new MIR builder based on compiling CacheIR to MIR. WarpBuilder will let us improve security, performance, memory usage and maintainability of the whole engine.

We have [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1666417) WarpBuilder by default for Firefox 83 🎉 This [resulted](https://lists.mozilla.org/pipermail/dev-platform/2020-September/025807.html) in improved responsiveness, page load performance and memory usage. Feedback from Nightly users has been very positive.

A few of the other Warp changes that landed the past months:

*   Iain [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1661352) [many](https://bugzilla.mozilla.org/show_bug.cgi?id=1664357) [improvements](https://bugzilla.mozilla.org/show_bug.cgi?id=1666039) for (trial) inlining.
*   Jan [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1661211) getter/setter calls [and](https://bugzilla.mozilla.org/show_bug.cgi?id=1668532) optimized Wasm calls to the transpiler.
*   Tom ported optimizations for DOM [getters](https://bugzilla.mozilla.org/show_bug.cgi?id=1664617), [setters](https://bugzilla.mozilla.org/show_bug.cgi?id=1665396), [methods](https://bugzilla.mozilla.org/show_bug.cgi?id=1668557) and certain [proxies](https://bugzilla.mozilla.org/show_bug.cgi?id=1668831).
*   Caroline [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1657206) [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1662943) to [improve](https://bugzilla.mozilla.org/show_bug.cgi?id=1666615) the CacheIR analysis tool.
*   André added CacheIR optimizations for [function.name](https://bugzilla.mozilla.org/show_bug.cgi?id=1643944), [arguments[Symbol.iterator]](https://bugzilla.mozilla.org/show_bug.cgi?id=1643948), [Object.prototype.isPrototypeOf](https://bugzilla.mozilla.org/show_bug.cgi?id=1664195).
*   Tom [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1663260) CacheIR optimizations for `toString` and `valueOf` on numbers and strings.
*   André [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1665348) [more](https://bugzilla.mozilla.org/show_bug.cgi?id=1664990) CacheIR instructions in the transpiler.


### 🧹 Garbage Collection
*   Jon [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1635185) a header to dynamic object slots to store the object slot span and capacity.
*   Jon [refactored](https://bugzilla.mozilla.org/show_bug.cgi?id=1668825) the tracing interface and [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1661766) how slots and elements are stored on the mark stack. These changes will help us experiment with concurrent marking.
*   Jon [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1666853) the GC barrier code.


### ❇️ Stencil
[Stencil](https://bugzilla.mozilla.org/show_bug.cgi?id=1601332) is our project to create an explicit interface between the frontend (parser, bytecode emitter) and the rest of the VM, decoupling those components. This lets us improve web-browsing performance, simplify a lot of code and improve bytecode caching.

*   Kannan [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1660798) the ParserAtom conversion. The frontend no longer depends on the GC to allocate atoms.
*   Ted [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1664312) [various](https://bugzilla.mozilla.org/show_bug.cgi?id=1666274) follow-up optimizations for ParserAtoms.
*   Arai [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1662140) a browser pref that switches off-thread parsing to use the Stencil format instead of off-thread GC allocations.
*   Kannan [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1659104) support for serializing the Stencil format to XDR.
*   Arai [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1662274) [support](https://bugzilla.mozilla.org/show_bug.cgi?id=1663962) for incremental XDR-encoding.
*   Denis [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1664475) telemetry probes for JS parsing and execution.
*   Arai [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1649968) [the](https://bugzilla.mozilla.org/show_bug.cgi?id=1661079) [Stencil](https://bugzilla.mozilla.org/show_bug.cgi?id=1660699) [data](https://bugzilla.mozilla.org/show_bug.cgi?id=1658971) [structures](https://bugzilla.mozilla.org/show_bug.cgi?id=1658631) to support moving between threads.
*   Arai [cleaned](https://bugzilla.mozilla.org/show_bug.cgi?id=1664293) [up](https://bugzilla.mozilla.org/show_bug.cgi?id=1669790) the interaction of Stencil with delazification.
*   Matthew [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1659595) handling of BigInt properties in the frontend.
*   Ted [updated](https://bugzilla.mozilla.org/show_bug.cgi?id=1623761) [Debugger](https://bugzilla.mozilla.org/show_bug.cgi?id=1623763) to compile less when inserting breakpoints.


### ⚡ WebAssembly
*   Benjamin [enabled](https://bugzilla.mozilla.org/show_bug.cgi?id=1660944) Cranelift by default for ARM64 hardware in Nightly builds.
*   Lars [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1609381) support for SIMD instructions on ARM64 to the baseline compiler.
*   Dmitry from Igalia [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1639153) more call ABI changes for speeding up indirect calls.


### 📚 Miscellaneous changes
*   Jason [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1412202) lexical variables in generators and async functions.
*   Tom Ritter [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1656588) a `disnative` shell function for disassembling JIT/Wasm code.
*   Nicolas [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1661256) the `callWithABI` interface. This lets us generate ABI tests for each signature.
*   Steve [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1669306) jsapi-tests faster by letting tests reuse a JS context/global.
*   Iain [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1661763) a `jitsrc` command for [rr](https://rr-project.org/) to help debug JIT code.
*   Jeff [started](https://bugzilla.mozilla.org/show_bug.cgi?id=1663365) splitting up jsfriendapi.h into smaller headers.
*   Jon and André [cleaned up](https://bugzilla.mozilla.org/show_bug.cgi?id=1669181) many headers, [removing](https://bugzilla.mozilla.org/show_bug.cgi?id=1664810) a lot of unnecessary #includes.
*   Arai [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1660538) documentation explaining how [async functions](https://searchfox.org/mozilla-central/rev/61728de8273c04fe2417c475fc0637e8b79210d7/js/src/vm/AsyncFunction.h#17) and [async generators](https://searchfox.org/mozilla-central/rev/61728de8273c04fe2417c475fc0637e8b79210d7/js/src/vm/AsyncIteration.h#18) are implemented.
*   Jan and Ryan [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1666494) [a lot of](https://bugzilla.mozilla.org/show_bug.cgi?id=1669784) code for TypedObject. This feature has been non-standard and Nightly-only for years, but the underlying code is now being reused for Wasm GC support.
*   Jon [simplified](https://bugzilla.mozilla.org/show_bug.cgi?id=1663616) [locking](https://bugzilla.mozilla.org/show_bug.cgi?id=1665572) for helper thread tasks.
*   Iain [cleaned up](https://bugzilla.mozilla.org/show_bug.cgi?id=1662915) the bailout code in the Ion backend.
*   Denis [made](https://bugzilla.mozilla.org/show_bug.cgi?id=1652126) canceling off-thread parse tasks more robust.

---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 94-95)"
date:   2021-11-08 16:00:00 +0100
---
SpiderMonkey is the JavaScript engine used in Mozilla Firefox. This newsletter gives an overview of the JavaScript and WebAssembly work we’ve done as part of the Firefox 94 and 95 Nightly release cycles.


### 👷🏽‍♀️ JS features



* The stage 2 'Change Array by copy' [proposal](https://github.com/tc39/proposal-change-array-by-copy#readme) has been [implemented](https://bugzilla.mozilla.org/show_bug.cgi?id=1729563) behind a flag.


### ⚡ WebAssembly



* We [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1728897) more [changes](https://bugzilla.mozilla.org/show_bug.cgi?id=1728899) for Wasm [exception](https://github.com/WebAssembly/exception-handling/blob/master/proposals/exception-handling/Exceptions.md) support.
* Executable code for Wasm modules can now be [cached](https://bugzilla.mozilla.org/show_bug.cgi?id=1487113) in the network cache. We also [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1545131) gzip compression for this.
* The fuzzing team [integrated](https://bugzilla.mozilla.org/show_bug.cgi?id=1720866) the [wasm-smith](https://github.com/bytecodealliance/wasm-tools/tree/main/crates/wasm-smith) fuzzer in SpiderMonkey.
* We [prototyped](https://bugzilla.mozilla.org/showdependencytree.cgi?id=1706922&hide_resolved=0) various instructions that are part of the Relaxed SIMD [proposal](https://github.com/WebAssembly/relaxed-simd/blob/main/proposals/relaxed-simd/Overview.md).
* Code allocation failures are now [reported](https://bugzilla.mozilla.org/show_bug.cgi?id=1337723) to the console.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1728781) a performance cliff in the register allocator that caused hangs on certain large Wasm modules.
* We [landed](https://bugzilla.mozilla.org/show_bug.cgi?id=1727084) the remaining functionality for [Wasm64](https://github.com/WebAssembly/memory64/blob/main/proposals/memory64/Overview.md).
* Type definitions for Wasm GC support are now properly [collected](https://bugzilla.mozilla.org/show_bug.cgi?id=1731121).


### ❇️ Stencil

[Stencil](https://bugzilla.mozilla.org/show_bug.cgi?id=1601332) is our project to create an explicit interface between the frontend (parser, bytecode emitter) and the rest of the VM, decoupling those components. This lets us improve web-browsing performance, simplify a lot of code and improve bytecode caching.



* We've [migrated](https://bugzilla.mozilla.org/show_bug.cgi?id=1688788) Gecko's ScriptPreloader to use the new Stencil XDR serialization format.
* We were then able to [remove](https://bugzilla.mozilla.org/show_bug.cgi?id=1688791) the legacy, error-prone XDR code and [replace](https://bugzilla.mozilla.org/show_bug.cgi?id=1662152) the JSScript cloning mechanism with sharing stencils.
* These changes also allowed us to [tighten](https://bugzilla.mozilla.org/show_bug.cgi?id=1718623) invariants for scripts with non-syntactic scopes, allowing us to [move](https://bugzilla.mozilla.org/show_bug.cgi?id=1718952) certain checks from the VM to the bytecode emitter.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1721413) string literals to not always require atomization because this can be slow.
* With these changes, the new Stencil architecture is utilized for all existing scenarios and the error-prone legacy code is now all removed. This unified architecture allows us to continue improving caching and speculation techniques with far less risk of stability or correctness bugs. Congratulations to the team for passing this milestone. 🎉


### 🚿DOM Streams

We're [moving](https://bugzilla.mozilla.org/show_bug.cgi?id=1730556) our implementation of the [Streams specification](https://streams.spec.whatwg.org/) out of SpiderMonkey into the DOM. This lets us take advantage of Gecko's WebIDL machinery, making it much easier for us to implement this complex specification in a standards-compliant way and stay up-to-date. 

A preliminary implementation of ReadableStreams (without integration into other browser specifications) has landed disabled, but it’s a bit too early for people to play with yet. 


### 🧹Garbage Collection



* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1717553) a memory leak involving weak maps. This leak affected some popular websites.
* We [changed](https://bugzilla.mozilla.org/show_bug.cgi?id=1734801) permanent atoms and symbols to always be marked, this let us remove checks for this from the marking path.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1536061) gray root marking to be incremental. This fixes a source of long GC slices.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1531951) the rooting hazard static analysis to handle virtual method calls better. We also [parallelized](https://bugzilla.mozilla.org/show_bug.cgi?id=1582898) the call graph generation step.
* We [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1727157) some overhead from the gray unmarking code that showed up in hang stacks.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1724980) a performance issue where we could collect the nursery even if it's empty or disabled.


### 🌍 Unified Intl implementation 

Work is underway to [unify](https://bugzilla.mozilla.org/show_bug.cgi?id=1686965) the Intl (Internalization) code in SpiderMonkey and the rest of Gecko as a shared `mozilla::intl` component. This results in less code duplication and will make it easier to [migrate](https://bugzilla.mozilla.org/show_bug.cgi?id=1713916) from the ICU library to [ICU4X](https://github.com/unicode-org/icu4x) in the future. 



* We unified [ListFormat](https://bugzilla.mozilla.org/show_bug.cgi?id=1719747), [AvailableCollations](https://bugzilla.mozilla.org/show_bug.cgi?id=1728183), [DateIntervalFormat](https://bugzilla.mozilla.org/show_bug.cgi?id=1719678), [DateTime](https://bugzilla.mozilla.org/show_bug.cgi?id=1731620), [LanguageTag](https://bugzilla.mozilla.org/show_bug.cgi?id=1719746) and others.
* We [modernized](https://bugzilla.mozilla.org/show_bug.cgi?id=1736834) `intl::Locale`.
* We [cleaned up](https://bugzilla.mozilla.org/show_bug.cgi?id=1713206) error handling in the unified Intl code.


### 🗂 ReShape

ReShape is a project to optimize and simplify our object layout and property representation after removing TI. This will help us fix some long-standing issues related to performance, memory usage and code complexity.



* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1728565) object allocation by moving handling of TypedArrays and ArrayBuffers out of the generic allocation path
* We were then able to [remove](https://bugzilla.mozilla.org/show_bug.cgi?id=1729867) the NewObjectCache, saving some memory.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1730699) property enumeration for for-in with null/undefined to reuse the same empty iterator.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1733075) the generic property enumeration code to do less work in most cases.


### 📚 Miscellaneous



* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1720422) a better JSAPI based on templates for Typed Arrays and ArrayBuffers.
* We are [experimenting](https://bugzilla.mozilla.org/show_bug.cgi?id=1736057) with suppressing the lazy parser when parsing off-main-thread. This improves page load performance in a number of scenarios.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1734405) comparisons with small constant strings to generate specialized JIT code.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=725966) comparisons of the form `typeof x === "y"`. This fixes an old bug that was filed almost 10 years ago!
* We [moved](https://bugzilla.mozilla.org/show_bug.cgi?id=1708275) the [documentation](https://firefox-source-docs.mozilla.org/js/test.html) for running our test suites into firefox-source-docs.
* We [optimized](https://bugzilla.mozilla.org/show_bug.cgi?id=1734152) some code in the register allocator to avoid iterating over many unrelated registers.
* We [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1725587) markers to JIT code generation debug output to make the output easier to read.
* We [started](https://bugzilla.mozilla.org/show_bug.cgi?id=1730426) tidying up and enforcing invariants for the context's exception state.
* We [fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=1734087) a performance issue where JS code throwing many exceptions was very slow due to collecting exception stacks.
* Lukas.bernhard [added](https://bugzilla.mozilla.org/show_bug.cgi?id=1713008) shape information to our CacheIR Health Report tool.
* TheIDInside [updated](https://github.com/carolinecullen/cacheirhealthreport/pull/36/files) the UI for CacheIR Health Report to add a filter for JS opcodes.



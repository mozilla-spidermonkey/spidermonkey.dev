---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 124-125)"
date:   2024-03-20 18:00:00 +0100
---

Hello and Welcome to the SpiderMonkey Newsletter for Firefox 124-125. It's Matthew Gaudet back again. This newsletter is a way in which we can share what we have been working on as a team, and highlight some interesting changes when they happen.

### 🚀 Performance

We have been hard at work making sure that Firefox's performance on Speedometer 3 was excellent. With the [official release of Speedometer 3](https://browserbench.org/announcements/speedometer3/) we are very happy the [fruits of our labour](https://hacks.mozilla.org/2024/03/improving-performance-in-firefox-and-across-the-web-with-speedometer-3/). 

Even though Speedometer3 will ship while Firefox release is version 123, that doesn't mean that we have stopped working on performance! 

* Jon [shipped Parallel Marking](https://bugzilla.mozilla.org/show_bug.cgi?id=1875117)! 🎉 To quote the bug: 
	- "20-30% reduction in GC time across desktop platforms"
	- "10% reduction in GC max pause time"
	- "10% fewer GC slices"
	- "Telemetry indicates this is working well. Mark rate increased by 50-60%, median total GC time decreased by 35% (and by more for longer collections) and median max pause time decreased by 20%."
* Ben [improved the performance of small Wasm GC Arrays through inline data storage and JIT allocation](https://bugzilla.mozilla.org/show_bug.cgi?id=1863435).
* I [made it possible for functions that only use `arguments.length` to avoid allocating the `arguments` object](https://bugzilla.mozilla.org/show_bug.cgi?id=1825722).
* Jan [optimized the CacheIR for DOM Proxies](https://bugzilla.mozilla.org/show_bug.cgi?id=1863543), leading to some [performance improvements on splay](https://bugzilla.mozilla.org/show_bug.cgi?id=1863543#c7). 
* I [added support for invalidating Ion code in response to a fuse being popped, and used this to avoid checking for the odd case of `document.all`](https://bugzilla.mozilla.org/show_bug.cgi?id=1866158) on every single equality comparison involving an object. In this case the actual optimization is far less important than the machinery that drives it. 
* Alex added an [optimization for `HasOwn`](https://bugzilla.mozilla.org/show_bug.cgi?id=1873964) which for small numbers of atoms just unrolls the loop. 
* Jon [fixed the potential for some marking to go quadratic](https://bugzilla.mozilla.org/show_bug.cgi?id=1875030).
* Andre [added CacheIR support for non-number inputs when assigning to TypedArray elements](https://bugzilla.mozilla.org/show_bug.cgi?id=1876227), [tripling our performance on a test page](https://bugzilla.mozilla.org/show_bug.cgi?id=1876227#c5). 


### Contributor Spotlight 

Sometimes a contributor comes along who decides that one of the ways they can help is by taking ownership of an area, and making steady improvement forwards. This was the case with Vinny Diehl who has come in and become an expert on [`Date.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse). This is a challenging method, because it is simultaneously commonly used while extremely underspecified, leading to lots of implementation defined behaviour. This kind of implementation defined behaviour can be bad for Firefox, as dates that are parsed correctly by Chrome or Safari might not be parsed correctly by Firefox, leading to web interoperability problems. 

Vinny has been working on improving this, and has made enormous strides in helping to push this challenging area forward. In his own words: 

> [Vinny Diehl](https://github.com/vinnydiehl) is a helicopter pilot who dabbles in software development and reverse engineering in his spare time. He has worked on flight simulators, game engines, and Nintendo decompilation projects, among other things. With a growing interest in browser work, he has made it his mission to perfect SpiderMonkey's date parsing compatibility. You can view some of his work in [the meta bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1274354).

Huge amounts of gratitude to Vinny for tackling this and making Firefox more compatible for everyone. 

### ⚡ Wasm
- Ben [shipped Wasm Multi-memory](https://bugzilla.mozilla.org/show_bug.cgi?id=1860816)! 🎉
- Ryan[ landed a bunch of improvements to the js-string-builtins proposal](https://bugzilla.mozilla.org/show_bug.cgi?id=1876148), which enables efficient access to JS Strings from wasm code.
- Yury [has updated the wasm exception handling proposal](https://bugzilla.mozilla.org/show_bug.cgi?id=1873776), which now in Nightly and early-beta.

### 🕸️ Web Features Work
- André Bargull [landed support for resizable and growable ArrayBuffers](https://bugzilla.mozilla.org/show_bug.cgi?id=1842773). 🎉
- André also [enabled `Intl.Segmenter` by default](https://bugzilla.mozilla.org/show_bug.cgi?id=1883914)! 🎉

### 👷🏽‍♀️  Other Work
* Jan has made [it possible to use the Firefox Pref system inside of SpiderMonkey](https://bugzilla.mozilla.org/show_bug.cgi?id=1877193). This is going to make it dramatically easier to make code activate conditionally with far less boilerplate than currently exists, and naturally cooperates directly with the current Firefox Preferences system!
- Arai [added a whole bunch of dumping code for various internal data structures](https://bugzilla.mozilla.org/show_bug.cgi?id=1783397); this sort of work makes it easier to debug issues when they occur. 
- Arai [created a SAX like JSON parse API](https://bugzilla.mozilla.org/show_bug.cgi?id=1858803) to avoid some JSON parse consumers having to create a whole global simply to parse some JSON. 
- Jon [fixed a papercut with `oomTest` that I have personally run into many times](https://bugzilla.mozilla.org/show_bug.cgi?id=1881310). Thank you Jon!


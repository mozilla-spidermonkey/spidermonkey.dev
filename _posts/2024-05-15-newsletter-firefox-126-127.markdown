---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 126-127)"
date:   2024-05-15 18:00:00 +0100
---

Hello and welcome to our newest newsletter. As the northern hemisphere warms and the southern hemisphere cools, we write to talk about what's happened in the world of SpiderMonkey in the Firefox 126-127 timeline.

### 🚀 Performance

Though Speedometer 3 has shipped, we cannot allow ourselves get lax with our performance. It's important that SpiderMonkey be fast so Firefox can be fast!

- Arai added [special bytecode for checking `typeof val == "type"`](https://bugzilla.mozilla.org/show_bug.cgi?id=1862273)
- Justin analyzed our caches for atoms, which turn out to be a reasonably hot path, [and discovered that he could improve them](https://bugzilla.mozilla.org/show_bug.cgi?id=1879143). Our [perf-alerts noticed some interesting speedups up to 8% on some tests](https://treeherder.mozilla.org/perfherder/alerts?id=41941)!
- Jan has been playing with [trampolines](https://en.wikipedia.org/wiki/Trampoline_(computing)). Changing [how we handle the comparator function to Array.prototype.sort](https://bugzilla.mozilla.org/show_bug.cgi?id=1884360) improved performance, particularly at lower tiers, up to 4x! 
- Alex [added a new string type](https://bugzilla.mozilla.org/show_bug.cgi?id=1881995) which holds a pointer to a corresponding atom, allowing cheap atom lookup. 
- André has [worked on](https://bugzilla.mozilla.org/show_bug.cgi?id=1889091) [improving calls](https://bugzilla.mozilla.org/show_bug.cgi?id=1890513) to native functions with variadic parameters. 


### 🔦 Contributor Spotlight

This newsletter, we'd like to Spotlight Jonatan Klemets. In his own words, 

> A full-stack web developer by day and a low-level enthusiast by night who likes tinkering with compilers, emulators, and other low-level projects

Jonatan has been helping us for a few years now and has been the main force of late driving forwards our work on the [Import Attributes proposal](https://github.com/tc39/proposal-import-attributes). Pushing this proposal forward has required jumping into many different parts of Firefox, and Jonatan has done really well, and we are very thankful for the effort he has put into working on the project.

### ⚡ Wasm

- Yury has been working on the [JavaScript-Promise Integration Proposal](https://github.com/WebAssembly/js-promise-integration/blob/main/proposals/js-promise-integration/Overview.md), which when it's all finished, will allow easier interop between Wasm and JS Promises. 
- Ben has done some work on [optimizing out superfluous casts](https://bugzilla.mozilla.org/show_bug.cgi?id=1863609)
- Julien has shipped the[ Wasm branch hinting proposal](https://bugzilla.mozilla.org/show_bug.cgi?id=1837683).

### 🕸️ Web Features Work

- Dan [has shipped](https://bugzilla.mozilla.org/show_bug.cgi?id=1805038) the [new Set methods proposal](https://github.com/tc39/proposal-set-methods)

### 👷🏽‍♀️  Other Work

- [We were Pwned](https://www.mozilla.org/en-US/security/advisories/mfsa2024-15/) by Manfred Paul at Pwn2Own 2024, but [fixed builds shipped in 21 hours](https://blog.mozilla.org/security/2024/04/04/rapidly-leveling-up-firefox-security/), [first of the vendors at the competition](https://twitter.com/thezdi/status/1771296997787443370).

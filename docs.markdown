---
layout: default
title: Docs
permalink: /docs/
---

# Docs

## Understanding the engine

---
* [Overview of SpiderMonkey](https://firefox-source-docs.mozilla.org/js/index.html)
* [Browse the code](https://searchfox.org/mozilla-central/source/js/src)
* [SMDOC Source Comments](https://searchfox.org/mozilla-central/search?q=[SMDOC]&path=js%2F)

## In-depth Articles:

---
* [Warp: Improved JS Performance](https://hacks.mozilla.org/2020/11/warp-improved-js-performance-in-firefox-83/)
* [Compiler Compiler: A Twitch series](https://hacks.mozilla.org/2020/06/compiler-compiler-working-on-a-javascript-engine/)
* [A New RegExp Engine](https://hacks.mozilla.org/2020/06/a-new-regexp-engine-in-spidermonkey/)
* [Future-proofing the Debugger Implementation](https://hacks.mozilla.org/2020/03/future-proofing-firefoxs-javascript-debugger-implementation/)
* [The Baseline Interpreter](https://hacks.mozilla.org/2019/08/the-baseline-interpreter-a-faster-js-interpreter-in-firefox-70/)

## Embedding SpiderMonkey

---
* [Examples and Documentation](https://github.com/mozilla-spidermonkey/spidermonkey-embedding-examples)
* [Custom Architectures readme](./custom-architectures.md)
* [Proposal template for ports](./port-proposal-template.md)
* [mozilla.dev.tech.js-engine (ARCHIVED)](https://groups.google.com/g/mozilla.dev.tech.js-engine)
* [mozilla.dev.tech.js-engine.internals (ARCHIVED)](https://groups.google.com/g/mozilla.dev.tech.js-engine.internals)

# The Monkeys

John Howard created some amazing images for SpiderMonkey.

## BaldrMonkey

---
<img class="gallery__poster" src="/assets/img/baldr.jpg" alt="Baldr Remote" title="Baldr Remote"/>

#### Task: WebAssembly Compiler
#### Status: Ongoing
* [Making asm.js/WebAssembly compilation more parallel in Firefox](https://blog.benj.me/2016/04/22/making-asmjs-webassembly-compilation-more-parallel) Benjamin Bouvier (2016) (story of the refactoring of Odin into Baldr + parallel compilation)
* [Calls between JavaScript and WebAssembly are finally fast 🎉](https://hacks.mozilla.org/2018/10/calls-between-javascript-and-webassembly-are-finally-fast-%f0%9f%8e%89/), Lin Clark (2018) (fast calls between JIT and WebAssembly in both ways)
* [Making WebAssembly even faster: Firefox’s new streaming and tiering compiler](https://hacks.mozilla.org/2018/01/making-webassembly-even-faster-firefoxs-new-streaming-and-tiering-compiler/), _Lin Clark_ (2018)
* [firefox's low-latency webassembly compiler](https://wingolog.org/archives/2020/03/25/firefoxs-low-latency-webassembly-compiler), _Andy Wingo_ (2020)
* [John Howard's notes on the image](http://monkeyink.com/ink/blog/archives/2016/08/_this_is_a_fun.php)

## IonMonkey

---
<img class="gallery__poster" src="/assets/img/ion.jpg" alt="Ion Remote" title="Ion Remote"/>
#### Task: Optimizing Compiler
#### Status: Ongoing
* [IonMonkey in Firefox 18](https://blog.mozilla.org/javascript/2012/09/12/ionmonkey-in-firefox-18/), _David Anderson_ (2012)
* [Just-in-Time Value specialization](https://ieeexplore.ieee.org/document/6495006), _Igor Costa, Péricles Alves, Henrique Nazaré Santos, Fernando Magno Quintão Pereira_, CGO (2013) 🎓 [📄](https://homepages.dcc.ufmg.br/~fernando/publications/papers/CGO13_igor.pdf)
* [Recover Instructions](https://nbp.github.io/slides/RInstruction/), _Nicolas B. Pierron_ (2014)
* [Optimizing Away](https://blog.mozilla.org/javascript/2014/07/15/ionmonkey-optimizing-away/), _Nicolas B. Pierron_ (2014)
* [Evil on your behalf](https://blog.mozilla.org/javascript/2016/07/05/ionmonkey-evil-on-your-behalf/), _Nicolas B. Pierron_ (2016)
* [Branch Pruning](https://nbp.github.io/slides/VMM/BranchPruning/), _Nicolas B. Pierron_ (2016)
* [John Howard's posters archive, and a bit about Ion Monkey](http://monkeyink.com/ink/?func=posters&bit=posters5)


## JaegerMonkey

---
<img class="gallery__poster" src="/assets/img/jaeger.jpg" alt="jaeger Remote" title="jaeger Remote"/>
#### Task: The first method compiler in SpiderMonkey
#### Status: Deceased
* [Improving JavaScript performance with JägerMonkey](https://hacks.mozilla.org/2010/03/improving-javascript-performance-with-jagermonkey/), ? (2010)
* [Starting JägerMonkey](http://web.archive.org/web/20120420011230/https://blog.mozilla.org/dmandelin/2010/02/26/starting-jagermonkey/), _Dave Mandelin_ (2010)
* [Land Ho, Fast JavaScript](http://www.bailopan.net/blog/?p=768), _David Anderson_ (2010)
* [JaegerMonkey development diary - shaping up THE JavaScript engine for Firefox 4.0](https://www.digit.in/features/general/jaegermonkey-development-diary-shaping-up-the-javascript-engine-for-firefox-4-0-5151.html), _Soumya Deb_ (2010)

## OdinMonkey

---
<img class="gallery__poster" src="/assets/img/odin.jpg" alt="odin Remote" title="odin Remote"/>

#### Task: ASM.js compiler
#### Status: Deceased
* [asm.js in Firefox Nightly](https://blog.mozilla.org/luke/2013/03/21/asm-js-in-firefox-nightly/), _Luke Wagner_ (2013)
* [asm.js AOT compilation and startup performance](https://blog.mozilla.org/luke/2014/01/14/asm-js-aot-compilation-and-startup-performance/), _Luke Wagner_ (2014)




---
layout: post
title: "Saying goodbye to asm.js"
author: Ryan Hunt
date: 2026-05-18 12:00:00 -0500
description: Disabling asm.js optimizations in SpiderMonkey
---

> Axe-time, sword-time, shields are sundered,  
> Wind-time, wolf-time, ere the world falls.  
> -- [*Völuspá*, Poetic Edda](https://sacred-texts.com/neu/poe/poe03.htm)

As of Firefox 148, SpiderMonkey's asm.js optimizations are disabled by default, and we plan to remove the code entirely in a future release. If you maintain a site that uses asm.js, nothing will break. asm.js is a strict subset of plain JavaScript, so the code keeps running through our regular JIT just like any other script. That said, recompiling to WebAssembly will get you faster execution and smaller binaries.

## History

[asm.js](http://asmjs.org/) was Mozilla's response to the question posed by [NaCl and PNaCl](https://en.wikipedia.org/wiki/Google_Native_Client): how can the Web run code at speeds close to native? The idea was clever: pick a strict, statically-typed subset of JavaScript that an engine could recognize on the fly and compile down to native code.

asm.js shipped in [Firefox 22 back in 2013](https://blog.mozilla.org/mbest/2013/06/25/asm-js-its-really-fast-backwards-compatible-and-now-in-the-release-version-of-firefox/) and was a success. It let projects like Unity and Unreal ship C and C++ codebases to the web for the first time, using just standard web technologies. The [Epic Citadel demo](https://blog.mozilla.org/futurereleases/2013/05/02/epic-citadel-demo-shows-the-power-of-the-web-as-a-platform-for-gaming/) was a landmark, and a fond memory for the original asm.js team.

asm.js proved that we could run code at near-native speed on the Web using the just Web technology (no plugins or separate sandbox). This opened the door to [WebAssembly](https://webassembly.org/), which shipped several years later in [Firefox 52](https://www.firefox.com/en-US/firefox/52.0/releasenotes/). Without asm.js, we wouldn't have WebAssembly.

## Why now?

So why turn it off? WebAssembly has succeeded, and asm.js usage has fallen significantly. Keeping the asm.js path alongside WebAssembly costs us maintenance time and gives us extra attack surface in the VM.

If you are shipping asm.js content, please consider recompiling to WebAssembly. Our WebAssembly pipeline is significantly more advanced than the asm.js one ever was. You should see faster execution and smaller binaries.

## Ragnarok

[OdinMonkey](https://wiki.mozilla.org/Javascript:SpiderMonkey:OdinMonkey)

The asm.js compiler is called OdinMonkey, and [`Ragnarök`](https://bugzilla.mozilla.org/show_bug.cgi?id=ragnarok) tracks the "Twilight of OdinMonkey". OdinMonkey is survived by BaldrMonkey, our WebAssembly optimizing compiler, and Rabaldr (["racket" or "commotion"](https://en.wiktionary.org/wiki/rabalder)), our WebAssembly baseline compiler.

Thank you to OdinMonkey for thirteen years of service. Skål!

> Then fields unsowed bear ripened fruit,  
> all ills grow better, and Baldr comes back;  
> Baldr and Hoth dwell in Hropt's battle-hall.
> -- [*Völuspá*, Poetic Edda](https://sacred-texts.com/neu/poe/poe03.htm)

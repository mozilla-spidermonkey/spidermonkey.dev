---
layout: post
title: "Saying goodbye to asm.js"
author: Ryan Hunt
date: 2026-05-20 12:00:00 -0500
description: Disabling asm.js optimizations in SpiderMonkey
---

> Axe-time, sword-time, shields are sundered,  
> Wind-time, wolf-time, ere the world falls.  
> -- [*Völuspá*, Poetic Edda](https://sacred-texts.com/neu/poe/poe03.htm)

As of [Firefox 148](https://www.firefox.com/en-US/firefox/148.0/releasenotes/), SpiderMonkey's [asm.js](http://asmjs.org/) optimizations are disabled by default, and we plan to remove the code entirely in a future release.

If you maintain a site that uses asm.js, nothing will break. asm.js is just a subset of plain JavaScript, so the code keeps running through our regular JIT just like any other script. That said, recompiling to WebAssembly will get you faster execution and smaller binaries.

## History

[asm.js](http://asmjs.org/) was Mozilla's response to the question posed by [NaCl and PNaCl](https://en.wikipedia.org/wiki/Google_Native_Client): how can the web run code at native speeds?

The idea was clever: pick a strict, statically-typed subset of JavaScript that an engine could recognize on the fly and compile down to native code. We could get performance similar to NaCl/PNaCl and still have code live inside web content and use web API's (no separate sandbox, IPC, or [alternative API's](https://en.wikipedia.org/wiki/NPAPI#PPAPI)).

asm.js shipped in [Firefox 22](https://blog.mozilla.org/mbest/2013/06/25/asm-js-its-really-fast-backwards-compatible-and-now-in-the-release-version-of-firefox/) back in 2013 and was a success. It let projects like Unity and Unreal ship C/C++ codebases to the web for the first time, using just standard web technologies. The [Epic Citadel demo](https://blog.mozilla.org/futurereleases/2013/05/02/epic-citadel-demo-shows-the-power-of-the-web-as-a-platform-for-gaming/) was ported to the web in just four days. It was a landmark achievement, and a fond memory for the original asm.js team.

<iframe width="560" height="315" style="display: block; margin: 0 auto;" src="https://www.youtube.com/embed/BV32Cs_CMqo" title="Unreal Engine 3 in Firefox with asm.js" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

asm.js proved that we could run code at near-native speed on the web using just web technologies (no plugins or separate sandbox). This opened the door to [WebAssembly](https://webassembly.org/), which shipped several years later in [Firefox 52](https://www.firefox.com/en-US/firefox/52.0/releasenotes/). Without asm.js, [we likely wouldn't have WebAssembly](https://robert.ocallahan.org/2017/06/webassembly-mozilla-won.html).

## Why now?

So why turn it off? WebAssembly has succeeded, and asm.js usage has mostly migrated over. Keeping the asm.js path alongside WebAssembly costs us maintenance time and gives us extra attack surface in the VM.

If you are shipping asm.js content, please consider recompiling to WebAssembly! Our WebAssembly pipeline is significantly more advanced than the asm.js one ever was. You should see faster execution and smaller binaries.

## Ragnarök

<div style="display: flex; gap: 16px; justify-content: center;">
  <img src="/assets/img/odin.jpg" alt="OdinMonkey, by John Howard" style="max-width: 48%;">
  <img src="/assets/img/baldr.jpg" alt="BaldrMonkey" style="max-width: 48%;">
</div>

The asm.js compiler is called OdinMonkey. As was foretold long ago, OdinMonkey must meet his fated doom. The bug [Ragnarök](https://bugzilla.mozilla.org/show_bug.cgi?id=ragnarok) tracks the "Twilight of OdinMonkey".

All is not lost however, for born of OdinMonkey is BaldrMonkey, our WebAssembly optimizing compiler. OdinMonkey may be swallowed whole by the wolf, Fenrir, but BaldrMonkey will rule over the reborn world alongside RabaldrMonkey (["commotion"](https://en.wiktionary.org/wiki/rabalder)), our WebAssembly baseline compiler.

On this Odin's day (Wednesday) we thank OdinMonkey for thirteen years of service. Skål!

> Then fields unsowed bear ripened fruit,  
> all ills grow better, and Baldr comes back;  
> Baldr and Hoth dwell in Hropt's battle-hall.
> -- [*Völuspá*, Poetic Edda](https://sacred-texts.com/neu/poe/poe03.htm)

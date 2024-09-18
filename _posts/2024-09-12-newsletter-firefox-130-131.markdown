---
layout: post
title: "SpiderMonkey Newsletter (Firefox 130-131)"
date: 2024-09-12 15:33:08 -0500
---

Hello everyone\!

I’m Bryan Thrall, just passing two and a half years on the SpiderMonkey team, and taking a try at newsletter writing.

This is our opportunity to highlight what's happened in the world of SpiderMonkey over Firefox releases 130 and 131\.

I’d love to hear any feedback on the newsletter you have, positive or negative (you won’t hurt my feelings). Send it to [my email](mailto:bthrall@mozilla.com)\!

### 🚀 Performance

Though Speedometer 3 has shipped, we cannot allow that to let us get lax with our performance. It's important that SpiderMonkey be fast so Firefox can be fast\!

- Contributor Andre Bargull (@anba) added JIT support for Float16Array ([bug 1835034](https://bugzilla.mozilla.org/show_bug.cgi?id=1835034))

### ⚡ Wasm

- Ryan (@rhunt) implemented speculative inlining ([bug 1910194](https://bugzilla.mozilla.org/show_bug.cgi?id=1910194))\*. This allows us to inline calls based on profiling data in wasm  
- Julian (@jseward) added support for direct call inlining in Ion ([bug 1868521](https://bugzilla.mozilla.org/show_bug.cgi?id=1868521))\*  
- Ryan (@rhunt) landed initial support for lazy tiering ([bug 1905716](https://bugzilla.mozilla.org/show_bug.cgi?id=1905716))\*  
- Ryan (@rhunt) shipped exnref support ([bug 1908375](https://bugzilla.mozilla.org/show_bug.cgi?id=1908375))  
- Yury (@yury) added JS Promise Integration support for x86-32 and ARM ([bug 1896218](https://bugzilla.mozilla.org/show_bug.cgi?id=1896218), [bug 1897153](https://bugzilla.mozilla.org/show_bug.cgi?id=1897153))\*

\* Disabled by default while they are tested and refined.

### 🕸️ Web Features Work

- Andre Bargull (@anba), has dramatically improved our JIT support for BigInt operations ([bug 1913947](https://bugzilla.mozilla.org/show_bug.cgi?id=1913947), [bug 1913949](https://bugzilla.mozilla.org/show_bug.cgi?id=1913949), [bug 1913950](https://bugzilla.mozilla.org/show_bug.cgi?id=1913950))  
- Andre Bargull (@anba) also implemented the RegExp.escape proposal ([bug 1911097](https://bugzilla.mozilla.org/show_bug.cgi?id=1911097))  
- Contributor Kiril K (@kirill.kuts.dev) implemented the Regular Expression Pattern Modifiers proposal ([bug 1899813](https://bugzilla.mozilla.org/show_bug.cgi?id=1899813))  
- Dan (@dminor) shipped synchronous Iterator Helpers ([bug 1896390](https://bugzilla.mozilla.org/show_bug.cgi?id=1896390))

### 👷🏽‍♀️ SpiderMonkey Platform Improvements

- Matt (@mgaudet) introduced JS\_LOG, which connects to MOZ\_LOG when building SpiderMonkey with Gecko ([bug 1904429](https://bugzilla.mozilla.org/show_bug.cgi?id=1904429)). This will eventually allow collecting SpiderMonkey logs from the profiler and about:logging.

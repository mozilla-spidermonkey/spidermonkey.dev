---
layout: post
title: Benchmark Mode in SpiderMonkey
author: Matthew Gaudet
date: 2026-04-13 12:00:00 -0500
description: Measuring performance without shooting youself in the foot (as badly)
---
You ever get to the end of running benchmarks, maybe a long running one, and realize... “Oh _no_. I forgot to set that important option, and these results are useless”

Yeah. I have. Too many times. 

So I’ve [added `--benchmark-mode` and `--strict-benchmark-mode` to SpiderMonkey](https://bugzilla.mozilla.org/show_bug.cgi?id=2030456). 

These options configure the shell for benchmarking, taking the wisdom of the team and boiling multiple shell options down to a single `--benchmark-mode` flag, and in `--strict-benchmark-mode` will abort the run if the shell is configured in a way where effective benchmarking is unlikely to be possible (e.g. benchmarking a debug build!)

The nice thing about nailing this down is that this is something we can point _anyone to_ and know that their shell is following the rules any of us would follow.

The general design philosophy of benchmark mode is to disable things you wouldn’t see enabled in Firefox in normal configuration, as well as debugging code that maybe makes sense for test suites but doesn’t make sense for a benchmark.

Hopefully this is the end of me realizing that I forgot to pass [`--no-async-stacks`](https://searchfox.org/firefox-main/rev/37ae122d8d03366820f487aeac25e74a4be97fab/js/src/shell/js.cpp#13262) yet again.
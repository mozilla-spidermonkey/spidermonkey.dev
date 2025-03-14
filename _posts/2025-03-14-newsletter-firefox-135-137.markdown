---
layout: post
title: "SpiderMonkey Newsletter (Firefox 135-137)"
date: 2025-03-17 15:00:00 -0500
author: Matthew Gaudet
---

Hello everyone, 

Matthew here from the SpiderMonkey team. As the weather whipsaws from cold to hot to
cold, I have elected to spend some time whipping together a too brief newsletter,
which will almost certainly not capture the best of what we’ve done these last few
months. Nevertheless, onwards!

### 🧑‍🎓Outreachy

We hosted an [Outreachy](https://www.outreachy.org/) intern, [Serah
Nderi](https://github.com/MundiaNderi), for the most recent Outreachy cycle, with Dan
as her mentor. Serah worked on implementing the Iterator.range proposal as well as a
few other things. We were happy to host her, and grateful to her for joining. Read
about [her internship project
here](https://spidermonkey.dev/blog/2025/03/05/iterator-range.html).

### 🥯HYTRADBOI: Have You Tried Rubbing a Database On It 

[HYTRADBOI](https://www.hytradboi.com/2025) is an interesting independent online only
conference, which this year had a strong programming languages track.
[Iain](https://mstdn.ca/@iainireland) from the SpiderMonkey team was able to produce
a stellar video talk called [A quick ramp-up on ramping up
quickly](https://www.hytradboi.com/2025/0a4d08fd-149e-4174-a752-20e9c4d965c5-a-quick-ramp-up-on-ramping-up-quickly),
where he helps the audience reinvent our baseline interpreter in 10 minutes. The talk
is fun and short, so go forth and watch it!

### 👷🏽‍♀️ New features & In Progress Standards Work 

We have done a whole bunch of shipping work this cycle. By far the most important
thing is that [Temporal](https://tc39.es/proposal-temporal/) has now [been shipped on
Nightly](https://bugzilla.mozilla.org/show_bug.cgi?id=1946823). We must extend our
enormous gratitude to André Bargull, who has been implementing this proposal for
years, providing reams of feedback to champions, and making it possible for us to
ship so early. We’ve also been working on improving error messages reported to
developers, and have a list of “[good first
bugs](https://bugzilla.mozilla.org/show_bug.cgi?id=1839676)” available for people
interested in getting started contributing to SpiderMonkey or Firefox.

In addition to Temporal, Dan has worked on shipping a number of our complete proposal
implementations:

* [Math.sumPrecise](https://bugzilla.mozilla.org/show_bug.cgi?id=1943120)
* [Intl.DurationFormat](https://bugzilla.mozilla.org/show_bug.cgi?id=1933303)

and [Atomics.pause](https://bugzilla.mozilla.org/show_bug.cgi?id=1937805). 

### 🚀 Performance

* New contributor abdoatef.ab [got a nice speedup (2.3x on a micro-benchmark!) by
  hinting our object allocator on the final size an object
  literal](https://bugzilla.mozilla.org/show_bug.cgi?id=1941446).
* Jon added a [slots-and-elements
  allocator](https://bugzilla.mozilla.org/show_bug.cgi?id=1934856) which should
  reduce contention on the system allocator which is used for many other things.   
* Jan added code to [recycle
  LifoAllocs](https://bugzilla.mozilla.org/show_bug.cgi?id=1913757) for
  IonCompilations, which reduces the amount of contention on the memory allocator
  where possible.   
* Jan continued work on register allocation tuning, continuing on from where [we left
  it last with Jan’s blog
  post](https://spidermonkey.dev/blog/2024/10/16/75x-faster-optimizing-the-ion-compiler-backend.html%20).   
* Jan’s been [doing some work with
  fuses](https://bugzilla.mozilla.org/show_bug.cgi?id=1947767) to take advantage of
  knowing the state of the VM more. 


### 🚉 SpiderMonkey Platform Improvements

* Iain landed the infrastructure for [off-thread baseline
  compilation](https://bugzilla.mozilla.org/show_bug.cgi?id=1935289) and [batched
  baseline compilation](https://bugzilla.mozilla.org/show_bug.cgi?id=1935289). The
  hope is that this will eventually lead to some performance improvements but it’s
  disabled while it is tuned for now.   
* We now [share the parsed version of our self-hosted code from parent process to
  child process on Android](https://bugzilla.mozilla.org/show_bug.cgi?id=1618391),
  leading to a small improvement in child process startup time on Android.   
* Ryan added [JitDump support for Wasm
  compilation](https://bugzilla.mozilla.org/show_bug.cgi?id=1943696), which means
  that now it shows up beautifully in [Samply](https://github.com/mstange/samply).

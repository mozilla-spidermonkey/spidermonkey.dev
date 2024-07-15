---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 128-129)"
date:   2024-07-16 11:00:00 +0100
---

Hello Everyone,

It's Matt here from the SpiderMonkey team, with another newsletter for you. I hope you're enjoying summer/winter. The last heatwave where I am broke on Thursday evening, with [a dramatic drop in temperatures driven by the arrival of a thunderstorm](https://mozilla.social/@mgaudet/112773671354596833). Unfortunately for me, it seems to be back for round two this week. 

In SpiderMonkey land we've been hard at work on a number of things, but you'll see from this abbreviated blog that we do tend to slow down a bit in the middle of the year as vacations build up.

In June of this year Mozilla, in collaboration with [Aalto University](https://www.aalto.fi/en) hosted the 102nd meeting of [TC39](https://tc39.es/) in Helsinki, Finland. I was actually able to attend this meeting in person, which was really interesting to me. On the one hand, seeing how JavaScript is standardized from such an intimate viewpoint was extremely eye-opening. On the other hand, [Helsinki was also just wonderful](https://www.mgaudet.ca/blog/2024/6/26/helsinki).

### 🚉 SpiderMonkey Platform Improvements

- Work is underway to smooth the sharing of string contents across Gecko and SpiderMonkey, tracked under [Bug 1892253 - Use a shared string buffer type for JS and DOM strings](https://bugzilla.mozilla.org/show_bug.cgi?id=1892253). The intention of this work is to reduce the overhead and copying required when strings cross from SpiderMonkey into Gecko and back.

### 🔦 Contributor Spotlight

This Newsletter's Contributor Spotlight focuses on Debadree Chatterjee! In his own words, 

> A fully stack js dev mostly working with react and nodejs with a newfound interest in learning about JS runtimes and JIT compilers, Initially exposed to workings of jit compilers when studying nodejs internals and from there still going down the rabbit hole of exploring js engines :-)

He is on an ongoing quest to implement [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management), and [has made great progress](https://bugzilla.mozilla.org/show_bug.cgi?id=1569081).  Thank you so much for all your work Debadree, and I hope to keep hearing from you as a contributor over time! 

### 🧑🏾‍🏫 Mentored Bugs 

Are you curious about what it would be like to contribute to SpiderMonkey, but not sure what kind of work is hanging around? This section, new for this newsletter, highlights a few of our [bugs which have mentors assigned](https://bugzilla.mozilla.org/buglist.cgi?emailtype1=regexp&email1=.%2B&query_format=advanced&emailbug_mentor1=1&resolution=---&product=Core&component=JavaScript%20Engine&component=JavaScript%20Engine%3A%20JIT&component=JavaScript%3A%20GC&component=JavaScript%3A%20Internationalization%20API&component=JavaScript%3A%20Standard%20Library&classification=Client%20Software&classification=Developer%20Infrastructure&classification=Components&classification=Server%20Software&classification=Other&list_id=17120074) that we think would be interesting for newish contributors to tackle. Not all our Mentored bugs are in equally good shape to have new contributors jump on, but the following are pretty safe bets

- [Bug 1899303 - Implement Redeclarable global eval-introduced vars proposal](https://bugzilla.mozilla.org/show_bug.cgi?id=1899303)
- [Bug 1899413 - Support v flag in RegExp.prototype[@@matchAll]](https://bugzilla.mozilla.org/show_bug.cgi?id=1899413)

Before jumping on any of these, be sure to stop in at #spidermonkey on Matrix to get the current lay of the land. 

### 🚀 Performance 

- Jon landed [Bug 1900778 - JitHits can prevent pretenuring allocations](https://bugzilla.mozilla.org/show_bug.cgi?id=1900778), which ensures that our `JitHints` machinery doesn't interfere with our allocation site tracking machinery; this lead to a 9% improvement on one of our tests. 
- Iain landed [Bug 1895957 - Use emitCalleeGuard in GetPropIRGenerator::tryAttachScriptedProxy](https://bugzilla.mozilla.org/show_bug.cgi?id=1895957) , which handles proxies where the handler uses function literals by checking the Script (our representation of code, which is shared here) rather than Functions, which will not be shared. This was a 5% improvement on the Speedometer 3 ChartJS test. 
- Alex [added support for getters in megamorphic GetElem / GetProp ICs](https://bugzilla.mozilla.org/show_bug.cgi?id=1878158).
- Not _Firefox_ performance, but [Jan fixed an issue where the runtime of one of our test suites wasn't scaling with increased CPU cores](https://bugzilla.mozilla.org/show_bug.cgi?id=1900847).
- Jon [made it possible for us to nursery allocate built-in proxy types in the nursery](https://bugzilla.mozilla.org/show_bug.cgi?id=1900466), leading to performance improvements of up to 30% on some SP3 subtests. 

### 🕸️ Features
- Dan added support for [Duplicate Named Capture groups](https://bugzilla.mozilla.org/show_bug.cgi?id=1826573)
- Dan worked on shipping [Resizable and Growable ArrayBuffers](https://bugzilla.mozilla.org/show_bug.cgi?id=1884150), originally implemented by André Bargull.

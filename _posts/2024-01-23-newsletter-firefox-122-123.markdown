---
layout: post
title:  "SpiderMonkey Newsletter (Firefox 122-123)"
date:   2024-01-30 18:00:00 +0100
---
Hello everyone!

[Matthew Gaudet](https://www.mgaudet.ca/about) here from the SpiderMonkey team, giving Jan a break from newsletter writing. 

Our newsletter is an opportunity to highlight some of the work that's happened in SpiderMonkey land over the last couple of releases. Everyone is hard at work (though some of us are nicely rejuvenated from a winter break). 

Feel free to email feedback on the shape of the newsletter to [me](mailto:mgaudet@mozilla.com), as I'd be interested in hearing what works for people and what doesn't.

### 🚀 Performance

We're continuing work on our performance story, with Speedometer 3 being the current main target. We like Speedometer 3 because it provides a set of workloads that we think better reflect the real web, driving [improvements to real users too](https://bugzilla.mozilla.org/show_bug.cgi?id=1867359).

Here is a curated selection of just some of the performance related changes in this release:

- Iain Ireland improved performance on React through [eager atomization of property keys](https://bugzilla.mozilla.org/show_bug.cgi?id=1867359) ([13% improvement](https://bugzilla.mozilla.org/show_bug.cgi?id=1867359#c16) on a [devtools benchmark subtest](https://firefox-source-docs.mozilla.org/devtools/tests/performance-tests-overview.html#damp),[ 7% on Jetstream2-Offfline Assembler](https://bugzilla.mozilla.org/show_bug.cgi?id=1867359#c17)).
- Contributor André Bargull [improved the performance of various String methods](https://bugzilla.mozilla.org/show_bug.cgi?id=1873042) ([Between 2 and 5% on various Jetstream2 Subtests](https://bugzilla.mozilla.org/show_bug.cgi?id=1873042#c14))
- Jon fixed an [accidentally quadratic](https://accidentallyquadratic.tumblr.com/) traversal in [Bug 1867453 - Nightly spends tons of time (2 minutes+) around GC on an online OCR tool. The time increases exponentially as the size of the image increases](https://bugzilla.mozilla.org/show_bug.cgi?id=1867453)
- I added a new optimization system called [Fuses](https://searchfox.org/mozilla-central/rev/c130c69b7b863d5e28ab9524b65c27c7a9507c48/js/src/vm/GuardFuse.h#21-61), which will allow us to make optimizations that depend on assumptions about the state of the virtual machine. The first optimization to make use of this [landed in 123](https://bugzilla.mozilla.org/show_bug.cgi?id=1870396). While it wasn't a noticeable improvement for Speedometer, it does provide about a 40% improvement on a [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) microbenchmark. The hope is that this framework will be a foundation to build further improvement upon.  

#### 🔦 Contributor Spotlight: Mayank Bansal

Mayank Bansal has been a huge help to the Firefox project for years. Taking a special interest in performance, he is often one of the first to take note of a performance improvement or regression. He also frequently files performance bugs, some of which have identified fixable problems, along with comparative profiles which smooth the investigative process. 

In his own words: 

> [Mayank Bansal](https://www.linkedin.com/in/mayankbansal01) has been using Firefox Nightly for more than a decade. He is passionate about browser performance and scours the internet for interesting javascript test-cases for the SM team to analyse. He closely monitors the performance improvement and regressions on [AWFY](https://arewefastyet.com). You can check out some of the bugs he has filed by visiting the metabug [here](http://bugzilla.mozilla.org/show_bug.cgi?id=1808325).

The SpiderMonkey team greatly appreciates all the help we get from Mayank. Thank you very much Mayank. 

### ⚡ Wasm

- Ben Visness enabled [JIT Allocation of Structs](https://bugzilla.mozilla.org/show_bug.cgi?id=1861261), which helps improve Wasm GC performance by 5-15% depending on workload.
- Ryan Hunt implemented the [js-string-builtin](https://github.com/WebAssembly/js-string-builtins) proposal championed by Mozilla for fast access to strings from wasm in [Bug 1863794](https://bugzilla.mozilla.org/show_bug.cgi?id=1863794). 
- Ryan also implemented the [exnref proposal](https://github.com/WebAssembly/exception-handling/issues/280) in [Bug 1853454](https://bugzilla.mozilla.org/show_bug.cgi?id=1853454)

### 👷🏽‍♀️  Other Work

- Contributor André Bargull has [landed (nightly only)](https://bugzilla.mozilla.org/show_bug.cgi?id=1423593) support for [`Intl.Segmenter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) 
- I enabled [`ArrayBuffer.prototype.transfer`](https://bugzilla.mozilla.org/show_bug.cgi?id=1865103) by default (but André Bargull did all the real work in implementing this). This API provides ownership semantics to JS ArrayBuffers. 
- Contributor Jonatan Klemets has landed updates to our preliminary (disabled by default) support for [Import Assertions](https://bugzilla.mozilla.org/show_bug.cgi?id=1835669). 
- I fixed a [low volume crash related to synchronous events occurring while devtools is open on a page](https://bugzilla.mozilla.org/show_bug.cgi?id=1866385); this should eventually avoid about 10 crashes a week for people debugging in Firefox. As of 121.0.1 this should no longer occur.  This was a fun investigation triggered by a seemingly impossible crash, and also an interesting case of a crash-report bug opened by a bot leading to an actionable fix. 

### ⏰ Date parsing improvements

Contributor Vinny Diehl has continued improving our date parsing story, aiming to improve compatibility and handling of peculiar cases.

- [Bug 1862910 - Make Date.parse only check first 3 characters of month name](https://bugzilla.mozilla.org/show_bug.cgi?id=1862910)
- [Bug 1866811 - the javascript-engine returns 943916400000 on Date.parse("0000-00-00") instead of NaN](https://bugzilla.mozilla.org/show_bug.cgi?id=1866811)
- [Bug 1870434 - Date.parse rejects single numbers < 1000](https://bugzilla.mozilla.org/show_bug.cgi?id=1870434)
- [Bug 1872333 - Day of month overflow should be parsed as an ISO style date](https://bugzilla.mozilla.org/show_bug.cgi?id=1872333)
- [Bug 1870570 - Date.parse accepts incomplete time zone abbreviations and AM/PM](https://bugzilla.mozilla.org/show_bug.cgi?id=1870570)
- [Bug 1873186 - Deprecate day of week late in the format for Date.parse](https://bugzilla.mozilla.org/show_bug.cgi?id=1873186)

### 🐇 Fuzzing

In order to find bugs, [fuzzing](https://en.wikipedia.org/wiki/Fuzzing) by generating and running random testcases to see if they crash turns out to be an unreasonably effective technique. The SpiderMonkey team works with a variety of fuzzers, both inside of Mozilla (👋 Hi `fuzzing@`!) and outside (Thank you all!). 

Fuzzing can find test cases which are both very benign but worth fixing, as well as extremely serious security bugs. Security sensitive fuzz bugs are eligible for the [Mozilla Bug Bounty Program](https://www.mozilla.org/en-US/security/bug-bounty/). 

To show off the kind of fun we have with fuzzing, I thought I'd curate some fun, interesting (and not hidden for security reasons) fuzz bugs. 

- [A fun catch on weird ARM32 Hardware](https://bugzilla.mozilla.org/show_bug.cgi?id=1870756)
- [Finding overly strict assertions](https://bugzilla.mozilla.org/show_bug.cgi?id=1858678)in testing code. 
- [Discovering our `callWithABI` signatures couldn't handle `int64_t` returns on 32-bit, which went subtly awry in the arm32 simulator build.](https://bugzilla.mozilla.org/show_bug.cgi?id=1870747)

---
layout: post
title:  "Shipping Temporal"
date:   2025-04-18 12:00:00 -0600
author: Daniel Minor
---

The [Temporal proposal](https://github.com/tc39/proposal-temporal) provides a
replacement for `Date`, a long standing pain-point in the JavaScript language.
This [blog post](https://maggiepint.com/2017/04/09/fixing-javascript-date-getting-started/)
describes some of the history and motivation behind the proposal. The
Temporal API itself is well docmented on
[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal).

Temporal reached Stage 3 of the [TC39 process](https://tc39.es/process-document/) in March 2021.
Reaching Stage 3 means that the specification is considered complete, and that the proposal is
ready for implementation.

SpiderMonkey began our implementation that same month, with the initial work
tracked in [Bug 1519167](https://bugzilla.mozilla.org/show_bug.cgi?id=1519167).
Incredibly, our implementation was not developed by Mozilla employees, but was contributed
entirely by a single volunteer, André Bargull. That initial bug consisted of 99 patches, but
the work did not stop there, as the specification continued to evolve as problems were found
during implementation. Beyond contributing to SpiderMonkey, André filed close to
[200 issues](https://github.com/tc39/proposal-temporal/issues?q=is%3Aissue%20state%3Aclosed%20author%3Aanba)
against the specification. [Bug 1840374](https://bugzilla.mozilla.org/show_bug.cgi?id=1840374)
is just one example of the massive amount of work required to keep up to date with the
specification.

As of Firefox 139, we've enabled our Temporal implementation by default, making
us the first browser to ship it. Sometimes it can seem like the ideas
of open source, community, and volunteer contributors are a thing of the past,
but the example of Temporal shows that volunteers can still have a meaningful impact
both on Firefox and on the JavaScript language as a whole.

## Interested in contributing?

Not every proposal is as large as Temporal, and we welcome contributions of
all shapes and sizes. If you're interested in contributing to SpiderMonkey,
please have a look at our
[mentored bugs](https://bugzilla.mozilla.org/buglist.cgi?query_format=advanced&emailbug_mentor2=1&emailtype2=regexp&resolution=---&email2=.*&component=JavaScript%20Engine&component=JavaScript%20Engine%3A%20JIT&component=JavaScript%3A%20GC&component=JavaScript%3A%20Internationalization%20API&component=JavaScript%3A%20Standard%20Library&list_id=17451567&classification=Client%20Software&classification=Developer%20Infrastructure&classification=Components&classification=Server%20Software&classification=Other&product=Core).
You don't have to be an expert :). If your interests are more on the specification side,
you can also check out how to
[contribute to TC39](https://github.com/tc39/ecma262/blob/HEAD/CONTRIBUTING.md).


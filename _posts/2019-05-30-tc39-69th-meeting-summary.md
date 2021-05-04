---
layout: post
title:  "69th meeting of Ecma TC39"
date:   2019-05-30 8:30:07 +0100
---
- Quite a bit of work on string methods and promise methods.
- temporal is now blocked on standard modules, adding pressure to do that
- dynamic import will move to stage 4 if all goes well with realms?
- Decorators minimal proposal with built in decorators was presented
- Decorators were also presented as a solution for numeric separators / literals

Stuff we are interested in or working on:
- WeakRefs was discussed, and agreed to not be optional? It will also not be a systems object
- Date.parse has not moved forward due to trying to standardize implementation specific behavior.
- error stacks have not moved forward either, needs more research

## Normative

The following are normative changes, the behaviour in SM and the conclusions from the plenary.

CreateDynamicFunction early concatenates body
- [Notes 1](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-26.md#normative-createdynamicfunction-early-concatenates-body)
    - Proposes to not throw an exception in all browsers for `function("-->").toString();`
- [Notes 2](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-28.md#update-pr-normative-createdynamicfunction-early-concatenates-bodytext)
    - In SM behaviour, this is an html comment
    - No consensus, special case doesn't warrent change on its own

[Remove implementation-defined typeof behavior](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-26.md#normative-remove-implementation-defined-typeof-behavior)
- Definitions removed from typeof table
    - object (Standard exotic and does not implement [[call]])
    - Object (non-standard exotic and does not implement [[call]])
- Consensus reached

[Make Async-from-Sync iterator object inaccessible to ECMAScript code](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-26.md#normative-make-async-from-sync-iterator-object-inaccessible-to-ecmascript-code)
- Consensus
- SM Supports already?

[Suppress GetMethod errors in IteratorClose](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-26.md#normative-suppress-getmethod-errors-in-iteratorclose)
- Consensus
- SM behaviour - throws error
 [Add export * as ns from "mod" to Export production and Module Semantic](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-26.md#normative-add-export--as-ns-from-mod-to-export-production-and-module-semantic)
-  [SM status](https://bugzilla.mozilla.org/show_bug.cgi?id=1496852)
- Consensus

[Require at least four digits in string representations of negative years](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-26.md#normative-require-at-least-four-digits-in-string-representations-of-negative-years)
- SM status — currently ship
- Consensus


## Proposals

The following list is of proposals presented at TC39. Proposals are grouped by theme and are presented in stage order from 4 to 1

### Proposals which advanced

#### Intl

[dateStyle/timeStyle for Stage 3](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-26.md#datestyletimestyle-for-stage-3)
- Motivation: compact way to request the appropriate, locale-specific way to ask for a date and time of given lengths

[Intl.DateTimeFormat.prototype.formatRange for Stage 3](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-26.md#intldatetimeformatprototypeformatrange-for-stage-3)
- Motivation allow specifying date ranges without the use of a library

#### String Methods

[String.prototype.matchAll for Stage 4](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-26.md#stringprototypematchall-for-stage-4)
- Motivation: need to iterate through all matches for a string
- Introduces matchAll method for doing this

[String.prototype.replaceAll for Stage 2](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-26.md#stringprototypereplaceall-for-stage-2)
- Motivation: similar to matchAll, users want to be able to replace all strings

#### Others

BigInt function parameter overloading and Intl.NumberFormat.prototype.format
- [Notes 1](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-27.md#bigint-function-parameter-overloading-and-intlnumberformatprototypeformat)
- [Notes 2](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-27.md#bigint-follow-up-conversation)
- Consensus to move forward on Intl.NumberFormat.prototype.format overloading with ToNumeric.

[Promise.allSettled for Stage 3](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-26.md#intldatetimeformatprototypeformatrange-for-stage-3)
- Motivation: Developers are sometimes interested in waiting for all promises to complete, regardless of whether they succeed or not.
- Introduce a new method to the promise prototype to allow waiting for all promises to settle

[Decorator-based extended numeric literals status update, and numeric separators for Stage 3](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-28.md#decorator-based-extended-numeric-literals-status-update-and-numeric-separators-for-stage-3)
- Generalizes bigInt
- Introduces a way to write about css numbers, ie px

### New proposals

Private declarations for Stage 1
- Motivation: allowing trusted code outside of the class lexical scope to access private state.
- [Notes 1](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-26.md#private-declarations-for-stage-1)
    - No conclusion
- [Notes 2](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-28.md#private-declarations-for-stage-1)
    - Stage 1 acceptance

[Promise.any](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-27.md#promiseany)
- Unlike race, returns when the first promise is fulfilled, or if all fail — returns with an array of reasons why
- Accepted for stage 1

### Proposals that did not reach consensus

Promise.result (no longer for Stage 1)
(Proposal)[https://github.com/pemrouz/proposal-promise-result]

Uniform parsing of quasi-standard Date.parse input for Stage 2
- [Notes 1](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-26.md#uniform-parsing-of-quasi-standard-dateparse-input-for-stage-2)
    - Time box ran out
- [Notes 2](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-27.md#dateparse-follow-up)
    - Conclusion: The committee did not have consensus to accept a change to the Date.parse algorithm that still allows implementation-specific behavior.

[Error stacks for Stage 2](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-28.md#error-stacks-for-stage-2)
- Conclusion:
-
1) do the legwork to figure out what browsers do in terms of the contents of the stack.
2) explicitly enumerate the similarities and the differences.
3) to attempt to write a spec algorithm that can allow them all and mandate one of them.
4) potentially Create a brand new structure including a preferred output.
5) ask browsers and engines that would need to make changes, what changes they may need to make.

### Proposal updates

[Function implementation hiding (Stage 2 update)](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-27.md#function-implementation-hiding-stage-2-update)
- Problem: hide information that is made available by Function.toString
- JavaScript's Function.prototype.toString method reveals the source text originally used to create the function. Revealing the source text of a function gives callers unnecessary insight into its implementation details. They can introspect on a function's implementation and react to it, causing what would otherwise likely be non-breaking changes to become breaking ones. They can extract secret values from the source text to compromise an application's attempts at encapsulation.
- Solution: The solution is to provide a way to modify the output of the above functions, to prevent them from exposing implementation details. This is done via a new directive, tentatively "hide implementation". Like "use strict", it could be placed at either the source file level or the per-function level. 
- Proposal scope was expanded
- Does not have an impact on application-level memory saving

[Yet Another Decorators Stage 2 update](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-27.md#yet-another-decorators-stage-2-update)
- Problem: a number of libraries / framework etc authors are looking for a native implementation of decorators
- Summary: instead of custom decorators, we have predefined built in decorators. They are compassable to make js decorators. These are @wrap, @register, @expose and @initialize

[Temporal stage 2 update](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-27.md#temporal-stage-2-update)
- Summary:
    - Now uses BigInt always, ToNumeric will be used for input types.
    - Zoned: Zoned toInstance (or ZonedInstance?) was renamed to ZonedDateTime
- Standard modules are now a blocking issue for temporal

[Dynamic import() for Stage 4 (in June?)](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-28.md#dynamic-import-for-stage-4-in-june)
- Mechanism for importing a module later
- Next steps
    - Research if import() is future-proof for Realms goals
    - import() would not block for Realms advancing to Stage 3
    - Spend next two months investigating implications
    - Propose import() for Stage 4 in June

[Top-level await with a vengeance](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-28.md#top-level-await-with-a-vengeance)
- Top level await
1) JHD wanted to know if there's a flag to disallow top-level await within subgraphs (or describe why we will not allow that).
2) WH had questions about partial bundles where you don't know your children.
3) WH also had questions about the grammar and forbidding certain pieces of grammar that are ambiguous.

[WeakRef update (currently a Stage 2 proposal)](https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-28.md#weakref-update-currently-a-stage-2-proposal)
- Sum up: finalisation api, and weak refs
- Covert channel - difficulty in that not all implementers can reliably identify cross realm channels
- All implementers are on board, no reason to be optional

[Intl.Segmenter Stage 3 to Stage 2]( https://github.com/tc39/tc39-notes/blob/master/es10/2019-03/mar-28.md#intlsegmenter-stage-3-to-stage-2)
- proposal is incorrect, demoted from stage 3 to stage 2

Secretarial:

- Tc39 transition to RFTC
- Moving from [esdiscuss](https://esdiscuss.org/) to the [discourse](https://es.discourse.group/)

Not summarised:
- TC402 update
- TC53 update
- Secretariat Update

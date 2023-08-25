---
layout: default
---

<link rel="stylesheet" href="./tech_tree_style.css"/>

# SpiderMonkey Tech Tree

## What is this?

The below is a tool for thought created by the SpiderMonkey Team to plan out a
series of possible futures. **These are not plans**, so much as they are
potential routes the project _could_ take.

## The Tech Tree

<div id="tree" class="tree">Generating SVG</div>
[(Take a peek at the diagram source)](./diagram.mmd)

# Details {#details}

## Shape Indexes {#shapeIndexes}

What if Shapes weren't represented in the object header as a pointer, but
instead represented in the object header as table index. This by itself wouldn't
gain us much, but would unlock...

## Tagged Shape Indexes {#taggedShapeIndexes}

Since shapes are immutable, we could tag certain information into their Indexes;
potentially quite a bit if we were to decide to use a limited size of shape
index.

For example, Frozen could be inlined into the tag, removing a dereference

## Progressive Stencil {#progressiveStencil}

Once we can share scopes alongside Stencils, the cost of instantiating a Stencil should be significantly reduced, and we can more easily only allocate BaseScripts as needed, instead of all of them at the start. This could lead to a performance benefit when we want a script quickly because we can load and parse more of it lazily.

See [this bug](https://bugzilla.mozilla.org/show_bug.cgi?id=progressive-stencil).

## Universal Relazification {#universalRelazification}

This would be the ability to relazify _any_ script. Currently we can only
relazify leaf scripts.

This has been previously discussed
[on bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1162497).

## Regenerate Bytecode For Correctness {#tossBytecode}

The ability to relazifiy anything would allow us to start optimizing _bytecode_,
(with the large caveat that we'd need to handle caseswhere optimized functions
are on the stack and who knows what that looks like.)

## Immutable Object Detection at Parse Time {#immutableFlag}

In some circumstances we are able to tell that an object is immutable at parse
time. If the parser could indicate this we might be able to produce faster code.
See
[Bug 183095 for some previous investigation.](https://bugzilla.mozilla.org/show_bug.cgi?id=1830195)

## Reusable Inline Caches {#ric}

A [paper published in 2019](https://dl.acm.org/doi/10.1145/3314221.3314587) used
a data-driven approach to cache and pre-fill inline cache chains on
applications. We could potentially do something similar once we have a
disk-cache to store data to.

## Embed Generated Code in Binary {#inBinaryCode}

If we could generate code using our MacroAssembler we could then subsequently
also use this to replace inline assembly where we currently use it.

See [this bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1751204).

## SpiderMonkey Relocations {#smRelocations}

In order to be able to generate artifacts to include in our own binaries we
either need to generate Position/Context/Runtime independent code, or we need to
support our own form of
[Relocations](<https://en.wikipedia.org/wiki/Relocation_(computing)>).

## Improved Bytecode

There is potentially room to improve the performance of our interpreter if we
were to invest in improving our bytecode. Some techniques to investigate woudl
be breaking apart ops with dynamic behaviour where the dynamism can be
identified ahead of time (for example `GetAliasedVar` becoming `GetAliasedVar0`,
`GetAliasedVar1` etc.)

We also could investigate macro ops, which encapsulate sequences that have
complicated semantics.

[**Efficient Interpretation with Quickening** Stefan Brunthaler DLS 2010](https://dl.acm.org/doi/10.1145/1899661.1869633)
and [followup](https://arxiv.org/pdf/2109.02958.pdf) would be effective
background reading.

### Better Bytecode for Destructuring {#destructuringBytecode}

SpiderMonkey generates a lot of bytecode for destructuring. For example,

```JS
function f(x) { let [a,b,c] = x; return a+b+c;}
```

generates 301 ops today. On the other hand, we know other engines do better. JSC
for example uses only 36 ops for the above function[^jsc-invocation].

[^jsc-invocation]:
    `jsc -d -e "function f(x) { let [a,b,c] = x; return a+b+c;} f([1,2,3])`

### Easier to optimize generator bytecode {#generatorBytecodeTransforms}

Right now [we don't have full JIT support for generators nor async
functions][1681338]. Full support with our current design is challenging.

[Quoting Jan](https://bugzilla.mozilla.org/show_bug.cgi?id=1839078)

> Longer-term we should redo our implementation to support resuming in Ion code.
> Other engines transform generators to look more like a normal function with a
> switch-statement to make JIT support easier.

[1681338]: https://bugzilla.mozilla.org/show_bug.cgi?id=1681338

## On-Disk Baseline Code {#onDiskBaselineCode}

Storing Baseline-compiled code on disk could speed up loading built-in code, like the Dev Tools.

## In-Memory Stencil Caching (stencil-nav) {#stencilNav}

When caching JS bytecode through Necko, we can miss opportunities to reuse data due to how the cache policy for disk caching is set up. If we create a separate container for caching Stencils across navigations, we can potentially reduce bandwidth and load overhead when a subresource is reused. This also allows us to coalesce loading so that multiple requests for the same script will only need to fetch the data once.

## Compressed On-Disk Caching {#compressDiskCache}

By compressing the JIT code that is stored in the Necko on-disk cache, we might be able to reduce the bandwidth needed to save and restore the cache, and reduce size on disk.

To get the necessary performance improvements of this feature, we will want to do the compression in a prioritized background thread.

## Stencil Navigation Scheduling {#stencilNavScheduling}

Once we can parse without a JSContext, we can provide richer information for scheduling tasks via Firefox's Task Controller. We can convert the state machine for loading a script into tasks that are scheduled individually with proper dependencies and priorities, and we can use priority to affect which subresources are loaded first.

## Unified Subresource API {#unifiedSubresourceApi}

The current caches are based around the Necko alternate-datastream API and some use-cases may be better served by an in memory cache similar to used for CSS and images. An in-memory cache could be used to store JIT code, CSS, and Images instead of having a separate cache for each type of data.

We hope to make policies consistent across resources and gather the eviction and insertion policies into a single API.

## Off-thread Necko API {#offThreadNeckoAPI}

A lot of work we do with the Necko API is work that happens on the main thread. We could avoid a lot of thread hopping if we refactored Necko API so it didn't require work on the main-thread.

## Decoupled Script Caching {#decoupledCaching}

Decoupling `ScriptLoader` from script speculative loading and caching would simplify the state machine used there. Cache loads and stores could happen asynchronously from page loading. This benefit comes from breaking apart the script loading into more "primitive" operations like load, parse, and cache.

## Streaming Parsing {#streamingParsing}

Right now the Parser as designed must see the whole source text before it can
parse. It may be beneficial for us to support incremental parsing of a text
stream, as we could then parse incoming chunks off the network.

## Fast Ion Tier {#fastIonTier}

We have some evidence that getting into Ion faster would be better; however Ion
compilations are costly. This suggests there may be room here for a tier of ion
that would slot in between our current Ion tier and baseline.

This version of Ion compilation would optimize for compile time; one could
imagine for example having no method inlining, limited optimization, and minimal
CacheIR transpilation in order to reduce the amount of MIR generated and keep
compilation and register allocation time fast.

This improvement could be deployed in a few ways:

- We could reduce Ion thresholds, allowing methods into ion earlier
- We could consider more costly analyses in the top tier ion, as longer compile
  times might be more tenable if we have a mid-tier.

## Share Ion ICs {#shareIonICs}

Currently Ion ICs are specialized to a particular callsite, and thus we don't
currently share Ion IC code. We could implement a stub sharing policy akin to
Baseline IC stubs.

[(Tracked in Bugzilla here)](https://bugzilla.mozilla.org/show_bug.cgi?id=1817277)

## Prepopulate Ion IC Chains {#prepopulateIonIcs}

When doing off-thread compilation, we could fill in the stub chains for Ion ICs
we generate.

[(Tracked in Bugzilla here)](https://bugzilla.mozilla.org/show_bug.cgi?id=1817277)

## A Mid-Tier JIT {#midTier}

We have some evidence that faster JIT compilation would be valuable; one
potential route forward would be [a faster Ion tier](#fastIonTier). However,
another route would be the creation of mid-tier optimizing compiler that's more
of a divergence from Ion.

## Self-Hosted CacheIR Ops {#selfHostedCacheIROps}

Create CacheIR ops that are backed by self-hosted code, as a way of handling
complicated scenarios in bytecode while allowing fast-path generation in the
common case.

## A Replacement DSL for Self-Hosted code {#selfHostedReplacement}

Iain's wishlist:

> ergonomic to write, generates efficient code, can be inlined, multiple return
> values, a pony
>
> Most interesting syntax idea: `specialize (condition)` statement:
>
> - generate two copies of the rest of the block
>   - one specialized for the fast path
>   - one fallback path
>
> lets us write out the required semantics, then eg optimize for packed arrays

## Simplified Exceptions {#simplifiedExceptions}

There are a bunch of paths in SpiderMonkey that throw only because they could
OOM. It would be interesting to see what fraction of exception handling could be
removed if we chose to OOM on exceptions.

<script type="module">
import draw_diagram from "./diagram.mjs"
draw_diagram("./diagram.mmd","#tree");
</script>

### Last Updated

<div id="lastUpdated">Fetching</div>
<script>
  // Technique stolen from https://cogitorium.info/2021/02/jekyll-github-revision
  fetch("https://api.github.com/repos/{{ site.github.repository_nwo }}/commits?path={{ page.path }}&page=1&per_page=2")
  .then(response => response.json())
  .then(json => {
    if (json.length > 1) {
      const d = new Date(json[0].commit.author.date);
      document.getElementById("lastUpdated").innerText = d.toLocaleDateString() + " (" + d.toLocaleTimeString() + ")"
    }});
</script>

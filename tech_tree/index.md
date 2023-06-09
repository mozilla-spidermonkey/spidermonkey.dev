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

## Universal Relazification {#universalRelazification}

This would be the ability to relazify _any_ script. Currently we can only
relazify leaf scripts.

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

## Improved Bytecode {#improvedBytecode}

There is potentially room to improve the performance of our interpreter if we
were to invest in improving our bytecode. Some techniques to investigate woudl
be breaking apart ops with dynamic behaviour where the dynamism can be
identified ahead of time (for example `GetAliasedVar` becoming `GetAliasedVar0`,
`GetAliasedVar1` etc.)

We also could investigate macro ops, which encapsulate sequences that have
complicated semantics.

### References

- [**Efficient Interpretation with Quickening** Stefan Brunthaler DLS 2010](https://dl.acm.org/doi/10.1145/1899661.1869633)
  and [followup](https://arxiv.org/pdf/2109.02958.pdf).

## Streaming Parsing {#streamingParsing}

Right now the Parser as designed must see the whole source text before it can
parse. It may be beneficial for us to support incremental parsing of a text
stream, as we could then parse incoming chunks off the network.

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

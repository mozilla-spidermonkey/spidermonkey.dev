---
layout: post
title: Who needs Graphviz when you can build it yourself?
author: Ben Visness
date: 2025-10-28 12:00:00 -0500
description: Exploring a new layout algorithm for control flow graphs.
image: /assets/img/iongraph-opengraph.png
---

<link rel="stylesheet" href="/assets/js/iongraph/main.css">

<style>
  .full-width {
    width: calc(min(100vw, 1280px) - (45px * 2));
  }

  .flex {
    display: flex;
  }

  .g2 {
    gap: 0.5rem;
  }

  .ba {
    border: 1px solid var(--color-primary);
  }

  .flex-column {
    flex-direction: column;
  }

  details {
    contain: inline-size;
  }

  @media (min-width: 920px) {
    .flex-row-ns {
      flex-direction: row;
    }
  }

  #livegraph-container {
    display: none;
    align-items: stretch;
    height: 75vh;
  }

  #livegraph-available {
    display: none;
  }

  @media (min-width: 920px) {
    #livegraph-container {
      display: flex;
    }

    #livegraph-available {
      display: block;
    }

    #livegraph-unavailable {
      display: none;
    }

    #livegraph-preview {
      display: none;
    }
  }

  #js-input {
    width: 34em;
    font-size: 0.8em;
    overflow: auto;
  }

  #js-input .prism-code-editor {
    height: 100%;
  }

  #graph-container-container {
    flex-grow: 1;
    background-color: white;
    overflow: hidden;
    position: relative;
    font-size: 0.8em;
    color: black;
  }

  #graph-container {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    padding: 1em;
  }

  #legend {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0.5em 1em 1em;
    background-color: white;
    border-top: 1px solid black;
    display: flex;
    flex-direction: column;
  }

  #legend input {
    outline: none;
  }

  #pass-slider {
    flex-grow: 1;
  }

  .demoblock {
    width: 64px;
    height: 48px;
    border: 1px solid black;
    position: absolute;
    left: 0;
    top: 0;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 0.2rem;

    &.stack {
      background-color: #ddd;
    }

    &.current {
      background-color: #dfd;
    }

    &::after {
      content: "";
      position: absolute;
      background-color: black;
      top: 0;
      left: 0;
      right: 0;
      height: 0.2rem;
    }

    &.loopheader::after {
      background-color: #1fa411;
    }
  }

  .demodummy {
    width: 11px;
    height: 11px;
    border: 1px solid black;
    background-color: white;
    border-radius: 100px;
    position: absolute;
    left: 0;
    top: 0;
  }
</style>

We recently overhauled our internal tools for visualizing the compilation of JavaScript and WebAssembly. When SpiderMonkey's optimizing compiler, Ion, is active, we can now produce interactive graphs showing exactly how functions are processed and optimized.

<div id="livegraph-available">
  <p>You can play with these graphs right here on this page. Simply write some JavaScript code in the <code>test</code> function and see what graph is produced. You can click and drag to navigate, ctrl-scroll to zoom, and drag the slider at the bottom to scrub through the optimization process.</p>
  <p>As you experiment, take note of how stable the graph layout is, even as the sizes of blocks change or new structures are added. Try clicking a block's title to select it, then drag the slider and watch the graph change while the block remains in place. Or, click an instruction's number to highlight it so you can keep an eye on it across passes.</p>
</div>

<div style="contain: inline-size">
  <div id="livegraph-container" class="full-width ba">
    <div id="js-input"></div>
    <div id="graph-container-container">
      <div id="graph-container"></div>
      <div id="legend">
        <span id="pass-name">&nbsp;</span>
        <div class="flex g2">
          <button id="pass-prev" disabled>Prev</button>
          <input id="pass-slider" type="range" list="pass-slider-markers" value="0" disabled>
          <datalist id="pass-slider-markers"></datalist>
          <button id="pass-next" disabled>Next</button>
        </div>
      </div>
    </div>
  </div>
</div>

<img id="livegraph-preview" alt="Example iongraph output" src="/assets/img/iongraph-preview.png" style="max-width: min(100%, 871px)">

<script async type="module">
  import { run } from "/assets/js/iongraph/main.js";
  let alreadyLoaded = false;

  function tryLoad() {
    if (window.innerWidth >= 920 && !alreadyLoaded) {
      run(`
        .prism-code-editor {
          height: 100%;
        }
      `);
      alreadyLoaded = true;
    }
  }
  tryLoad();

  window.addEventListener("resize", () => {
    tryLoad();
  });
</script>

We are not the first to visualize our compiler's internal graphs, of course, nor the first to make them interactive. But I was not satisfied with the output of common tools like [Graphviz](https://graphviz.org/) or [Mermaid](https://mermaid.js.org/), so I decided to create a layout algorithm specifically tailored to our needs. The resulting algorithm is simple, fast, produces surprisingly high-quality output, and can be implemented in less than a thousand lines of code. The purpose of this article is to walk you through this algorithm and the design concepts behind it.

<div id="livegraph-unavailable">
  <p><i>Read this post on desktop to see an interactive demo of iongraph.</i></p>
</div>

## Background

As readers of this blog already know, SpiderMonkey has several tiers of execution for JavaScript and WebAssembly code. The highest tier is known as Ion, an optimizing SSA compiler that takes the most time to compile but produces the highest-quality output.

Working with Ion frequently requires us to visualize and debug the SSA graph. Since 2011 we have used a tool for this purpose called [iongraph](https://github.com/sstangl/iongraph), built by Sean Stangl. It is a simple Python script that takes a JSON dump of our compiler graphs and uses Graphviz to produce a PDF. It is perfectly adequate, and very much the status quo for compiler authors, but unfortunately the Graphviz output has many problems that make our work tedious and frustrating.

The first problem is that the Graphviz output rarely bears any resemblance to the source code that produced it. Graphviz will place nodes wherever it feels will minimize error, resulting in a graph that snakes left and right seemingly at random. There is no visual intuition for how deeply nested a block of code is, nor is it easy to determine which blocks are inside or outside of loops. Consider the following function, and its Graphviz graph:

```js
function foo(n) {
  let result = 0;
  for (let i = 0; i < n; i++) {
    if (!!(i % 2)) {
      result = 0x600DBEEF;
    } else {
      result = 0xBADBEEF;
    }
  }

  return result;
}
```

<div class="ba" style="overflow-y: auto; max-height: 80vh; background-color: white; padding: 1rem; display: flex; justify-content: center; align-items: flex-start">
  <img src="/assets/img/iongraph-example1-orig.svg" style="width: min(36rem, 100%)">
</div>

Counterintuitively, the `return` appears _before_ the two assignments in the body of the loop. Since this graph mirrors JavaScript control flow, we'd expect to see the return at the bottom. This problem only gets worse as graphs grow larger and more complex.

The second, related problem is that Graphviz's output is unstable. Small changes to the input can result in large changes to the output. As you page through the graphs of each pass within Ion, nodes will jump left and right, true and false branches will swap, loops will run up the right side instead of the left, and so on. This makes it very hard to understand the actual effect of any given pass. Consider the following before and after, and notice how the second graph is almost—but not quite—a mirror image of the first, despite very minimal changes to the graph's structure:

<div style="contain: inline-size">
  <div class="full-width ba flex-column flex-row-ns" style="overflow: auto; background-color: white; padding: 1rem; display: flex; gap: 1rem; min-width: 100%; max-height: 80vh">
    <img src="/assets/img/iongraph-example2-before.svg" style="max-width: initial; height: 40rem">
    <img src="/assets/img/iongraph-example2-after.svg" style="max-width: initial; height: 40rem">
  </div>
</div>

None of this felt right to me. Control flow graphs should be able to follow the structure of the program that produced them. After all, a control flow graph has many restrictions that a general-purpose tool would not be aware of: they have very few cycles, all of which are well-defined because they come from loops; furthermore, both JavaScript and WebAssembly have reducible control flow, meaning all loops have only one entry, and it is not possible to jump directly into the middle of a loop. This information could be used to our advantage.

Beyond that, a static PDF is far from ideal when exploring complicated graphs. Finding the inputs or uses of a given instruction is a tedious and frustrating exercise, as is following arrows from block to block. Even just zooming in and out is difficult. I eventually concluded that we ought to just build an interactive tool to overcome these limitations.

## How hard could layout be?

I had one false start with graph layout, with an algorithm that attempted to sort blocks into vertical "tracks". This broke down quickly on a variety of programs and I was forced to go back to the drawing board—in fact, back to the source of the very tool I was trying to replace.

The algorithm used by `dot`, the typical hierarchical layout mode for Graphviz, is known as the Sugiyama layout algorithm, from a 1981 paper by Sugiyama et al. As introduction, I found a short series of [lectures](https://www.youtube.com/watch?v=3_FbSCWLC3A&list=PLubYOWSl9mIvoXDwf_Wqcrvlg15N_AWQE&index=38) that broke down the Sugiyama algorithm into 5 steps:

1. **Cycle breaking**, where the direction of some edges are flipped in order to produce a [DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph).
2. **Leveling**, where vertices are assigned into horizontal layers according to their depth in the graph, and dummy vertices are added to any edge that crosses multiple layers.
3. **Crossing minimization**, where vertices on a layer are reordered in order to minimize the number of edge crossings.
4. **Vertex positioning**, where vertices are horizontally positioned in order to make the edges as straight as possible.
5. **Drawing**, where the final graph is rendered to the screen.

![A screenshot from the lectures, showing the five steps above](</assets/img/kindermann.png>)

These steps struck me as surprisingly straightforward, and provided useful opportunities to insert our own knowledge of the problem:

- Cycle breaking would be trivial for us, since the only cycles in our data are loops, and loop backedges are explicitly labeled. We could simply ignore backedges when laying out the graph.
- Leveling would be straightforward, and could easily be modified to better mimic the source code. Specifically, any blocks coming after a loop in the source code could be artificially pushed down in the layout, solving the confusing early-exit problem.
- Permuting vertices to reduce edge crossings was actually just a bad idea, since our goal was stability from graph to graph. The true and false branches of a condition should always appear in the same order, for example, and a few edge crossings is a small price to pay for this stability.
- Since reducible control flow ensures that a program's loops form a tree, vertex positioning could ensure that loops are always well-nested in the final graph.

Taken all together, these simplifications resulted in a remarkably straightforward algorithm, with the [initial implementation](https://github.com/mozilla-spidermonkey/iongraph/blob/fc27ee3e8f3bd3c020aaf2498de9a260da089bc1/src/Graph.ts) being just 1000 lines of JavaScript. (See this [demo](https://x.com/its_bvisness/status/1957565307809329465?s=46) for what it looked like at the time.) It also proved to be very efficient, since it avoided the most computationally complex parts of the Sugiyama algorithm.


## iongraph from start to finish

We will now go through the entire iongraph layout algorithm. Each section contains explanatory diagrams, in which rectangles are basic blocks and circles are dummy nodes. Loop header blocks (the single entry point to each loop) are additionally colored green.

Be aware that the block positions in these diagrams are not representative of the actual computed layout position at each point in the process. For example, vertical positions are not calculated until the very end, but it would be hard to communicate what the algorithm was doing if all blocks were drawn on a single line!

### Step 1: Layering

We first sort the basic blocks into horizontal tracks called "layers". This is very simple; we just start at layer 0 and recursively walk the graph, incrementing the layer number as we go. As we go, we track the "height" of each loop, not in pixels, but in layers.

We also take this opportunity to vertically position nodes "inside" and "outside" of loops. Whenever we see an edge that exits a loop, we defer the layering of the destination block until we are done layering the loop contents, at which point we know the loop's height.

A note on implementation: nodes are visited multiple times throughout the process, not just once. This can produce a quadratic explosion for large graphs, but I find that an early-out is sufficient to avoid this problem in practice.

The animation below shows the layering algorithm in action. Notice how the final block in the graph is visited twice, once after each loop that branches to it, and in each case, the block is deferred until the entire loop has been layered, rather than processed immediately after its predecessor block. The final position of the block is below the entirety of both loops, rather than directly below one of its predecessors as Graphviz would do. (Remember, horizontal and vertical positions have not yet been computed; the positions of the blocks in this diagram are hardcoded for demonstration purposes.)

<details>
<summary>Implementation pseudocode</summary>
<div data-codeblock="layering"></div>
</details>

```js
/*CODEBLOCK=layering*/function layerBlock(block, layer = 0) {
  // Omitted for clarity: special handling of our "backedge blocks"

  // Early out if the block would not be updated
  if (layer <= block.layer) {
    return;
  }

  // Update the layer of the current block
  block.layer = Math.max(block.layer, layer);

  // Update the heights of all loops containing the current block
  let header = block.loopHeader;
  while (header) {
    header.loopHeight = Math.max(header.loopHeight, block.layer - header.layer + 1);
    header = header.parentLoopHeader;
  }

  // Recursively layer successors
  for (const succ of block.successors) {
    if (succ.loopDepth < block.loopDepth) {
      // Outgoing edges from the current loop will be layered later
      block.loopHeader.outgoingEdges.push(succ);
    } else {
      layerBlock(succ, layer + 1);
    }
  }

  // Layer any outgoing edges only after the contents of the loop have
  // been processed
  if (block.isLoopHeader()) {
    for (const succ of block.outgoingEdges) {
      layerBlock(succ, layer + block.loopHeight);
    }
  }
}
```

<style>
  @media (max-width: 525px) {
    #layeranim {
      transform: scale(0.7);
      transform-origin: top left;
    }
  }
</style>
<div id="layeranim" class="ba" style="background-color: white; width: 476px; height: 410px; position: relative; margin: 1rem auto">
  <svg id="layerarrows" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%"></svg>
</div>

<script type="module">
  import {
    downwardArrow,
    arrowFromBlockToBackedgeDummy,
    upwardArrow,
    arrowToBackedge,
    loopHeaderArrow,
    filerp,
  } from "/assets/js/iongraph/main.js";

  const blocks = [
    { id: 0, x: 20, y: 20, loopDepth: 0, loopHeader: null, successors: [1, 4] },
    { id: 1, x: 20, y: 20, loopDepth: 0, loopHeader: null, successors: [2] },
    { id: 2, x: 60, y: 20, loopDepth: 1, loopHeader: 2, successors: [3, 9], isLoopHeader: true },
    { id: 3, x: 160, y: 20, loopDepth: 1, loopHeader: 2, successors: [2], isBackedge: true },
    { id: 4, x: 280, y: 20, loopDepth: 0, loopHeader: null, successors: [5] },
    { id: 5, x: 280, y: 20, loopDepth: 1, loopHeader: 5, successors: [6, 9], isLoopHeader: true },
    { id: 6, x: 310, y: 20, loopDepth: 1, loopHeader: 5, successors: [7, 8] },
    { id: 7, x: 310, y: 20, loopDepth: 1, loopHeader: 5, successors: [8] },
    { id: 8, x: 380, y: 20, loopDepth: 1, loopHeader: 5, successors: [5], isBackedge: true },
    { id: 9, x: 70, y: 20, loopDepth: 0, loopHeader: null, successors: [] },
  ];

  // const blocks = [
  //   { id: 0,  x: 20, y: 20, loopDepth: 0, loopHeader: null, successors: [1] },
  //   { id: 1,  x: 20, y: 20, loopDepth: 1, loopHeader: 1,    successors: [2, 10], isLoopHeader: true },
  //   { id: 2,  x: 40, y: 20, loopDepth: 1, loopHeader: 1,    successors: [3, 4] },
  //   { id: 3,  x: 40, y: 20, loopDepth: 1, loopHeader: 1,    successors: [8, 5, 6, 7] },
  //   { id: 4,  x: 160, y: 20, loopDepth: 1, loopHeader: 1,    successors: [10] },
  //   { id: 5,  x: 50, y: 20, loopDepth: 1, loopHeader: 1,    successors: [8] },
  //   { id: 6,  x: 100, y: 20, loopDepth: 1, loopHeader: 1,    successors: [8] },
  //   { id: 7,  x: 150, y: 20, loopDepth: 1, loopHeader: 1,    successors: [8] },
  //   { id: 8,  x: 40, y: 20, loopDepth: 1, loopHeader: 1,    successors: [9] },
  //   { id: 9,  x: 100, y: 20, loopDepth: 1, loopHeader: 1,    successors: [1], isBackedge: true },
  //   { id: 10, x: 20, y: 20, loopDepth: 0, loopHeader: null, successors: [] },
  // ];

  const container = document.querySelector("#layeranim");
  for (let i = blocks.length - 1; i >= 0; i--) {
    const el = document.createElement("div");
    el.classList.add("demoblock");
    el.classList.toggle("loopheader", !!blocks[i].isLoopHeader);
    el.setAttribute("data-blockid", blocks[i].id);
    container.appendChild(el);
  }

  let gas = 0;
  function reset(newGas) {
    gas = newGas;
    for (const block of blocks) {
      block.layer = -1;
      block.targetY = 0;
      if (block.isLoopHeader) {
        block.loopHeight = 0;
        block.outgoingEdges = [];
      }
    }

    for (const el of container.querySelectorAll(".demoblock")) {
      el.classList.remove("stack", "current");
    }
  }
  function layerBlock(block, layer = 0) {
    function markCurrent() {
      for (const other of container.querySelectorAll(".demoblock")) {
        other.classList.remove("current");
      }
      el.classList.add("current");
    }

    gas -= 1;
    if (gas <= 0) {
      throw new Error("out of gas");
    }

    const el = container.querySelector(`.demoblock[data-blockid="${block.id}"]`);
    el.classList.add("stack");

    if (block.isBackedge) {
      block.layer = blocks[block.successors[0]].layer;
      el.classList.remove("stack");
      markCurrent();
      return;
    }

    // Early out if the block would not be updated
    if (layer <= block.layer) {
      el.classList.remove("stack");
      return;
    }

    // Update the layer of the current block
    block.layer = Math.max(block.layer, layer);
    markCurrent();

    // Update the heights of all loops containing the current block
    let header = blocks[block.loopHeader];
    while (header) {
      header.loopHeight = Math.max(header.loopHeight, block.layer - header.layer + 1);
      header = blocks[header.parentLoopHeader];
    }

    // Recursively layer successors
    for (const succ of block.successors) {
      if (blocks[succ].loopDepth < block.loopDepth) {
        // Outgoing edges from the current loop will be layered later
        blocks[block.loopHeader].outgoingEdges.push(succ);
      } else {
        layerBlock(blocks[succ], layer + 1);
      }
    }

    // Layer any outgoing edges only after the contents of the loop have
    // been processed
    if (block.isLoopHeader) {
      for (const succ of block.outgoingEdges) {
        layerBlock(blocks[succ], layer + block.loopHeight);
      }
    }

    el.classList.remove("stack");
  }

  (async function() {
    while (true) {
      for (let i = 0; i < 100; i++) {
        reset(i);

        try {
          layerBlock(blocks[0]);
        } catch (e) {
          if (e.message !== "out of gas") {
            throw e;
          }
        }

        for (const block of blocks) {
          // Leave block.x untouched for this demo.
          block.targetY = Math.max(block.layer, 0) * 64 + 20;
        }

        if (gas > 0) {
          break;
        }
        await new Promise(res => setTimeout(res, 600));
      }

      for (const other of container.querySelectorAll(".demoblock")) {
        other.classList.remove("current");
      }
      await new Promise(res => setTimeout(res, 3000));
    }
  })();

  (async function() {
    const svg = container.querySelector("#layerarrows");
    
    let lastTime = performance.now();
    while (true) {
      const now = await new Promise(res => requestAnimationFrame(res));
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Check if animation is on screen
      const rect = svg.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        continue;
      }

      // Lerp block positions
      for (const block of blocks) {
        const R = 0.000001; // fraction remaining after one second: smaller = faster

        const el = container.querySelector(`.demoblock[data-blockid="${block.id}"]`);
        block.y = filerp(block.y, block.targetY, R, dt);
        el.style.transform = `translate(${block.x}px, ${block.y}px)`;
      }

      svg.innerHTML = "";
      for (const block of blocks) {
        if (block.layer > -1) {
          for (const [i, succ] of block.successors.entries()) {
            const x1 = block.x + 5 + i * 10;
            const y1 = block.y + 48;
            if (blocks[succ].isBackedge) {
              const x2 = blocks[succ].x + 64;
              const y2 = blocks[succ].y + 5;
              svg.appendChild(arrowFromBlockToBackedgeDummy(x1, y1, x2 + 10, y1, y1 + 8, 5));
              svg.appendChild(upwardArrow(x2 + 10, y1, x2 + 10, y2 + 16, (y1 + y2) / 2, 5));
              svg.appendChild(arrowToBackedge(x2 + 10, y2 + 16, x2, y2, 5, 2));
            } else if (block.isBackedge && blocks[succ].isLoopHeader) {
              const x1 = block.x;
              const y1 = block.y + 5;
              const x2 = blocks[succ].x + 64;
              const y2 = blocks[succ].y + 5;
              svg.appendChild(loopHeaderArrow(x1, y1, x2, y2, 5, 2));
            } else {
              const x2 = blocks[succ].x + 5;
              const y2 = blocks[succ].y;
              svg.appendChild(downwardArrow(x1, y1, x2, y2, y2 - 8, 5, true, 2));
            }
          }
        }
      }
    }
  })();
</script>

### Step 2: Create dummy nodes

Any time an edge crosses a layer, we create a dummy node. This allows edges to be routed across layers without overlapping any blocks. Unlike in traditional Sugiyama, we always put downward dummies on the left and upward dummies on the right, producing a consistent "counter-clockwise" flow. This also makes it easy to read long vertical edges, whose direction would otherwise be ambiguous. (Recall how the loop backedge flipped from the right to the left in the "unstable layout" Graphviz example from before.)

In addition, we coalesce any edges that are going to the same destination by merging their dummy nodes. This heavily reduces visual noise.

<!--
Interesting program:

function test(n) {
  let result = 0;
  early:
  for (let i = n; i >= -10; i--) {
    if (i > 0) {
      switch (i % 3) {
        case 0:
          result += 1;
          break;
        case 1:
          result -= 1;
          break;
        case 2:
          result *= 3;
          break;
      }
    } else {
      result -= 2;
      break;
    }
    // result += 10;
  }
  return result;
}
-->

<div id="dummydiagram" class="ba" style="background-color: white; width: 344px; height: 478px; position: relative; margin: 1rem auto">
  <svg id="dummyarrows" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%"></svg>
</div>
<script type="module">
  import {
    downwardArrow,
    arrowFromBlockToBackedgeDummy,
    upwardArrow,
    arrowToBackedge,
    loopHeaderArrow,
  } from "/assets/js/iongraph/main.js";
  const blocks = [
    // Blocks
    { id: 0,   layer: 1, successors: [1] },
    { id: 1,   layer: 2, successors: [2, 300], isLoopHeader: true },
    { id: 2,   layer: 3, successors: [3, 4] },
    { id: 3,   layer: 4, successors: [501, 5, 6, 7] },
    { id: 4,   layer: 4, successors: [500] },
    { id: 5,   layer: 5, successors: [8] },
    { id: 6,   layer: 5, successors: [8] },
    { id: 7,   layer: 5, successors: [8] },
    { id: 8,   layer: 6, successors: [601] },
    { id: 9,   layer: 2, successors: [1] },
    { id: 10,  layer: 7, successors: [] },
    // Dummies
    { id: 200, layer: 2, successors: [9],   upward: true },
    { id: 300, layer: 3, successors: [400], upward: false },
    { id: 301, layer: 3, successors: [200], upward: true },
    { id: 400, layer: 4, successors: [500], upward: false },
    { id: 401, layer: 4, successors: [301], upward: true },
    { id: 500, layer: 5, successors: [600], upward: false },
    { id: 501, layer: 5, successors: [8],   upward: false },
    { id: 502, layer: 5, successors: [401], upward: true },
    { id: 600, layer: 6, successors: [10],  upward: false },
    { id: 601, layer: 6, successors: [502], upward: true },
  ];
  const rows = [];
  for (let layer = 1; layer < 10; layer++) {
    rows.push([
      ...blocks.filter(b => b.layer === layer && b.upward === false),
      ...blocks.filter(b => b.layer === layer && b.upward === undefined),
      ...blocks.filter(b => b.layer === layer && b.upward === true),
    ]);
  }
  const container = document.querySelector("#dummydiagram");
  let x = 10, y = 10;
  for (const row of rows) {
    x = 10;
    for (const block of row) {
      block.x = x;
      block.y = y;
      const el = document.createElement("div");
      const isDummy = block.upward !== undefined;
      el.classList.add(isDummy ? "demodummy" : "demoblock");
      el.classList.toggle("loopheader", !!block.isLoopHeader);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      container.appendChild(el);
      x += (isDummy ? 10 : 64) + 20;
    }
    y += 48 + 20;
  }
  const svg = document.querySelector("#dummyarrows");
  for (const block of blocks) {
    for (const [i, succID] of block.successors.entries()) {
      const succ = blocks.find(b => b.id === succID);
      const x1 = block.x + 5 + i * 10;
      const y1 = block.upward ? block.y : block.y + (block.upward === undefined ? 48 : 10);
      if (succ.upward) {
        const x2 = succ.x + 5;
        const y2 = succ.y + 10;
        if (block.upward) {
          svg.appendChild(upwardArrow(x1, y1, x2, y2, y1 - 8, 5));
        } else {
          svg.appendChild(arrowFromBlockToBackedgeDummy(x1, y1, x2, y2, y1 + 8, 5));
        }
      } else if (block.upward && succ.upward === undefined) {
        const x2 = succ.x + 64;
        const y2 = succ.y + 5;
        svg.appendChild(arrowToBackedge(x1, y1 + 10, x2, y2, 5, 2));
      } else if (block.layer === succ.layer) {
        const x1 = block.x;
        const y1 = block.y + 5;
        const x2 = succ.x + 64;
        const y2 = succ.y + 5;
        svg.appendChild(loopHeaderArrow(x1, y1, x2, y2, 5, 2));
      } else {
        const x2 = succ.x + 5;
        const y2 = succ.y;
        svg.appendChild(downwardArrow(x1, y1, x2, y2, y2 - 8, 5, true, 2));
      }
    }
  }
</script>

### Step 3: Straighten edges

This is the fuzziest and most ad-hoc part of the process. Basically, we run lots of small passes that walk up and down the graph, aligning layout nodes with each other. Our edge-straightening passes include:

- Pushing nodes to the right of their loop header to "indent" them.
- Walking a layer left to right, moving children to the right to line up with their parents. If any nodes overlap as a result, they are pushed further to the right.
- Walking a layer right to left, moving parents to the right to line up with their children. This version is more conservative and will not move a node if it would overlap with another. This cleans up most issues from the first pass.
- Straightening runs of dummy nodes so we have clean vertical lines.
- "Sucking in" dummy runs on the left side of the graph if there is room for them to move to the right.
- Straighten out any edges that are "nearly straight", according to a chosen threshold. This makes the graph appear less wobbly. We do this by repeatedly "combing" the graph upward and downward, aligning parents with children, then children with parents, and so on.

It is important to note that dummy nodes participate fully in this system. If for example you have two side-by-side loops, straightening the left loop's backedge will push the right loop to the side, avoiding overlaps and preserving the graph's visual structure.

We do not reach a fixed point with this strategy, nor do we attempt to. I find that if you continue to repeatedly apply these particular layout passes, nodes will wander to the right forever. Instead, the layout passes are hand-tuned to produce decent-looking results for most of the graphs we look at on a regular basis. That said, this could certainly be improved, especially for larger graphs which do benefit from more iterations.

At the end of this step, all nodes have a fixed X-coordinate and will not be modified further.

<style>
  @media (max-width: 440px) {
    #edgediagram {
      transform: scale(0.87);
      transform-origin: top left;
    }
  }
</style>
<div id="edgediagram" class="ba" style="background-color: white; width: 384px; height: 498px; position: relative; margin: 1rem auto">
  <svg id="edgearrows" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%"></svg>
</div>

<script type="module">
  import {
    downwardArrow,
    arrowFromBlockToBackedgeDummy,
    upwardArrow,
    arrowToBackedge,
    loopHeaderArrow,
    straightenEdges,
    filerp,
  } from "/assets/js/iongraph/main.js";

  const blocks = [
    { id: 0,   layer: 1, lh: null, succs: [1] },
    { id: 1,   layer: 2, lh: 1,    succs: [2, 300], isLoopHeader: true },
    { id: 200, layer: 2,           succs: [9],   dummy: true, upward: true,  dst: 9 },
    { id: 300, layer: 3,           succs: [400], dummy: true, upward: false, dst: 10 },
    { id: 2,   layer: 3, lh: 1,    succs: [3, 4] },
    { id: 301, layer: 3,           succs: [200], dummy: true, upward: true,  dst: 9 },
    { id: 400, layer: 4,           succs: [500], dummy: true, upward: false, dst: 10 },
    { id: 3,   layer: 4, lh: 1,    succs: [501, 5, 6, 7] },
    { id: 4,   layer: 4, lh: 1,    succs: [500] },
    { id: 401, layer: 4,           succs: [301], dummy: true, upward: true,  dst: 9 },
    { id: 500, layer: 5,           succs: [600], dummy: true, upward: false, dst: 10 },
    { id: 501, layer: 5,           succs: [8],   dummy: true, upward: false, dst: 8 },
    { id: 5,   layer: 5, lh: 1,    succs: [8] },
    { id: 6,   layer: 5, lh: 1,    succs: [8] },
    { id: 7,   layer: 5, lh: 1,    succs: [8] },
    { id: 502, layer: 5,           succs: [401], dummy: true, upward: true,  dst: 9 },
    { id: 600, layer: 6,           succs: [10],  dummy: true, upward: false, dst: 10 },
    { id: 8,   layer: 6, lh: 1,    succs: [601] },
    { id: 601, layer: 6,           succs: [502], dummy: true, upward: true,  dst: 9 },
    { id: 9,   layer: 2, lh: 1,    succs: [1] },
    { id: 10,  layer: 7, lh: null, succs: [] },
  ];

  let numLayers = 0;
  for (const block of blocks) {
    numLayers = Math.max(numLayers, block.layer);
    block.srcNodes = blocks.filter(b => b.succs.includes(block.id));
    block.dstNodes = block.succs.map(s => blocks.find(b => b.id === s));
    block.loop = block.lh ? blocks.find(b => b.id === block.lh) : null;
    block.dstNode = block.dst ? blocks.find(b => b.id === block.dst) : null;
  }
  const layoutNodesByLayer = [];
  for (let i = 1; i <= numLayers; i++) {
    layoutNodesByLayer.push([
      ...blocks.filter(b => b.layer === i && b.upward === false),
      ...blocks.filter(b => b.layer === i && !b.dummy),
      ...blocks.filter(b => b.layer === i && b.upward === true),
    ]);
  }
  for (let i = 0; i < layoutNodesByLayer.length; i++) {
    for (const node of layoutNodesByLayer[i]) {
      node.x = 20;
      node.y = 20 + (48 + 20) * i;
    }
  }

  const container = document.querySelector("#edgediagram");
  for (const layer of layoutNodesByLayer) {
    for (const node of layer) {
      const el = document.createElement("div");
      el.classList.add(node.dummy ? "demodummy" : "demoblock");
      el.classList.toggle("loopheader", !!node.isLoopHeader);
      el.setAttribute("data-blockid", node.id);
      container.appendChild(el);
    }
  }

  (async function() {
    while (true) {
      for (const [numPasses, delay] of [
        [0, 2000],
        [1, 1000],
        [2, 1000],
        [3, 3000],
      ]) {
        for (const block of blocks) {
          block.x = 20;
        }

        straightenEdges(layoutNodesByLayer, numPasses);
        await new Promise(res => setTimeout(res, delay));
      }
    }
  })();

  (async function() {
    const svg = document.querySelector("#edgearrows");

    let lastTime = performance.now();
    while (true) {
      const now = await new Promise(res => requestAnimationFrame(res));
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Check if animation is on screen
      const rect = svg.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        continue;
      }

      // Lerp block positions
      for (const block of blocks) {
        const R = 0.000001; // fraction remaining after one second: smaller = faster

        const el = container.querySelector(`[data-blockid="${block.id}"]`);
        block.xx = filerp(block.xx ?? block.x, block.x, R, dt);
        block.yy = filerp(block.yy ?? block.y, block.y, R, dt);
        el.style.transform = `translate(${block.xx}px, ${block.yy}px)`;
      }

      svg.innerHTML = "";
      for (const block of blocks) {
        for (const [i, succID] of block.succs.entries()) {
          const succ = blocks.find(b => b.id === succID);
          const x1 = block.xx + 5 + i * 10;
          const y1 = block.upward ? block.yy : block.yy + (block.upward === undefined ? 48 : 10);
          if (succ.upward) {
            const x2 = succ.xx + 5;
            const y2 = succ.yy + 10;
            if (block.upward) {
              svg.appendChild(upwardArrow(x1, y1, x2, y2, y1 - 8, 5));
            } else {
              svg.appendChild(arrowFromBlockToBackedgeDummy(x1, y1, x2, y2, y1 + 8, 5));
            }
          } else if (block.upward && succ.upward === undefined) {
            const x2 = succ.xx + 64;
            const y2 = succ.yy + 5;
            svg.appendChild(arrowToBackedge(x1, y1 + 10, x2, y2, 5, 2));
          } else if (block.layer === succ.layer) {
            const x1 = block.xx;
            const y1 = block.yy + 5;
            const x2 = succ.xx + 64;
            const y2 = succ.yy + 5;
            svg.appendChild(loopHeaderArrow(x1, y1, x2, y2, 5, 2));
          } else {
            const x2 = succ.xx + 5;
            const y2 = succ.yy;
            svg.appendChild(downwardArrow(x1, y1, x2, y2, y2 - 8, 5, true, 2));
          }
        }
      }
    }
  })();
</script>

### Step 4: Track horizontal edges

Edges may overlap visually as they run horizontally between layers. To resolve this, we sort edges into parallel "tracks", giving each a vertical offset. After tracking all the edges, we record the total height of the tracks and store it on the preceding layer as its "track height". This allows us to leave room for the edges in the final layout step.

We first sort edges by their starting position, left to right. This produces a consistent arrangement of edges that has few vertical crossings in practice. Edges are then placed into tracks from the "outside in", stacking rightward edges on top and leftward edges on the bottom, creating a new track if the edge would overlap with or cross any other edge.

The diagram below is interactive. Click and drag the blocks to see how the horizontal edges get assigned to tracks.

<details>
<summary>Implementation pseudocode</summary>
<div data-codeblock="tracks"></div>
</details>

```js
/*CODEBLOCK=tracks*/function trackHorizontalEdges(layer) {
  const TRACK_SPACING = 20;

  // Gather all edges on the layer, and sort left to right by starting coordinate
  const layerEdges = [];
  for (const node of layer.nodes) {
    for (const edge of node.edges) {
      layerEdges.push(edge);
    }
  }
  layerEdges.sort((a, b) => a.startX - b.startX);

  // Assign edges to "tracks" based on whether they overlap horizontally with
  // each other. We walk the tracks from the outside in and stop if we ever
  // overlap with any other edge.
  const rightwardTracks = []; // [][]Edge
  const leftwardTracks = [];  // [][]Edge
  nextEdge:
  for (const edge of layerEdges) {
    const trackSet = edge.endX - edge.startX >= 0 ? rightwardTracks : leftwardTracks;
    let lastValidTrack = null; // []Edge | null

    // Iterate through the tracks in reverse order (outside in)
    for (let i = trackSet.length - 1; i >= 0; i--) {
      const track = trackSet[i];
      let overlapsWithAnyInThisTrack = false;
      for (const otherEdge of track) {
        if (edge.dst === otherEdge.dst) {
          // Assign the edge to this track to merge arrows
          track.push(edge);
          continue nextEdge;
        }

        const al = Math.min(edge.startX, edge.endX);
        const ar = Math.max(edge.startX, edge.endX);
        const bl = Math.min(otherEdge.startX, otherEdge.endX);
        const br = Math.max(otherEdge.startX, otherEdge.endX);
        const overlaps = ar >= bl && al <= br;
        if (overlaps) {
          overlapsWithAnyInThisTrack = true;
          break;
        }
      }

      if (overlapsWithAnyInThisTrack) {
        break;
      } else {
        lastValidTrack = track;
      }
    }

    if (lastValidTrack) {
      lastValidTrack.push(edge);
    } else {
      trackSet.push([edge]);
    }
  }

  // Use track info to apply offsets to each edge for rendering.
  const tracksHeight = TRACK_SPACING * Math.max(
    0,
    rightwardTracks.length + leftwardTracks.length - 1,
  );
  let trackOffset = -tracksHeight / 2;
  for (const track of [...rightwardTracks.toReversed(), ...leftwardTracks]) {
    for (const edge of track) {
      edge.offset = trackOffset;
    }
    trackOffset += TRACK_SPACING;
  }
}
```

<style>
  #trackdiagram {
    .demoblock {
      cursor: move;
      touch-action: none;
    }
  }
</style>
<div id="trackdiagram" class="ba" style="background-color: white; width: 303px; height: 180px; position: relative; margin: 1rem auto">
  <svg id="trackarrows" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%"></svg>
</div>

<script type="module">
  import {
    downwardArrow,
  } from "/assets/js/iongraph/main.js";

  const blocks = [
    { id: 0, x: 20,  y: 20, succs: [3] },
    { id: 1, x: 104, y: 20, succs: [3, 4] },
    { id: 2, x: 198, y: 20, succs: [5] },

    { id: 3, x: 20,  y: 88, succs: [] },
    { id: 4, x: 114, y: 88, succs: [] },
    { id: 5, x: 198, y: 88, succs: [] },
  ];

  const container = document.querySelector("#trackdiagram");
  const svg = document.querySelector("#trackarrows");
  let startMousePos = { x: 0, y: 0 };
  let lastMousePos = { x: 0, y: 0 };
  let draggingBlock = null;
  for (const block of blocks) {
    block.trackOffsets = new Array(block.succs.length).fill(0);

    const el = document.createElement("div");
    el.classList.add(block.dummy ? "demodummy" : "demoblock");
    el.setAttribute("data-blockid", block.id);
    container.appendChild(el);

    const icon = document.createElement("img");
    icon.src = "/assets/img/drag-lr.svg";
    icon.style.width = "24px";
    icon.style.opacity = 0.25;
    el.appendChild(icon);

    el.addEventListener("pointerdown", e => {
      if (e.pointerType === "mouse" && !(e.button === 0 || e.button === 1)) {
        return;
      }

      e.preventDefault();
      container.setPointerCapture(e.pointerId);
      startMousePos = { x: e.clientX, y: e.clientY };
      lastMousePos = { x: e.clientX, y: e.clientY };
      draggingBlock = block;
    });
  }
  container.addEventListener("pointermove", e => {
    if (!container.hasPointerCapture(e.pointerId)) {
      return;
    }

    const dx = e.clientX - lastMousePos.x;
    draggingBlock.x = Math.max(1, Math.min(236, draggingBlock.x + dx));
    lastMousePos = { x: e.clientX, y: e.clientY };

    renderTracks();
  });
  container.addEventListener("pointerup", e => {
    container.releasePointerCapture(e.pointerId);
  });

  function renderTracks() {
    const PORT_START = 5;
    const PORT_SPACING = 10;
    const TRACK_SPACING = 6;
    const ARROW_RADIUS = 5;

    // Gather all edges on the layer, and sort left to right by starting coordinate
    const layerEdges = [];
    for (const block of blocks) {
      for (const [srcPort, dstID] of block.succs.entries()) {
        const dst = blocks.find(b => b.id === dstID);
        const x1 = block.x + PORT_START + PORT_SPACING * srcPort;
        const x2 = dst.x + PORT_START;
        if (Math.abs(x2 - x1) < 2 * ARROW_RADIUS) {
          // Ignore edges that are narrow enough not to render with a joint.
          continue;
        }
        layerEdges.push({ x1, x2, src: block, srcPort, dst });
      }
    }
    layerEdges.sort((a, b) => a.x1 - b.x1);

    // Assign edges to "tracks" based on whether they overlap horizontally with
    // each other. We walk the tracks from the outside in and stop if we ever
    // overlap with any other edge.
    const rightwardTracks = []; // [][]Edge
    const leftwardTracks = [];  // [][]Edge
    nextEdge:
    for (const edge of layerEdges) {
      const trackSet = edge.x2 - edge.x1 >= 0 ? rightwardTracks : leftwardTracks;
      let lastValidTrack = null; // []Edge | null

      // Iterate through the tracks in reverse order (outside in)
      for (let i = trackSet.length - 1; i >= 0; i--) {
        const track = trackSet[i];
        let overlapsWithAnyInThisTrack = false;
        for (const otherEdge of track) {
          if (edge.dst === otherEdge.dst) {
            // Assign the edge to this track to merge arrows
            track.push(edge);
            continue nextEdge;
          }

          const al = Math.min(edge.x1, edge.x2);
          const ar = Math.max(edge.x1, edge.x2);
          const bl = Math.min(otherEdge.x1, otherEdge.x2);
          const br = Math.max(otherEdge.x1, otherEdge.x2);
          const overlaps = ar >= bl && al <= br;
          if (overlaps) {
            overlapsWithAnyInThisTrack = true;
            break;
          }
        }

        if (overlapsWithAnyInThisTrack) {
          break;
        } else {
          lastValidTrack = track;
        }
      }

      if (lastValidTrack) {
        lastValidTrack.push(edge);
      } else {
        trackSet.push([edge]);
      }
    }

    // Use track info to apply offsets to each edge for rendering.
    const tracksHeight = TRACK_SPACING * Math.max(
      0,
      rightwardTracks.length + leftwardTracks.length - 1,
    );
    let trackOffset = -tracksHeight / 2;
    for (const track of [...rightwardTracks.toReversed(), ...leftwardTracks]) {
      for (const edge of track) {
        edge.src.trackOffsets[edge.srcPort] = trackOffset;
      }
      trackOffset += TRACK_SPACING;
    }

    // total hack!
    for (const block of blocks) {
      if (block.id >= 3) {
        block.y = 20 + 48 + 20 + tracksHeight;
      }
    }

    // Render
    svg.innerHTML = "";
    for (const block of blocks) {
      const el = container.querySelector(`[data-blockid="${block.id}"]`);
      el.style.transform = `translate(${block.x}px, ${block.y}px)`;

      for (const [i, succID] of block.succs.entries()) {
        const succ = blocks.find(b => b.id === succID);
        const x1 = block.x + 5 + i * 10;
        const y1 = block.y + 48;
        const x2 = succ.x + 5;
        const y2 = succ.y;
        svg.appendChild(downwardArrow(x1, y1, x2, y2, (y1 + y2) / 2 + block.trackOffsets[i], 5, true, 2));
      }
    }
  }

  renderTracks();
</script>

### Step 5: Verticalize

Finally, we assign each node a Y-coordinate. Starting at a Y-coordinate of zero, we iterate through the layers, repeatedly adding the layer's height and its track height, where the layer height is the maximum height of any node in the layer. All nodes within a layer receive the same Y-coordinate; this is simple and easier to read than Graphviz's default of vertically centering nodes within a layer.

Now that every node has both an X and Y coordinate, the layout process is complete.

<details>
<summary>Implementation pseudocode</summary>
<div data-codeblock="verticalize"></div>
</details>

```js
/*CODEBLOCK=verticalize*/function verticalize(layers) {
  let layerY = 0;
  for (const layer of layers) {
    let layerHeight = 0;
    for (const node of layer.nodes) {
      node.y = layerY;
      layerHeight = Math.max(layerHeight, node.height);
    }
    layerY += layerHeight;
    layerY += layer.trackHeight;
  }
}
```

<style>
  #verticalizediagram {
    .demodummy {
      display: none;
    }
  }

  @media (max-width: 440px) {
    #verticalizediagram {
      transform: scale(0.87);
      transform-origin: top left;
    }
  }
</style>
<div id="verticalizediagram" class="ba" style="background-color: white; width: 384px; height: 518px; position: relative; margin: 1rem auto">
  <svg id="verticalizearrows" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%"></svg>
</div>

<script type="module">
  import {
    downwardArrow,
    arrowFromBlockToBackedgeDummy,
    upwardArrow,
    arrowToBackedge,
    loopHeaderArrow,
    straightenEdges,
    filerp,
  } from "/assets/js/iongraph/main.js";

  const PORT_START = 5;
  const PORT_SPACING = 10;
  const TRACK_SPACING = 4;
  const TRACK_PADDING = 10;
  const ARROW_RADIUS = 5;

  const blocks = [
    { id: 0,   layer: 1, lh: null, succs: [1] },
    { id: 1,   layer: 2, lh: 1,    succs: [2, 300], isLoopHeader: true },
    { id: 200, layer: 2,           succs: [9],   dummy: true, upward: true,  dst: 9 },
    { id: 300, layer: 3,           succs: [400], dummy: true, upward: false, dst: 10 },
    { id: 2,   layer: 3, lh: 1,    succs: [3, 4] },
    { id: 301, layer: 3,           succs: [200], dummy: true, upward: true,  dst: 9 },
    { id: 400, layer: 4,           succs: [500], dummy: true, upward: false, dst: 10 },
    { id: 3,   layer: 4, lh: 1,    succs: [501, 5, 6, 7] },
    { id: 4,   layer: 4, lh: 1,    succs: [500] },
    { id: 401, layer: 4,           succs: [301], dummy: true, upward: true,  dst: 9 },
    { id: 500, layer: 5,           succs: [600], dummy: true, upward: false, dst: 10 },
    { id: 501, layer: 5,           succs: [8],   dummy: true, upward: false, dst: 8 },
    { id: 5,   layer: 5, lh: 1,    succs: [8] },
    { id: 6,   layer: 5, lh: 1,    succs: [8] },
    { id: 7,   layer: 5, lh: 1,    succs: [8] },
    { id: 502, layer: 5,           succs: [401], dummy: true, upward: true,  dst: 9 },
    { id: 600, layer: 6,           succs: [10],  dummy: true, upward: false, dst: 10 },
    { id: 8,   layer: 6, lh: 1,    succs: [601] },
    { id: 601, layer: 6,           succs: [502], dummy: true, upward: true,  dst: 9 },
    { id: 9,   layer: 2, lh: 1,    succs: [1] },
    { id: 10,  layer: 7, lh: null, succs: [] },
  ];

  let numLayers = 0;
  for (const block of blocks) {
    numLayers = Math.max(numLayers, block.layer);
    block.srcNodes = blocks.filter(b => b.succs.includes(block.id));
    block.dstNodes = block.succs.map(s => blocks.find(b => b.id === s));
    block.loop = block.lh ? blocks.find(b => b.id === block.lh) : null;
    block.dstNode = block.dst ? blocks.find(b => b.id === block.dst) : null;
  }
  const layoutNodesByLayer = [];
  for (let i = 1; i <= numLayers; i++) {
    layoutNodesByLayer.push([
      ...blocks.filter(b => b.layer === i && b.upward === false),
      ...blocks.filter(b => b.layer === i && !b.dummy),
      ...blocks.filter(b => b.layer === i && b.upward === true),
    ]);
  }
  for (let i = 0; i < layoutNodesByLayer.length; i++) {
    for (const node of layoutNodesByLayer[i]) {
      node.x = 20;
    }
  }

  const container = document.querySelector("#verticalizediagram");
  for (const layer of layoutNodesByLayer) {
    for (const node of layer) {
      const el = document.createElement("div");
      el.classList.add(node.dummy ? "demodummy" : "demoblock");
      el.classList.toggle("loopheader", !!node.isLoopHeader);
      el.setAttribute("data-blockid", node.id);
      container.appendChild(el);
    }
  }

  // Layout
  for (const block of blocks) {
    block.x = 20;
    block.trackOffsets = new Array(block.succs.length).fill(0);
  }
  straightenEdges(layoutNodesByLayer, 100);

  // Track edges
  const layerTrackHeights = [];
  {
    // Gather all edges on the layer, and sort left to right by starting coordinate
    for (let i = 0; i < layoutNodesByLayer.length; i++) {
      const layerEdges = [];
      for (const block of layoutNodesByLayer[i]) {
        for (const [srcPort, dstID] of block.succs.entries()) {
          const dst = blocks.find(b => b.id === dstID);
          const x1 = block.x + PORT_START + PORT_SPACING * srcPort;
          const x2 = dst.x + PORT_START;
          if (Math.abs(x2 - x1) < 2 * ARROW_RADIUS) {
            // Ignore edges that are narrow enough not to render with a joint.
            continue;
          }
          layerEdges.push({ x1, x2, src: block, srcPort, dst });
        }
      }
      layerEdges.sort((a, b) => a.x1 - b.x1);

      // Assign edges to "tracks" based on whether they overlap horizontally with
      // each other. We walk the tracks from the outside in and stop if we ever
      // overlap with any other edge.
      const rightwardTracks = []; // [][]Edge
      const leftwardTracks = [];  // [][]Edge
      nextEdge:
      for (const edge of layerEdges) {
        const trackSet = edge.x2 - edge.x1 >= 0 ? rightwardTracks : leftwardTracks;
        let lastValidTrack = null; // []Edge | null

        // Iterate through the tracks in reverse order (outside in)
        for (let i = trackSet.length - 1; i >= 0; i--) {
          const track = trackSet[i];
          let overlapsWithAnyInThisTrack = false;
          for (const otherEdge of track) {
            if (edge.dst === otherEdge.dst) {
              // Assign the edge to this track to merge arrows
              track.push(edge);
              continue nextEdge;
            }

            const al = Math.min(edge.x1, edge.x2);
            const ar = Math.max(edge.x1, edge.x2);
            const bl = Math.min(otherEdge.x1, otherEdge.x2);
            const br = Math.max(otherEdge.x1, otherEdge.x2);
            const overlaps = ar >= bl && al <= br;
            if (overlaps) {
              overlapsWithAnyInThisTrack = true;
              break;
            }
          }

          if (overlapsWithAnyInThisTrack) {
            break;
          } else {
            lastValidTrack = track;
          }
        }

        if (lastValidTrack) {
          lastValidTrack.push(edge);
        } else {
          trackSet.push([edge]);
        }
      }

      // Use track info to apply offsets to each edge for rendering.
      const tracksHeight = TRACK_SPACING * Math.max(
        0,
        rightwardTracks.length + leftwardTracks.length - 1,
      );
      let trackOffset = -tracksHeight / 2;
      for (const track of [...rightwardTracks.toReversed(), ...leftwardTracks]) {
        for (const edge of track) {
          edge.src.trackOffsets[edge.srcPort] = trackOffset;
        }
        trackOffset += TRACK_SPACING;
      }

      layerTrackHeights.push(tracksHeight);
    }
  }
  console.log({ layerTrackHeights });

  // Verticalize
  let layerY = 20;
  for (let i = 0; i < layoutNodesByLayer.length; i++) {
    let layerHeight = 0;
    for (const node of layoutNodesByLayer[i]) {
      node.layer = i;
      node.y = layerY;
      layerHeight = Math.max(layerHeight, 48);
    }
    layerY += layerHeight;
    layerY += TRACK_PADDING + layerTrackHeights[i] + TRACK_PADDING;
  }

  // Apply layout
  for (const block of blocks) {
    const el = container.querySelector(`[data-blockid="${block.id}"]`);
    el.style.transform = `translate(${block.x}px, ${block.y}px)`;
  }

  // Render
  const svg = document.querySelector("#verticalizearrows");
  svg.innerHTML = "";
  for (const block of blocks) {
    for (const [i, succID] of block.succs.entries()) {
      const succ = blocks.find(b => b.id === succID);
      const x1 = block.x + 5 + i * 10;
      const y1 = block.upward ? block.y : block.y + (block.upward === undefined ? 48 : 0);
      if (succ.upward) {
        const x2 = succ.x + 5;
        const y2 = succ.y;
        if (block.upward) {
          const succsucc = blocks.find(b => b.id === succ.succs[0]);
          svg.appendChild(upwardArrow(x1, y1, x2, y2 + (succsucc.dummy ? 0 : 10), y1 - 8, 5));
        } else {
          const ym = y1 + TRACK_PADDING + layerTrackHeights[block.layer] / 2 + block.trackOffsets[i];
          svg.appendChild(arrowFromBlockToBackedgeDummy(x1, y1, x2, y2, ym, 5));
        }
      } else if (block.upward && succ.upward === undefined) {
        const x2 = succ.x + 64;
        const y2 = succ.y + 5;
        svg.appendChild(arrowToBackedge(x1, y1 + 10, x2, y2, 5, 2));
      } else if (block.layer === succ.layer) {
        const x1 = block.x;
        const y1 = block.y + 5;
        const x2 = succ.x + 64;
        const y2 = succ.y + 5;
        svg.appendChild(loopHeaderArrow(x1, y1, x2, y2, 5, 2));
      } else {
        const x2 = succ.x + 5;
        const y2 = succ.y;
        const ym = y1 + TRACK_PADDING + layerTrackHeights[block.layer] / 2 + block.trackOffsets[i];
        svg.appendChild(downwardArrow(x1, y1, x2, y2, ym, 5, !succ.dummy, 2));
      }
    }
  }
</script>

### Step 6: Render

The details of rendering are out of scope for this article, and depend on the specific application. However, I wish to highlight a stylistic decision that I feel makes our graphs more readable.

When rendering edges, we use a style inspired by [railroad diagrams](https://en.wikipedia.org/wiki/Syntax_diagram). These have many advantages over the Bézier curves employed by Graphviz. First, straight lines feel more organized and are easier to follow when scrolling up and down. Second, they are easy to route (vertical when crossing layers, horizontal between layers). Third, they are easy to coalesce when they share a destination, and the junctions provide a clear indication of the edge's direction. Fourth, they always cross at right angles, improving clarity and reducing the need to avoid edge crossings in the first place.

Consider the following example. There are several edge crossings that may traditionally be considered undesirable—yet the edges and their directions remain clear. Of particular note is the vertical junction highlighted in red on the left: not only is it immediately clear that these edges share a destination, but the junction itself signals that the edges are flowing downward. I find this much more pleasant than the "rat's nest" that Graphviz tends to produce.

<img alt="Examples of railroad-diagram edges" src="/assets/img/iongraph-edge-examples-highlighted.png" width="716">


## Why does this work?

It may seem surprising that such a simple (and stupid) layout algorithm could produce such readable graphs, when more sophisticated layout algorithms struggle. However, I feel that the algorithm succeeds _because_ of its simplicity.

Most graph layout algorithms are optimization problems, where error is minimized on some chosen metrics. However, these metrics seem to correlate poorly to readability in practice. For example, it seems good in theory to rearrange nodes to minimize edge crossings. But a predictable order of nodes seems to produce more sensible results overall, and simple rules for edge routing are sufficient to keep things tidy. (As a bonus, this also gives us layout stability from pass to pass.) Similarly, layout rules like "align parents with their children" produce more readable results than "minimize the lengths of edges".

Furthermore, by rejecting the optimization problem, a human author gains more control over the layout. We are able to position nodes "inside" of loops, and push post-loop content down in the graph, _because_ we reject this global constraint-solver approach. Minimizing "error" is meaningless compared to a human _maximizing_ meaning through thoughtful design.

And finally, the resulting algorithm is simply more efficient. All the layout passes in iongraph are easy to program and scale gracefully to large graphs because they run in roughly linear time. It is better, in my view, to run a fixed number of layout iterations according to your graph complexity and time budget, rather than to run a complex constraint solver until it is "done".

By following this philosophy, even the worst graphs become tractable. Below is a screenshot of a zlib function, compiled to WebAssembly, and rendered using the old tool.

<img alt="spaghetti nightmare!!" src="/assets/img/iongraph-spaghetti-nightmare.png">

It took about **ten minutes** for Graphviz to produce this spaghetti nightmare. By comparison, iongraph can now lay out this function in **20 milliseconds**. The result is still not particularly beautiful, but it renders thousands of times faster _and_ is much easier to navigate.

<img alt="better spaghetti" src="/assets/img/iongraph-zlib.png">

Perhaps programmers ought to put less trust into magic optimizing systems, especially when a human-friendly result is the goal. Simple (and stupid) algorithms can be very effective when applied with discretion and taste.

## Future work

We have already integrated iongraph into the Firefox profiler, making it easy for us to view the graphs of the most expensive or impactful functions we find in our performance work. Unfortunately, this is only available in specific builds of the SpiderMonkey shell, and is not available in full browser builds. This is due to architectural differences in how profiling data is captured and the flags with which the browser and shell are built. I would love for Firefox users to someday be able to view these graphs themselves, but at the moment we have no plans to expose this to the browser. However, one bug tracking some related work can be found [here](https://bugzilla.mozilla.org/show_bug.cgi?id=1987005).

We will continue to sporadically update iongraph with more features to aid us in our work. We have several ideas for new features, including [richer navigation](https://github.com/mozilla-spidermonkey/iongraph/issues/9), search, and visualization of [register allocation info](https://github.com/mozilla-spidermonkey/iongraph/issues/4). However, we have no explicit roadmap for when these features may be released.

To experiment with iongraph locally, you can run a debug build of the SpiderMonkey shell with `IONFLAGS=logs`; this will dump information to `/tmp/ion.json`. This file can then be loaded into the [standalone deployment of iongraph](https://mozilla-spidermonkey.github.io/iongraph/). Please be aware that the user experience is rough and unpolished in its current state.

The source code for iongraph can be found on [GitHub](https://github.com/mozilla-spidermonkey/iongraph). If this subject interests you, we would welcome contributions to iongraph and its integration into the browser. The best place to reach us is our [Matrix chat](https://chat.mozilla.org/#/room/#spidermonkey:mozilla.org).

---

_Thanks to Matthew Gaudet, Asaf Gartner, and Colin Davidson for their feedback on this article._

<script>
  // Terrible code to put code blocks inside HTML tags, because our markdown
  // renderer cannot do that.

  const codeblocks = {};
  for (const codeblock of document.querySelectorAll(".highlighter-rouge")) {
    for (const comment of codeblock.querySelectorAll(".cm")) {
      const matches = comment.innerText.match(/CODEBLOCK=([a-zA-Z0-9_]+)/);
      if (matches) {
        comment.remove();
        codeblock.remove();
        codeblocks[matches[1]] = codeblock;
      }
    }
  }
  for (const placeholder of document.querySelectorAll("[data-codeblock]")) {
    const codeblockName = placeholder.getAttribute("data-codeblock");
    placeholder.replaceWith(codeblocks[codeblockName]);
  }
</script>

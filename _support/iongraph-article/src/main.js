import { basicEditor } from "prism-code-editor/setups"
import "prism-code-editor/prism/languages/javascript"

import { Graph } from "iongraph-web";
import { getModulePaths } from "./js.wasm" with { type: "wasi-0.1", instantiation: "async" };

import "iongraph-web/style.css";

const TIMEOUT_MS = 1000;

const containerEl = document.getElementById("graph-container");
const passNameEl = document.getElementById("pass-name")
const passSliderEl = document.getElementById("pass-slider");
const passSliderMarkersEl = document.getElementById("pass-slider-markers");
const passPrevEl = document.getElementById("pass-prev");
const passNextEl = document.getElementById("pass-next");

export async function run(editorExtraStyles) {
  const editor = basicEditor(
    "#js-input",
    {
      language: "javascript",
      theme: "github-dark",
      value: `function test(n) {
  if (n <= 2) {
    return 1;
  }
  let a = 1;
  let b = 1;
  let c = 2;
  for (let i = 3; i <= n; i++) {
    c = a + b;
    a = b;
    b = c;
  }
  return c;
}

// The test function must run enough times to be
// optimized by Ion. This example is running with
// --fast-warmup, which lowers the threshold to
// about 30 runs.
for (let i = 0; i < 30; i++) {
  test(i);
}`,
    },
  );

  const editorStylesheet = new CSSStyleSheet();
  editorStylesheet.replaceSync(editorExtraStyles);
  document.getElementById("js-input").shadowRoot.adoptedStyleSheets = [editorStylesheet];

  const compiledModules = await compileAllModules();

  let resolveGetProgram = null;
  let deferredNextProgram = null;
  function updateProgram(program) {
    if (resolveGetProgram) {
      resolveGetProgram(program);
      resolveGetProgram = null;
    } else {
      deferredNextProgram = program;
    }
  }

  updateProgram(editor.value);
  editor.setOptions({
    onUpdate(value) {
      updateProgram(value);
    },
  });

  let graph;
  let passes = [];
  function updateGraph(pass) {
    passNameEl.innerText = `After ${pass.name}`;

    const previousState = graph?.exportState();

    containerEl.innerHTML = "";
    graph = new Graph(containerEl, pass);
    if (previousState) {
      graph.restoreState(previousState, { preserveSelectedBlockPosition: true });
    } else {
      graph.zoom = 0.8;
      graph.updatePanAndZoom();
    }
  }

  function setUIEnabled(enabled) {
    if (enabled) {
      passSliderEl.removeAttribute("disabled");
      passPrevEl.removeAttribute("disabled");
      passNextEl.removeAttribute("disabled");
    } else {
      passSliderEl.setAttribute("disabled", "disabled");
      passPrevEl.setAttribute("disabled", "disabled");
      passNextEl.setAttribute("disabled", "disabled");
    }
  }

  passSliderEl.addEventListener("input", () => {
    updateGraph(passes[passSliderEl.value]);
  });
  passPrevEl.addEventListener("click", () => {
    passSliderEl.value = Math.max(0, Number(passSliderEl.value) - 1);
    updateGraph(passes[passSliderEl.value]);
  });
  passNextEl.addEventListener("click", () => {
    passSliderEl.value = Math.min(passes.length - 1, Number(passSliderEl.value) + 1);
    updateGraph(passes[passSliderEl.value]);
  });

  while (true) {
    let resolvePendingRun;

    const worker = new Worker("/assets/js/iongraph/worker.js", { type: "module" });
    worker.onmessage = e => {
      resolvePendingRun(e.data);
    }
    worker.postMessage({
      action: "receiveModules",
      moduleMap: compiledModules,
    });

    try {
      while (true) {
        const program = await new Promise((res, rej) => {
          if (deferredNextProgram !== null) {
            res(deferredNextProgram);
            deferredNextProgram = null;
          } else {
            resolveGetProgram = res;
          }
        });

        const data = await new Promise((res, rej) => {
          resolvePendingRun = res;
          worker.postMessage({
            action: "runProgram",
            program: program,
          });
          setTimeout(() => {
            rej("timed out");
          }, TIMEOUT_MS);
        });

        if (data.ok) {
          const testFunc = data.ionJSON.functions.find(f => f.name !== "input.js:1");
          if (testFunc) {
            passes = testFunc.passes;
            passSliderEl.max = `${passes.length - 1}`;
            passSliderMarkersEl.innerHTML = "";
            for (let i = 0; i < passes.length; i++) {
              const marker = document.createElement("option");
              marker.value = `${i}`;
              passSliderMarkersEl.appendChild(marker);
            }
            const sliderFraction = parseInt(passSliderEl.value, 10) / parseInt(passSliderEl.max, 10);
            const passIndex = Math.round(sliderFraction * (passes.length - 1));
            passSliderEl.value = `${passIndex}`;

            updateGraph(testFunc.passes[passIndex]);
            setUIEnabled(true);
          } else {
            containerEl.innerText = "The test function was not optimized. Make sure it is run at least 30 times.";
            setUIEnabled(false);
          }
        } else {
          console.log(data.stdout);
          containerEl.innerText = data.stderr;
        }
      }
    } catch (e) {
      containerEl.innerText = "Timed out";
      worker.terminate();
      if (e !== "timed out") {
        console.error(e);
        containerEl.innerText = "An unexpected error occurred. See the console.";
      }
    }
  }
}

async function compileAllModules() {
  const mods = getModulePaths();
  const compiledModules = Array.from(await Promise.all(
    mods.values().map(path => WebAssembly.compileStreaming(fetch(`/assets/js/iongraph/${path}`)))
  ));
  return new Map(mods.keys().map((name, i) => [name, compiledModules[i]]));
}

// Arrow-drawing functions from iongraph, modified

export function downwardArrow(
  x1, y1,
  x2, y2,
  ym, r,
  doArrowhead, as,
  stroke = 1,
) {
  if (y2 < y1) {
    return document.createElementNS("http://www.w3.org/2000/svg", "g");
  }

  // Align stroke to pixels
  if (stroke % 2 === 1) {
    x1 += 0.5;
    x2 += 0.5;
    ym += 0.5;
  }

  // Fix degenerate ym
  if (ym < y1 || y2 < ym) {
    ym = (y1 + y2) / 2;
  }

  let path = "";
  path += `M ${x1} ${y1} `; // move to start

  if (Math.abs(x2 - x1) < 2 * r) {
    // Degenerate case where the radii won't fit; fall back to bezier.
    path += `C ${x1} ${y1 + (y2 - y1) / 3} ${x2} ${y1 + 2 * (y2 - y1) / 3} ${x2} ${y2} `;
  } else {
    const dir = Math.sign(x2 - x1);
    path += `L ${x1} ${ym - r} `; // line down
    path += `A ${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${x1 + r * dir} ${ym} `; // arc to joint
    path += `L ${x2 - r * dir} ${ym} `; // joint
    path += `A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x2} ${ym + r} `; // arc to line
    path += `L ${x2} ${y2} `; // line down
  }

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);

  if (doArrowhead) {
    const v = arrowhead(x2, y2, 180, as);
    g.appendChild(v);
  }

  return g;
}

export function upwardArrow(
  x1, y1,
  x2, y2,
  ym, r,
  doArrowhead, as,
  stroke = 1,
) {
  if (!(y2 + r <= ym && ym <= y1 - r)) {
    return document.createElementNS("http://www.w3.org/2000/svg", "g");
  }

  // Align stroke to pixels
  if (stroke % 2 === 1) {
    x1 += 0.5;
    x2 += 0.5;
    ym += 0.5;
  }

  let path = "";
  path += `M ${x1} ${y1} `; // move to start

  if (Math.abs(x2 - x1) < 2 * r) {
    // Degenerate case where the radii won't fit; fall back to bezier.
    path += `C ${x1} ${y1 + (y2 - y1) / 3} ${x2} ${y1 + 2 * (y2 - y1) / 3} ${x2} ${y2} `;
  } else {
    const dir = Math.sign(x2 - x1);
    path += `L ${x1} ${ym + r} `; // line up
    path += `A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x1 + r * dir} ${ym} `; // arc to joint
    path += `L ${x2 - r * dir} ${ym} `; // joint
    path += `A ${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${x2} ${ym - r} `; // arc to line
    path += `L ${x2} ${y2} `; // line up
  }

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);

  if (doArrowhead) {
    const v = arrowhead(x2, y2, 0, as);
    g.appendChild(v);
  }

  return g;
}

export function arrowToBackedge(
  x1, y1,
  x2, y2, r, as,
  stroke = 1,
) {
  if (!(y1 - r >= y2 && x1 - r >= x2)) {
    return document.createElementNS("http://www.w3.org/2000/svg", "g");
  }

  // Align stroke to pixels
  if (stroke % 2 === 1) {
    x1 += 0.5;
    y2 += 0.5;
  }

  let path = "";
  path += `M ${x1} ${y1} `; // move to start
  path += `L ${x1} ${y2 + r}`; // line up
  path += `A ${r} ${r} 0 0 0 ${x1 - r} ${y2} `; // arc to line
  path += `L ${x2} ${y2} `; // line left

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);

  const v = arrowhead(x2, y2, 270, as);
  g.appendChild(v);

  return g;
}

export function arrowFromBlockToBackedgeDummy(
  x1, y1,
  x2, y2,
  ym, r,
  stroke = 1,
) {
  if (!(y1 + r <= ym && x1 <= x2 && y2 <= y1)) {
    return document.createElementNS("http://www.w3.org/2000/svg", "g");
  }

  // Align stroke to pixels
  if (stroke % 2 === 1) {
    x1 += 0.5;
    x2 += 0.5;
    ym += 0.5;
  }

  let path = "";
  path += `M ${x1} ${y1} `; // move to start
  path += `L ${x1} ${ym - r} `; // line down
  path += `A ${r} ${r} 0 0 0 ${x1 + r} ${ym} `; // arc to horizontal joint
  path += `L ${x2 - r} ${ym} `; // horizontal joint
  path += `A ${r} ${r} 0 0 0 ${x2} ${ym - r} `; // arc to line
  path += `L ${x2} ${y2} `; // line up

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);

  return g;
}

export function loopHeaderArrow(
  x1, y1,
  x2, y2, r, as,
  stroke = 1,
) {
  if (!(x2 < x1)) {
    return document.createElementNS("http://www.w3.org/2000/svg", "g");
  }

  // Align stroke to pixels
  if (stroke % 2 === 1) {
    y1 += 0.5;
    y2 += 0.5;
  }

  // Fix degenerate radius
  r = Math.min(r, Math.abs(y2 - y1) / 2);

  let path = "";
  path += `M ${x1} ${y1} `; // move to start

  const dir = Math.sign(y2 - y1);
  const xm = (x1 + x2) / 2;
  path += `L ${xm + r} ${y1} `; // line left
  path += `A ${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${xm} ${y1 + r * dir} `; // arc to joint
  path += `L ${xm} ${y2 - r * dir} `; // joint
  path += `A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${xm - r} ${y2} `; // arc to line
  path += `L ${x2} ${y2} `; // line left

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", "black");
  p.setAttribute("stroke-width", `${stroke} `);
  g.appendChild(p);

  const v = arrowhead(x2, y2, 270, as);
  g.appendChild(v);

  return g;
}

function arrowhead(x, y, rot, size = 5) {
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", `M 0 0 L ${-size} ${size * 1.5} L ${size} ${size * 1.5} Z`);
  p.setAttribute("transform", `translate(${x}, ${y}) rotate(${rot})`);
  return p;
}

// Framerate-independent lerp smoothing, as sourced from the following talk
// by Freya Holmér: https://youtu.be/LSNQuFEDOyQ?si=VqUxBF2r7mfnuba8
export function filerp(current, target, r, dt) {
  return (current - target) * Math.pow(r, dt) + target;
}

//
// Layout!! Copied from iongraph and bastardized for presentation.
//

// Takes an array of array of nodes
export function straightenEdges(layoutNodesByLayer, numPasses) {
  const PORT_START = 5;
  const PORT_SPACING = 10;
  const BLOCK_GAP = 20;
  const NEARLY_STRAIGHT = 20;

  // Push nodes to the right if they are too close together.
  const pushNeighbors = (nodes) => {
    for (let i = 0; i < nodes.length - 1; i++) {
      const node = nodes[i];
      const neighbor = nodes[i + 1];

      const firstNonDummy = node.dummy && !neighbor.dummy;
      const nodeRightPlusPadding = node.x + (node.dummy ? 10 : 64) + (firstNonDummy ? PORT_START : 0) + BLOCK_GAP;
      neighbor.x = Math.max(neighbor.x, nodeRightPlusPadding);
    }
  };

  const pushOnly = () => {
    for (let layer = 0; layer < layoutNodesByLayer.length - 1; layer++) {
      const nodes = layoutNodesByLayer[layer];
      pushNeighbors(nodes);
    }
  };

  // Push nodes to the right so they fit inside their loop.
  const pushIntoLoops = () => {
    for (const nodes of layoutNodesByLayer) {
      for (const node of nodes) {
        if (node.dummy) {
          continue;
        }

        if (node.loop) {
          node.x = Math.max(node.x, node.loop.x);
        }
      }
    }
  };

  const straightenDummyRuns = () => {
    // Track max position of dummies
    const dummyLinePositions = new Map();
    for (const dummy of dummies(layoutNodesByLayer)) {
      const dst = dummy.dstNode;
      let desiredX = dummy.x;
      dummyLinePositions.set(dst, Math.max(dummyLinePositions.get(dst) ?? 0, desiredX));
    }

    // Apply positions to dummies
    for (const dummy of dummies(layoutNodesByLayer)) {
      const backedge = dummy.dstNode;
      const x = dummyLinePositions.get(backedge);
      dummy.x = x;
    }

    for (const nodes of layoutNodesByLayer) {
      pushNeighbors(nodes);
    }
  };

  const suckInLeftmostDummies = () => {
    // Break leftmost dummy runs by pulling them as far right as possible
    // (but never pulling any node to the right of its parent, or its
    // ultimate destination block). Track the min position for each
    // destination as we go.
    const dummyRunPositions = new Map(); // <Block, number>
    for (const nodes of layoutNodesByLayer) {
      // Find leftmost non-dummy node
      let i = 0;
      let nextX = 0;
      for (; i < nodes.length; i++) {
        if (!(nodes[i].flags & LEFTMOST_DUMMY)) {
          nextX = nodes[i].x;
          break;
        }
      }

      // Walk backward through leftmost dummies, calculating how far to the
      // right we can push them.
      i -= 1;
      nextX -= BLOCK_GAP + PORT_START;
      for (; i >= 0; i--) {
        const dummy = nodes[i];
        assert(dummy.block === null && dummy.flags & LEFTMOST_DUMMY);
        let maxSafeX = nextX;
        for (const src of dummy.srcNodes) {
          const srcX = src.x + src.dstNodes.indexOf(dummy) * PORT_SPACING;
          if (srcX < maxSafeX) {
            maxSafeX = srcX;
          }
        }
        if (dummy.dstBlock.layoutNode.x < maxSafeX) {
          maxSafeX = dummy.dstBlock.layoutNode.x;
        }
        dummy.x = maxSafeX;
        nextX = dummy.x - BLOCK_GAP;
        dummyRunPositions.set(dummy.dstBlock, Math.min(dummyRunPositions.get(dummy.dstBlock) ?? Infinity, maxSafeX));
      }
    }

    // Apply min positions to all dummies in a run.
    for (const dummy of dummies(layoutNodesByLayer)) {
      if (!(dummy.flags & LEFTMOST_DUMMY)) {
        continue;
      }
      const x = dummyRunPositions.get(dummy.dstBlock);
      assert(x, `no position for run to block ${dummy.dstBlock.id}`);
      dummy.x = x;
    }
  };

  // Walk down the layers, pulling children to the right to line up with
  // their parents.
  const straightenChildren = () => {
    for (let layer = 0; layer < layoutNodesByLayer.length - 1; layer++) {
      const nodes = layoutNodesByLayer[layer];

      pushNeighbors(nodes);

      // If a node has been shifted, we must never shift any node to its
      // left. This preserves stable graph layout and just avoids lots of
      // jank. We also only shift a child based on its first parent, because
      // otherwide nodes end up being pulled too far to the right.
      let lastShifted = -1;
      for (const node of nodes) {
        for (const [srcPort, dst] of node.dstNodes.entries()) {
          let dstIndexInNextLayer = layoutNodesByLayer[layer + 1].indexOf(dst);
          if (dstIndexInNextLayer > lastShifted && dst.srcNodes[0] === node) {
            const srcPortOffset = PORT_START + PORT_SPACING * srcPort;
            const dstPortOffset = PORT_START;

            let xBefore = dst.x;
            dst.x = Math.max(dst.x, node.x + srcPortOffset - dstPortOffset);
            if (dst.x !== xBefore) {
              lastShifted = dstIndexInNextLayer;
            }
          }
        }
      }
    }
  };

  // Walk each layer right to left, pulling nodes to the right to line them
  // up with their parents and children as well as possible, but WITHOUT ever
  // causing another overlap and therefore any need to push neighbors.
  //
  // (The exception is rightmost dummies; we push those because we can
  // trivially straighten them later.)
  const straightenConservative = () => {
    for (const nodes of layoutNodesByLayer) {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];

        // Only do this to block nodes, and not to backedges.
        if (!node.block || node.block.attributes.includes("backedge")) {
          continue;
        }

        let deltasToTry = [];
        for (const parent of node.srcNodes) {
          const srcPortOffset = PORT_START + parent.dstNodes.indexOf(node) * PORT_SPACING;
          const dstPortOffset = PORT_START;
          deltasToTry.push((parent.x + srcPortOffset) - (node.x + dstPortOffset));
        }
        for (const [srcPort, dst] of node.dstNodes.entries()) {
          if (dst.block === null && dst.dstBlock.attributes.includes("backedge")) {
            continue;
          }
          const srcPortOffset = PORT_START + srcPort * PORT_SPACING;
          const dstPortOffset = PORT_START;
          deltasToTry.push((dst.x + dstPortOffset) - (node.x + srcPortOffset));
        }
        if (deltasToTry.includes(0)) {
          // Already aligned with something! Ignore this and move on.
          continue;
        }
        deltasToTry = deltasToTry
          .filter(d => d > 0)
          .sort((a, b) => a - b);

        for (const delta of deltasToTry) {
          let overlapsAny = false;
          for (let j = i + 1; j < nodes.length; j++) {
            const other = nodes[j];
            if (other.flags & RIGHTMOST_DUMMY) {
              // Ignore rightmost dummies since they can be freely straightened out later.
              continue;
            }
            const a1 = node.x + delta, a2 = node.x + delta + node.size.x;
            const b1 = other.x - BLOCK_GAP, b2 = other.x + other.size.x + BLOCK_GAP;
            const overlaps = a2 >= b1 && a1 <= b2;
            if (overlaps) {
              overlapsAny = true;
            }
          }
          if (!overlapsAny) {
            node.x += delta;
            break;
          }
        }
      }

      pushNeighbors(nodes);
    }
  };

  // Walk up the layers, straightening out edges that are nearly straight.
  const straightenNearlyStraightEdgesUp = () => {
    for (let layer = layoutNodesByLayer.length - 1; layer >= 0; layer--) {
      const nodes = layoutNodesByLayer[layer];

      pushNeighbors(nodes);

      for (const node of nodes) {
        for (const src of node.srcNodes) {
          if (!src.dummy) {
            // Only do this to dummies, because straightenChildren takes care
            // of block-to-block edges.
            continue;
          }

          const wiggle = Math.abs(src.x - node.x);
          if (wiggle <= NEARLY_STRAIGHT) {
            src.x = Math.max(src.x, node.x);
            node.x = Math.max(src.x, node.x);
          }
        }
      }
    }
  };

  // Ditto, but walking down instead of up.
  const straightenNearlyStraightEdgesDown = () => {
    for (let layer = 0; layer < layoutNodesByLayer.length; layer++) {
      const nodes = layoutNodesByLayer[layer];

      pushNeighbors(nodes);

      for (const node of nodes) {
        if (node.dstNodes.length === 0) {
          continue;
        }
        const dst = node.dstNodes[0];
        if (!dst.dummy) {
          // Only do this to dummies for the reasons above.
          continue;
        }

        const wiggle = Math.abs(dst.x - node.x);
        if (wiggle <= NEARLY_STRAIGHT) {
          dst.x = Math.max(dst.x, node.x);
          node.x = Math.max(dst.x, node.x);
        }
      }
    }
  };

  // The order of these passes is arbitrary. I just play with it until I like
  // the result. I have them in this wacky structure because I want to be
  // able to use my debug scrubber.
  const passes = [
    pushOnly,
    straightenChildren,
    // pushIntoLoops,
    straightenDummyRuns,
    // repeat that a bunch?

    // // straightenDummyRuns,

    // straightenNearlyStraightEdgesUp,
    // straightenNearlyStraightEdgesDown,
    // // repeat that a bunch?

    // // straightenConservative,
    // // straightenDummyRuns,
    // // suckInLeftmostDummies,
  ];
  // console.group("Running passes");
  for (const [i, pass] of passes.entries()) {
    if (i < numPasses) {
      // console.log(pass.name ?? pass.toString());
      pass();
    }
  }
  // console.groupEnd();
}

function* dummies(layoutNodesByLayer) {
  for (const nodes of layoutNodesByLayer) {
    for (const node of nodes) {
      if (node.dummy) {
        yield node;
      }
    }
  }
}

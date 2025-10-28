import { rmSync } from "fs";

import * as esbuild from "esbuild";
import { wasi01 } from "./esbuild-wasi.mjs";

const OUT_DIR = "../../assets/js/iongraph";
rmSync(OUT_DIR, { recursive: true, force: true });

const ctx = await esbuild.context({
  entryPoints: ["src/main.js", "src/worker.js"],
  outdir: OUT_DIR,
  bundle: true,
  // minify: true,
  sourcemap: true,
  format: "esm",
  target: ["firefox115"], // oldest supported ESR as of now
  loader: {
    ".wasm": "file",
  },
  plugins: [wasi01({ fetchPrefix: "/assets/js/iongraph/" })],
});

if (process.argv.includes("--watch")) {
  await ctx.watch();
} else {
  await ctx.rebuild();
  await ctx.dispose();
}

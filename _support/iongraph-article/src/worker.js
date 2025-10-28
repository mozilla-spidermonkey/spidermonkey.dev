import { WASIShim } from '@bytecodealliance/preview2-shim/instantiation';
import { cli, filesystem } from '@bytecodealliance/preview2-shim';

import { instantiate } from "./js.wasm" with { type: "wasi-0.1", instantiation: "async" };

let moduleMap = new Map();
function loader(name) {
  return moduleMap.get(name);
}

const magic = "=-=-=-=-=-=-= HERE BEGINS THE JSON =-=-=-=-=-=-=";

async function run(input) {
  const component = await instantiate(loader, new WASIShim().getImportObject());

  const program = `
    ${input}

    print("${magic}");
    print(os.file.readFile("/tmp/ion.json"));
  `;

  let stdout = "";
  let stderr = "";
  filesystem._setFileData({
    dir: {
      "input.js": { source: new TextEncoder().encode(program) },
      "tmp": { dir: {} },
    },
  });
  cli._setStdout({
    write(contents) {
      stdout += new TextDecoder().decode(contents);
    },
    blockingFlush() { },
  });
  cli._setStderr({
    write(contents) {
      stderr += new TextDecoder().decode(contents);
    },
    blockingFlush() { },
  });

  cli._setEnv({ "IONFLAGS": "logs" });
  cli._setArgs(["js.wasm", "--fast-warmup", "input.js"]);
  try {
    component.run.run();

    let rawJSON = stdout.slice(stdout.indexOf(magic) + magic.length).trim();
    const ionJSON = JSON.parse(rawJSON ? rawJSON + "]}" : `{ "version": 1, "functions": [] }`);

    postMessage({
      ok: true,
      ionJSON,
      stdout,
      stderr,
    });
  } catch (e) {
    if (e.exitError) {
      postMessage({
        ok: false,
        stdout,
        stderr,
      });
    } else {
      postMessage({
        ok: false,
        stdout,
        stderr: "Bug in this demo! See console for details.",
      });
      throw e;
    }
  }
}

onmessage = e => {
  switch (e.data.action) {
    case "receiveModules": {
      moduleMap = e.data.moduleMap;
    } break;
    case "runProgram": {
      run(e.data.program);
    } break;
  }
};

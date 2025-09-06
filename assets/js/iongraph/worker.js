var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/@bytecodealliance/preview2-shim/lib/browser/clocks.js
var clocks_exports = {};
__export(clocks_exports, {
  monotonicClock: () => monotonicClock,
  wallClock: () => wallClock
});
var monotonicClock = {
  resolution() {
    return 1e6;
  },
  now() {
    return BigInt(Math.floor(performance.now() * 1e6));
  },
  subscribeInstant(instant) {
    instant = BigInt(instant);
    const now = this.now();
    if (instant <= now) {
      return this.subscribeDuration(0);
    }
    return this.subscribeDuration(instant - now);
  },
  subscribeDuration(_duration) {
    _duration = BigInt(_duration);
    console.log(`[monotonic-clock] subscribe`);
  }
};
var wallClock = {
  now() {
    let now = Date.now();
    const seconds = BigInt(Math.floor(now / 1e3));
    const nanoseconds = now % 1e3 * 1e6;
    return { seconds, nanoseconds };
  },
  resolution() {
    return { seconds: 0n, nanoseconds: 1e6 };
  }
};

// node_modules/@bytecodealliance/preview2-shim/lib/browser/filesystem.js
var filesystem_exports = {};
__export(filesystem_exports, {
  _getFileData: () => _getFileData,
  _setCwd: () => _setCwd,
  _setFileData: () => _setFileData,
  filesystemTypes: () => types,
  preopens: () => preopens,
  types: () => types
});

// node_modules/@bytecodealliance/preview2-shim/lib/browser/io.js
var io_exports = {};
__export(io_exports, {
  error: () => error,
  poll: () => poll,
  streams: () => streams
});
var id = 0;
var symbolDispose = Symbol.dispose || Symbol.for("dispose");
var IoError = class Error2 {
  constructor(msg) {
    this.msg = msg;
  }
  toDebugString() {
    return this.msg;
  }
};
var InputStream = class {
  /**
   * @param {InputStreamHandler} handler
   */
  constructor(handler) {
    if (!handler) {
      console.trace("no handler");
    }
    this.id = ++id;
    this.handler = handler;
  }
  read(len) {
    if (this.handler.read) {
      return this.handler.read(len);
    }
    return this.handler.blockingRead.call(this, len);
  }
  blockingRead(len) {
    return this.handler.blockingRead.call(this, len);
  }
  skip(len) {
    if (this.handler.skip) {
      return this.handler.skip.call(this, len);
    }
    if (this.handler.read) {
      const bytes = this.handler.read.call(this, len);
      return BigInt(bytes.byteLength);
    }
    return this.blockingSkip.call(this, len);
  }
  blockingSkip(len) {
    if (this.handler.blockingSkip) {
      return this.handler.blockingSkip.call(this, len);
    }
    const bytes = this.handler.blockingRead.call(this, len);
    return BigInt(bytes.byteLength);
  }
  subscribe() {
    console.log(`[streams] Subscribe to input stream ${this.id}`);
  }
  [symbolDispose]() {
    if (this.handler.drop) {
      this.handler.drop.call(this);
    }
  }
};
var OutputStream = class {
  /**
   * @param {OutputStreamHandler} handler
   */
  constructor(handler) {
    if (!handler) {
      console.trace("no handler");
    }
    this.id = ++id;
    this.open = true;
    this.handler = handler;
  }
  checkWrite(len) {
    if (!this.open) {
      return 0n;
    }
    if (this.handler.checkWrite) {
      return this.handler.checkWrite.call(this, len);
    }
    return 1000000n;
  }
  write(buf) {
    this.handler.write.call(this, buf);
  }
  blockingWriteAndFlush(buf) {
    this.handler.write.call(this, buf);
  }
  flush() {
    if (this.handler.flush) {
      this.handler.flush.call(this);
    }
  }
  blockingFlush() {
    this.open = true;
  }
  writeZeroes(len) {
    this.write.call(this, new Uint8Array(Number(len)));
  }
  blockingWriteZeroes(len) {
    this.blockingWrite.call(this, new Uint8Array(Number(len)));
  }
  blockingWriteZeroesAndFlush(len) {
    this.blockingWriteAndFlush.call(this, new Uint8Array(Number(len)));
  }
  splice(src, len) {
    const spliceLen = Math.min(len, this.checkWrite.call(this));
    const bytes = src.read(spliceLen);
    this.write.call(this, bytes);
    return bytes.byteLength;
  }
  blockingSplice(_src, _len) {
    console.log(`[streams] Blocking splice ${this.id}`);
  }
  forward(_src) {
    console.log(`[streams] Forward ${this.id}`);
  }
  subscribe() {
    console.log(`[streams] Subscribe to output stream ${this.id}`);
  }
  [symbolDispose]() {
  }
};
var error = { Error: IoError };
var streams = { InputStream, OutputStream };
var Pollable = class {
};
function pollList(_list) {
}
function pollOne(_poll) {
}
var poll = {
  Pollable,
  pollList,
  pollOne
};

// node_modules/@bytecodealliance/preview2-shim/lib/browser/config.js
var _cwd2 = "/";
function _setCwd(cwd) {
  _cwd2 = cwd;
}

// node_modules/@bytecodealliance/preview2-shim/lib/browser/environment.js
var _env = [];
var _args = [];
var _cwd3 = "/";
function _setEnv(envObj) {
  _env = Object.entries(envObj);
}
function _setArgs(args) {
  _args = args;
}
var environment = {
  getEnvironment() {
    return _env;
  },
  getArguments() {
    return _args;
  },
  initialCwd() {
    return _cwd3;
  }
};

// node_modules/@bytecodealliance/preview2-shim/lib/browser/filesystem.js
var { InputStream: InputStream2, OutputStream: OutputStream2 } = streams;
function _setFileData(fileData) {
  _fileData = fileData;
  _rootPreopen[0] = new Descriptor(fileData);
  const cwd = environment.initialCwd();
  _setCwd(cwd || "/");
}
function _getFileData() {
  return JSON.stringify(_fileData);
}
var _fileData = { dir: {} };
var timeZero = {
  seconds: BigInt(0),
  nanoseconds: 0
};
function getChildEntry(parentEntry, subpath, openFlags) {
  if (subpath === "." && _rootPreopen && descriptorGetEntry(_rootPreopen[0]) === parentEntry) {
    subpath = _cwd;
    if (subpath.startsWith("/") && subpath !== "/") {
      subpath = subpath.slice(1);
    }
  }
  let entry = parentEntry;
  let segmentIdx;
  do {
    if (!entry || !entry.dir) {
      throw "not-directory";
    }
    segmentIdx = subpath.indexOf("/");
    const segment = segmentIdx === -1 ? subpath : subpath.slice(0, segmentIdx);
    if (segment === "..") {
      throw "no-entry";
    }
    if (segment === "." || segment === "") {
    } else if (!entry.dir[segment] && openFlags.create) {
      entry = entry.dir[segment] = openFlags.directory ? { dir: {} } : { source: new Uint8Array([]) };
    } else {
      entry = entry.dir[segment];
    }
    subpath = subpath.slice(segmentIdx + 1);
  } while (segmentIdx !== -1);
  if (!entry) {
    throw "no-entry";
  }
  return entry;
}
function getSource(fileEntry) {
  if (typeof fileEntry.source === "string") {
    fileEntry.source = new TextEncoder().encode(fileEntry.source);
  }
  return fileEntry.source;
}
var DirectoryEntryStream = class {
  constructor(entries) {
    this.idx = 0;
    this.entries = entries;
  }
  readDirectoryEntry() {
    if (this.idx === this.entries.length) {
      return null;
    }
    const [name, entry] = this.entries[this.idx];
    this.idx += 1;
    return {
      name,
      type: entry.dir ? "directory" : "regular-file"
    };
  }
};
var Descriptor = class _Descriptor {
  #stream;
  #entry;
  #mtime = 0;
  _getEntry(descriptor) {
    return descriptor.#entry;
  }
  constructor(entry, isStream) {
    if (isStream) {
      this.#stream = entry;
    } else {
      this.#entry = entry;
    }
  }
  readViaStream(_offset) {
    const source = getSource(this.#entry);
    let offset = Number(_offset);
    return new InputStream2({
      blockingRead(len) {
        if (offset === source.byteLength) {
          throw { tag: "closed" };
        }
        const bytes = source.slice(offset, offset + Number(len));
        offset += bytes.byteLength;
        return bytes;
      }
    });
  }
  writeViaStream(_offset) {
    const entry = this.#entry;
    let offset = Number(_offset);
    return new OutputStream2({
      write(buf) {
        const newSource = new Uint8Array(
          buf.byteLength + entry.source.byteLength
        );
        newSource.set(entry.source, 0);
        newSource.set(buf, offset);
        offset += buf.byteLength;
        entry.source = newSource;
        return buf.byteLength;
      }
    });
  }
  appendViaStream() {
    console.log(`[filesystem] APPEND STREAM`);
  }
  advise(descriptor, offset, length, advice) {
    console.log(`[filesystem] ADVISE`, descriptor, offset, length, advice);
  }
  syncData() {
    console.log(`[filesystem] SYNC DATA`);
  }
  getFlags() {
    console.log(`[filesystem] FLAGS FOR`);
  }
  getType() {
    if (this.#stream) {
      return "fifo";
    }
    if (this.#entry.dir) {
      return "directory";
    }
    if (this.#entry.source) {
      return "regular-file";
    }
    return "unknown";
  }
  setSize(size) {
    console.log(`[filesystem] SET SIZE`, size);
  }
  setTimes(dataAccessTimestamp, dataModificationTimestamp) {
    console.log(
      `[filesystem] SET TIMES`,
      dataAccessTimestamp,
      dataModificationTimestamp
    );
  }
  read(length, offset) {
    const source = getSource(this.#entry);
    return [
      source.slice(offset, offset + length),
      offset + length >= source.byteLength
    ];
  }
  write(buffer, offset) {
    if (offset !== 0) {
      throw "invalid-seek";
    }
    this.#entry.source = buffer;
    return buffer.byteLength;
  }
  readDirectory() {
    if (!this.#entry?.dir) {
      throw "bad-descriptor";
    }
    return new DirectoryEntryStream(
      Object.entries(this.#entry.dir).sort(([a], [b]) => a > b ? 1 : -1)
    );
  }
  sync() {
    console.log(`[filesystem] SYNC`);
  }
  createDirectoryAt(path) {
    const entry = getChildEntry(this.#entry, path, {
      create: true,
      directory: true
    });
    if (entry.source) {
      throw "exist";
    }
  }
  stat() {
    let type = "unknown", size = BigInt(0);
    if (this.#entry.source) {
      type = "regular-file";
      const source = getSource(this.#entry);
      size = BigInt(source.byteLength);
    } else if (this.#entry.dir) {
      type = "directory";
    }
    return {
      type,
      linkCount: BigInt(0),
      size,
      dataAccessTimestamp: timeZero,
      dataModificationTimestamp: timeZero,
      statusChangeTimestamp: timeZero
    };
  }
  statAt(_pathFlags, path) {
    const entry = getChildEntry(this.#entry, path, {
      create: false,
      directory: false
    });
    let type = "unknown", size = BigInt(0);
    if (entry.source) {
      type = "regular-file";
      const source = getSource(entry);
      size = BigInt(source.byteLength);
    } else if (entry.dir) {
      type = "directory";
    }
    return {
      type,
      linkCount: BigInt(0),
      size,
      dataAccessTimestamp: timeZero,
      dataModificationTimestamp: timeZero,
      statusChangeTimestamp: timeZero
    };
  }
  setTimesAt() {
    console.log(`[filesystem] SET TIMES AT`);
  }
  linkAt() {
    console.log(`[filesystem] LINK AT`);
  }
  openAt(_pathFlags, path, openFlags, _descriptorFlags, _modes) {
    const childEntry = getChildEntry(this.#entry, path, openFlags);
    return new _Descriptor(childEntry);
  }
  readlinkAt() {
    console.log(`[filesystem] READLINK AT`);
  }
  removeDirectoryAt() {
    console.log(`[filesystem] REMOVE DIR AT`);
  }
  renameAt() {
    console.log(`[filesystem] RENAME AT`);
  }
  symlinkAt() {
    console.log(`[filesystem] SYMLINK AT`);
  }
  unlinkFileAt() {
    console.log(`[filesystem] UNLINK FILE AT`);
  }
  isSameObject(other) {
    return other === this;
  }
  metadataHash() {
    let upper = BigInt(0);
    upper += BigInt(this.#mtime);
    return { upper, lower: BigInt(0) };
  }
  metadataHashAt(_pathFlags, _path) {
    let upper = BigInt(0);
    upper += BigInt(this.#mtime);
    return { upper, lower: BigInt(0) };
  }
};
var descriptorGetEntry = Descriptor.prototype._getEntry;
delete Descriptor.prototype._getEntry;
var _preopens = [[new Descriptor(_fileData), "/"]];
var _rootPreopen = _preopens[0];
var preopens = {
  getDirectories() {
    return _preopens;
  }
};
var types = {
  Descriptor,
  DirectoryEntryStream
};

// node_modules/@bytecodealliance/preview2-shim/lib/browser/http.js
var http_exports = {};
__export(http_exports, {
  incomingHandler: () => incomingHandler,
  outgoingHandler: () => outgoingHandler,
  send: () => send,
  types: () => types2
});
function send(req) {
  console.log(`[http] Send (browser) ${req.uri}`);
  try {
    const xhr = new XMLHttpRequest();
    xhr.open(req.method.toString(), req.uri, false);
    const requestHeaders = new Headers(req.headers);
    for (let [name, value] of requestHeaders.entries()) {
      if (name !== "user-agent" && name !== "host") {
        xhr.setRequestHeader(name, value);
      }
    }
    xhr.send(req.body && req.body.length > 0 ? req.body : null);
    const body = xhr.response ? new TextEncoder().encode(xhr.response) : void 0;
    const headers = [];
    xhr.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach((line) => {
      var parts = line.split(": ");
      var key = parts.shift();
      var value = parts.join(": ");
      headers.push([key, value]);
    });
    return {
      status: xhr.status,
      headers,
      body
    };
  } catch (err) {
    throw new Error(err.message);
  }
}
var incomingHandler = {
  handle() {
  }
};
var outgoingHandler = {
  handle() {
  }
};
var types2 = {
  dropFields(_fields) {
    console.log("[types] Drop fields");
  },
  newFields(_entries) {
    console.log("[types] New fields");
  },
  fieldsGet(_fields, _name) {
    console.log("[types] Fields get");
  },
  fieldsSet(_fields, _name, _value) {
    console.log("[types] Fields set");
  },
  fieldsDelete(_fields, _name) {
    console.log("[types] Fields delete");
  },
  fieldsAppend(_fields, _name, _value) {
    console.log("[types] Fields append");
  },
  fieldsEntries(_fields) {
    console.log("[types] Fields entries");
  },
  fieldsClone(_fields) {
    console.log("[types] Fields clone");
  },
  finishIncomingStream(s) {
    console.log(`[types] Finish incoming stream ${s}`);
  },
  finishOutgoingStream(s, _trailers) {
    console.log(`[types] Finish outgoing stream ${s}`);
  },
  dropIncomingRequest(_req) {
    console.log("[types] Drop incoming request");
  },
  dropOutgoingRequest(_req) {
    console.log("[types] Drop outgoing request");
  },
  incomingRequestMethod(_req) {
    console.log("[types] Incoming request method");
  },
  incomingRequestPathWithQuery(_req) {
    console.log("[types] Incoming request path with query");
  },
  incomingRequestScheme(_req) {
    console.log("[types] Incoming request scheme");
  },
  incomingRequestAuthority(_req) {
    console.log("[types] Incoming request authority");
  },
  incomingRequestHeaders(_req) {
    console.log("[types] Incoming request headers");
  },
  incomingRequestConsume(_req) {
    console.log("[types] Incoming request consume");
  },
  newOutgoingRequest(_method, _pathWithQuery, _scheme, _authority, _headers) {
    console.log("[types] New outgoing request");
  },
  outgoingRequestWrite(_req) {
    console.log("[types] Outgoing request write");
  },
  dropResponseOutparam(_res) {
    console.log("[types] Drop response outparam");
  },
  setResponseOutparam(_response) {
    console.log("[types] Drop fields");
  },
  dropIncomingResponse(_res) {
    console.log("[types] Drop incoming response");
  },
  dropOutgoingResponse(_res) {
    console.log("[types] Drop outgoing response");
  },
  incomingResponseStatus(_res) {
    console.log("[types] Incoming response status");
  },
  incomingResponseHeaders(_res) {
    console.log("[types] Incoming response headers");
  },
  incomingResponseConsume(_res) {
    console.log("[types] Incoming response consume");
  },
  newOutgoingResponse(_statusCode, _headers) {
    console.log("[types] New outgoing response");
  },
  outgoingResponseWrite(_res) {
    console.log("[types] Outgoing response write");
  },
  dropFutureIncomingResponse(_f) {
    console.log("[types] Drop future incoming response");
  },
  futureIncomingResponseGet(_f) {
    console.log("[types] Future incoming response get");
  },
  listenToFutureIncomingResponse(_f) {
    console.log("[types] Listen to future incoming response");
  }
};

// node_modules/@bytecodealliance/preview2-shim/lib/browser/random.js
var random_exports = {};
__export(random_exports, {
  insecure: () => insecure,
  insecureSeed: () => insecureSeed,
  random: () => random
});
var MAX_BYTES = 65536;
var insecureRandomValue1;
var insecureRandomValue2;
var insecure = {
  getInsecureRandomBytes(len) {
    return random.getRandomBytes(len);
  },
  getInsecureRandomU64() {
    return random.getRandomU64();
  }
};
var insecureSeedValue1;
var insecureSeedValue2;
var insecureSeed = {
  insecureSeed() {
    if (insecureSeedValue1 === void 0) {
      insecureSeedValue1 = random.getRandomU64();
      insecureSeedValue2 = random.getRandomU64();
    }
    return [insecureSeedValue1, insecureSeedValue2];
  }
};
var random = {
  getRandomBytes(len) {
    const bytes = new Uint8Array(Number(len));
    if (len > MAX_BYTES) {
      for (var generated = 0; generated < len; generated += MAX_BYTES) {
        crypto.getRandomValues(
          bytes.subarray(generated, generated + MAX_BYTES)
        );
      }
    } else {
      crypto.getRandomValues(bytes);
    }
    return bytes;
  },
  getRandomU64() {
    return crypto.getRandomValues(new BigUint64Array(1))[0];
  },
  insecureRandom() {
    if (insecureRandomValue1 === void 0) {
      insecureRandomValue1 = random.getRandomU64();
      insecureRandomValue2 = random.getRandomU64();
    }
    return [insecureRandomValue1, insecureRandomValue2];
  }
};

// node_modules/@bytecodealliance/preview2-shim/lib/browser/sockets.js
var sockets_exports = {};
__export(sockets_exports, {
  instanceNetwork: () => instanceNetwork,
  ipNameLookup: () => ipNameLookup,
  network: () => network,
  tcp: () => tcp,
  tcpCreateSocket: () => tcpCreateSocket,
  udp: () => udp,
  udpCreateSocket: () => udpCreateSocket
});
var instanceNetwork = {
  instanceNetwork() {
    console.log(`[sockets] instance network`);
  }
};
var ipNameLookup = {
  dropResolveAddressStream() {
  },
  subscribe() {
  },
  resolveAddresses() {
  },
  resolveNextAddress() {
  },
  nonBlocking() {
  },
  setNonBlocking() {
  }
};
var network = {
  dropNetwork() {
  }
};
var tcpCreateSocket = {
  createTcpSocket() {
  }
};
var tcp = {
  subscribe() {
  },
  dropTcpSocket() {
  },
  bind() {
  },
  connect() {
  },
  listen() {
  },
  accept() {
  },
  localAddress() {
  },
  remoteAddress() {
  },
  addressFamily() {
  },
  setListenBacklogSize() {
  },
  keepAlive() {
  },
  setKeepAlive() {
  },
  noDelay() {
  },
  setNoDelay() {
  },
  unicastHopLimit() {
  },
  setUnicastHopLimit() {
  },
  receiveBufferSize() {
  },
  setReceiveBufferSize() {
  },
  sendBufferSize() {
  },
  setSendBufferSize() {
  },
  nonBlocking() {
  },
  setNonBlocking() {
  },
  shutdown() {
  }
};
var udp = {
  subscribe() {
  },
  dropUdpSocket() {
  },
  bind() {
  },
  connect() {
  },
  receive() {
  },
  send() {
  },
  localAddress() {
  },
  remoteAddress() {
  },
  addressFamily() {
  },
  unicastHopLimit() {
  },
  setUnicastHopLimit() {
  },
  receiveBufferSize() {
  },
  setReceiveBufferSize() {
  },
  sendBufferSize() {
  },
  setSendBufferSize() {
  },
  nonBlocking() {
  },
  setNonBlocking() {
  }
};
var udpCreateSocket = {
  createUdpSocket() {
  }
};

// node_modules/@bytecodealliance/preview2-shim/lib/browser/cli.js
var cli_exports = {};
__export(cli_exports, {
  _setArgs: () => _setArgs,
  _setCwd: () => _setCwd,
  _setEnv: () => _setEnv,
  _setStderr: () => _setStderr,
  _setStdin: () => _setStdin,
  _setStdout: () => _setStdout,
  environment: () => environment,
  exit: () => exit,
  stderr: () => stderr,
  stdin: () => stdin,
  stdout: () => stdout,
  terminalInput: () => terminalInput,
  terminalOutput: () => terminalOutput,
  terminalStderr: () => terminalStderr,
  terminalStdin: () => terminalStdin,
  terminalStdout: () => terminalStdout
});
var { InputStream: InputStream3, OutputStream: OutputStream3 } = streams;
var symbolDispose2 = Symbol.dispose ?? Symbol.for("dispose");
var ComponentExit = class extends Error {
  constructor(code) {
    super(`Component exited ${code === 0 ? "successfully" : "with error"}`);
    this.exitError = true;
    this.code = code;
  }
};
var exit = {
  exit(status) {
    throw new ComponentExit(status.tag === "err" ? 1 : 0);
  },
  exitWithCode(code) {
    throw new ComponentExit(code);
  }
};
function _setStdin(handler) {
  stdinStream.handler = handler;
}
function _setStderr(handler) {
  stderrStream.handler = handler;
}
function _setStdout(handler) {
  stdoutStream.handler = handler;
}
var stdinStream = new InputStream3({
  blockingRead(_len) {
  },
  subscribe() {
  },
  [symbolDispose2]() {
  }
});
var textDecoder = new TextDecoder();
var stdoutStream = new OutputStream3({
  write(contents) {
    if (contents[contents.length - 1] == 10) {
      contents = contents.subarray(0, contents.length - 1);
    }
    console.log(textDecoder.decode(contents));
  },
  blockingFlush() {
  },
  [symbolDispose2]() {
  }
});
var stderrStream = new OutputStream3({
  write(contents) {
    if (contents[contents.length - 1] == 10) {
      contents = contents.subarray(0, contents.length - 1);
    }
    console.error(textDecoder.decode(contents));
  },
  blockingFlush() {
  },
  [symbolDispose2]() {
  }
});
var stdin = {
  InputStream: InputStream3,
  getStdin() {
    return stdinStream;
  }
};
var stdout = {
  OutputStream: OutputStream3,
  getStdout() {
    return stdoutStream;
  }
};
var stderr = {
  OutputStream: OutputStream3,
  getStderr() {
    return stderrStream;
  }
};
var TerminalInput = class {
};
var TerminalOutput = class {
};
var terminalStdoutInstance = new TerminalOutput();
var terminalStderrInstance = new TerminalOutput();
var terminalStdinInstance = new TerminalInput();
var terminalInput = {
  TerminalInput
};
var terminalOutput = {
  TerminalOutput
};
var terminalStderr = {
  TerminalOutput,
  getTerminalStderr() {
    return terminalStderrInstance;
  }
};
var terminalStdin = {
  TerminalInput,
  getTerminalStdin() {
    return terminalStdinInstance;
  }
};
var terminalStdout = {
  TerminalOutput,
  getTerminalStdout() {
    return terminalStdoutInstance;
  }
};

// node_modules/@bytecodealliance/preview2-shim/lib/common/instantiation.js
var WASIShim = class {
  /** Object that confirms to the shim interface for `wasi:cli` */
  #cli;
  /** Object that confirms to the shim interface for `wasi:filesystem` */
  #filesystem;
  /** Object that confirms to the shim interface for `wasi:io` */
  #io;
  /** Object that confirms to the shim interface for `wasi:random` */
  #random;
  /** Object that confirms to the shim interface for `wasi:clocks` */
  #clocks;
  /** Object that confirms to the shim interface for `wasi:sockets` */
  #sockets;
  /** Object that confirms to the shim interface for `wasi:http` */
  #http;
  constructor(shims) {
    this.#cli = shims?.cli ?? cli_exports;
    this.#filesystem = shims?.filesystem ?? filesystem_exports;
    this.#io = shims?.io ?? io_exports;
    this.#random = shims?.random ?? random_exports;
    this.#clocks = shims?.clocks ?? clocks_exports;
    this.#sockets = shims?.sockets ?? sockets_exports;
    this.#http = shims?.http ?? http_exports;
  }
  /**
   * Generate an import object for the shim that can be used with
   * functions like `instantiate` that are exposed from a transpiled
   * WebAssembly component.
   *
   * @param {GetImportObjectArgs} [opts] - options for import object generation
   * @returns {WASIImportObject}
   *
   * @typedef {{
   *   asVersion?: number,
   * }} GetImportObjectArgs
   */
  getImportObject(opts) {
    const versionSuffix = opts?.asVersion ? `@${opts.asVersion}` : "";
    const obj = {};
    obj[`wasi:cli/environment${versionSuffix}`] = this.#cli.environment;
    obj[`wasi:cli/exit${versionSuffix}`] = this.#cli.exit;
    obj[`wasi:cli/stderr${versionSuffix}`] = this.#cli.stderr;
    obj[`wasi:cli/stdin${versionSuffix}`] = this.#cli.stdin;
    obj[`wasi:cli/stdout${versionSuffix}`] = this.#cli.stdout;
    obj[`wasi:cli/terminal-input${versionSuffix}`] = this.#cli.terminalInput;
    obj[`wasi:cli/terminal-output${versionSuffix}`] = this.#cli.terminalOutput;
    obj[`wasi:cli/terminal-stderr${versionSuffix}`] = this.#cli.terminalStderr;
    obj[`wasi:cli/terminal-stdin${versionSuffix}`] = this.#cli.terminalStdin;
    obj[`wasi:cli/terminal-stdout${versionSuffix}`] = this.#cli.terminalStdout;
    obj[`wasi:sockets/instance-network${versionSuffix}`] = this.#sockets.instanceNetwork;
    obj[`wasi:sockets/ip-name-lookup${versionSuffix}`] = this.#sockets.ipNameLookup;
    obj[`wasi:sockets/network${versionSuffix}`] = this.#sockets.network;
    obj[`wasi:sockets/tcp${versionSuffix}`] = this.#sockets.tcp;
    obj[`wasi:sockets/tcp-create-socket${versionSuffix}`] = this.#sockets.tcpCreateSocket;
    obj[`wasi:sockets/udp${versionSuffix}`] = this.#sockets.udp;
    obj[`wasi:sockets/udp-create-socket${versionSuffix}`] = this.#sockets.udpCreateSocket;
    obj[`wasi:filesystem/preopens${versionSuffix}`] = this.#filesystem.preopens;
    obj[`wasi:filesystem/types${versionSuffix}`] = this.#filesystem.types;
    obj[`wasi:io/error${versionSuffix}`] = this.#io.error;
    obj[`wasi:io/poll${versionSuffix}`] = this.#io.poll;
    obj[`wasi:io/streams${versionSuffix}`] = this.#io.streams;
    obj[`wasi:random/random${versionSuffix}`] = this.#random.random;
    obj[`wasi:random/insecure${versionSuffix}`] = this.#random.insecure;
    obj[`wasi:random/insecure-seed${versionSuffix}`] = this.#random.insecureSeed;
    obj[`wasi:clocks/monotonic-clock${versionSuffix}`] = this.#clocks.monotonicClock;
    obj[`wasi:clocks/wall-clock${versionSuffix}`] = this.#clocks.wallClock;
    obj[`wasi:http/types${versionSuffix}`] = this.#http.types;
    obj[`wasi:http/outgoing-handler${versionSuffix}`] = this.#http.outgoingHandler;
    return obj;
  }
};

// wasi-0.1-module-contents:src/js.wasm.core.wasm
var js_wasm_core_default = "./js.wasm.core-ZQTW6R64.wasm";

// wasi-0.1-module-contents:src/js.wasm.core2.wasm
var js_wasm_core2_default = "./js.wasm.core2-3I3OBBNV.wasm";

// wasi-0.1-module-contents:src/js.wasm.core3.wasm
var js_wasm_core3_default = "./js.wasm.core3-PDZ4SARS.wasm";

// wasi-0.1-module-contents:src/js.wasm.core4.wasm
var js_wasm_core4_default = "./js.wasm.core4-GP6GTIBP.wasm";

// wasi-0.1-module-contents:src/js.wasm.js
function instantiate(getCoreModule, imports, instantiateCore = WebAssembly.instantiate) {
  let dv = new DataView(new ArrayBuffer());
  const dataView = (mem) => dv.buffer === mem.buffer ? dv : dv = new DataView(mem.buffer);
  const toUint64 = (val) => BigInt.asUintN(64, BigInt(val));
  function toUint32(val) {
    return val >>> 0;
  }
  const utf8Decoder = new TextDecoder();
  const utf8Encoder = new TextEncoder();
  let utf8EncodedLen = 0;
  function utf8Encode(s, realloc, memory) {
    if (typeof s !== "string") throw new TypeError("expected a string");
    if (s.length === 0) {
      utf8EncodedLen = 0;
      return 1;
    }
    let buf = utf8Encoder.encode(s);
    let ptr = realloc(0, 0, 1, buf.length);
    new Uint8Array(memory.buffer).set(buf, ptr);
    utf8EncodedLen = buf.length;
    return ptr;
  }
  const T_FLAG = 1 << 30;
  function rscTableCreateOwn(table, rep) {
    const free2 = table[0] & ~T_FLAG;
    if (free2 === 0) {
      table.push(0);
      table.push(rep | T_FLAG);
      return (table.length >> 1) - 1;
    }
    table[0] = table[free2 << 1];
    table[free2 << 1] = 0;
    table[(free2 << 1) + 1] = rep | T_FLAG;
    return free2;
  }
  function rscTableRemove(table, handle) {
    const scope = table[handle << 1];
    const val = table[(handle << 1) + 1];
    const own = (val & T_FLAG) !== 0;
    const rep = val & ~T_FLAG;
    if (val === 0 || (scope & T_FLAG) !== 0) throw new TypeError("Invalid handle");
    table[handle << 1] = table[0] | T_FLAG;
    table[0] = handle | T_FLAG;
    return { rep, scope, own };
  }
  let curResourceBorrows = [];
  let NEXT_TASK_ID = 0n;
  function startCurrentTask(componentIdx, isAsync, entryFnName) {
    _debugLog("[startCurrentTask()] args", { componentIdx, isAsync });
    if (componentIdx === void 0 || componentIdx === null) {
      throw new Error("missing/invalid component instance index while starting task");
    }
    const tasks = ASYNC_TASKS_BY_COMPONENT_IDX.get(componentIdx);
    const nextId = ++NEXT_TASK_ID;
    const newTask = new AsyncTask({ id: nextId, componentIdx, isAsync, entryFnName });
    const newTaskMeta = { id: nextId, componentIdx, task: newTask };
    ASYNC_CURRENT_TASK_IDS.push(nextId);
    ASYNC_CURRENT_COMPONENT_IDXS.push(componentIdx);
    if (!tasks) {
      ASYNC_TASKS_BY_COMPONENT_IDX.set(componentIdx, [newTaskMeta]);
      return nextId;
    } else {
      tasks.push(newTaskMeta);
    }
    return nextId;
  }
  function endCurrentTask(componentIdx, taskId) {
    _debugLog("[endCurrentTask()] args", { componentIdx });
    componentIdx ??= ASYNC_CURRENT_COMPONENT_IDXS.at(-1);
    taskId ??= ASYNC_CURRENT_TASK_IDS.at(-1);
    if (componentIdx === void 0 || componentIdx === null) {
      throw new Error("missing/invalid component instance index while ending current task");
    }
    const tasks = ASYNC_TASKS_BY_COMPONENT_IDX.get(componentIdx);
    if (!tasks || !Array.isArray(tasks)) {
      throw new Error("missing/invalid tasks for component instance while ending task");
    }
    if (tasks.length == 0) {
      throw new Error("no current task(s) for component instance while ending task");
    }
    if (taskId) {
      const last = tasks[tasks.length - 1];
      if (last.id !== taskId) {
        throw new Error("current task does not match expected task ID");
      }
    }
    ASYNC_CURRENT_TASK_IDS.pop();
    ASYNC_CURRENT_COMPONENT_IDXS.pop();
    return tasks.pop();
  }
  const ASYNC_TASKS_BY_COMPONENT_IDX = /* @__PURE__ */ new Map();
  const ASYNC_CURRENT_TASK_IDS = [];
  const ASYNC_CURRENT_COMPONENT_IDXS = [];
  class AsyncTask {
    static State = {
      INITIAL: "initial",
      CANCELLED: "cancelled",
      CANCEL_PENDING: "cancel-pending",
      CANCEL_DELIVERED: "cancel-delivered",
      RESOLVED: "resolved"
    };
    static BlockResult = {
      CANCELLED: "block.cancelled",
      NOT_CANCELLED: "block.not-cancelled"
    };
    #id;
    #componentIdx;
    #state;
    #isAsync;
    #onResolve = null;
    #returnedResults = null;
    #entryFnName = null;
    cancelled = false;
    requested = false;
    alwaysTaskReturn = false;
    returnCalls = 0;
    storage = [0, 0];
    borrowedHandles = {};
    awaitableResume = null;
    awaitableCancel = null;
    constructor(opts) {
      if (opts?.id === void 0) {
        throw new TypeError("missing task ID during task creation");
      }
      this.#id = opts.id;
      if (opts?.componentIdx === void 0) {
        throw new TypeError("missing component id during task creation");
      }
      this.#componentIdx = opts.componentIdx;
      this.#state = AsyncTask.State.INITIAL;
      this.#isAsync = opts?.isAsync ?? false;
      this.#entryFnName = opts.entryFnName;
      this.#onResolve = (results) => {
        this.#returnedResults = results;
      };
    }
    taskState() {
      return this.#state.slice();
    }
    id() {
      return this.#id;
    }
    componentIdx() {
      return this.#componentIdx;
    }
    isAsync() {
      return this.#isAsync;
    }
    getEntryFnName() {
      return this.#entryFnName;
    }
    takeResults() {
      const results = this.#returnedResults;
      this.#returnedResults = null;
      return results;
    }
    mayEnter(task) {
      const cstate = getOrCreateAsyncState(this.#componentIdx);
      if (!cstate.backpressure) {
        _debugLog("[AsyncTask#mayEnter()] disallowed due to backpressure", { taskID: this.#id });
        return false;
      }
      if (!cstate.callingSyncImport()) {
        _debugLog("[AsyncTask#mayEnter()] disallowed due to sync import call", { taskID: this.#id });
        return false;
      }
      const callingSyncExportWithSyncPending = cstate.callingSyncExport && !task.isAsync;
      if (!callingSyncExportWithSyncPending) {
        _debugLog("[AsyncTask#mayEnter()] disallowed due to sync export w/ sync pending", { taskID: this.#id });
        return false;
      }
      return true;
    }
    async enter() {
      _debugLog("[AsyncTask#enter()] args", { taskID: this.#id });
      const cstate = getOrCreateAsyncState(this.#componentIdx);
      let mayNotEnter = !this.mayEnter(this);
      const componentHasPendingTasks = cstate.pendingTasks > 0;
      if (mayNotEnter || componentHasPendingTasks) {
        throw new Error("in enter()");
        cstate.pendingTasks.set(this.#id, new Awaitable(new Promise()));
        const blockResult = await this.onBlock(awaitable);
        if (blockResult) {
          const pendingTask = cstate.pendingTasks.get(this.#id);
          if (!pendingTask) {
            throw new Error("pending task [" + this.#id + "] not found for component instance");
          }
          cstate.pendingTasks.remove(this.#id);
          this.#onResolve([]);
          return false;
        }
        mayNotEnter = !this.mayEnter(this);
        if (!mayNotEnter || !cstate.startPendingTask) {
          throw new Error("invalid component entrance/pending task resolution");
        }
        cstate.startPendingTask = false;
      }
      if (!this.isAsync) {
        cstate.callingSyncExport = true;
      }
      return true;
    }
    async waitForEvent(opts) {
      const { waitableSetRep, isAsync } = opts;
      _debugLog("[AsyncTask#waitForEvent()] args", { taskID: this.#id, waitableSetRep, isAsync });
      if (this.#isAsync !== isAsync) {
        throw new Error("async waitForEvent called on non-async task");
      }
      if (this.status === AsyncTask.State.CANCEL_PENDING) {
        this.#state = AsyncTask.State.CANCEL_DELIVERED;
        return {
          code: ASYNC_EVENT_CODE.TASK_CANCELLED
        };
      }
      const state = getOrCreateAsyncState(this.#componentIdx);
      const waitableSet = state.waitableSets.get(waitableSetRep);
      if (!waitableSet) {
        throw new Error("missing/invalid waitable set");
      }
      waitableSet.numWaiting += 1;
      let event = null;
      while (event == null) {
        const awaitable2 = new Awaitable(waitableSet.getPendingEvent());
        const waited = await this.blockOn({ awaitable: awaitable2, isAsync, isCancellable: true });
        if (waited) {
          if (this.#state !== AsyncTask.State.INITIAL) {
            throw new Error("task should be in initial state found [" + this.#state + "]");
          }
          this.#state = AsyncTask.State.CANCELLED;
          return {
            code: ASYNC_EVENT_CODE.TASK_CANCELLED
          };
        }
        event = waitableSet.poll();
      }
      waitableSet.numWaiting -= 1;
      return event;
    }
    waitForEventSync(opts) {
      throw new Error("AsyncTask#yieldSync() not implemented");
    }
    async pollForEvent(opts) {
      const { waitableSetRep, isAsync } = opts;
      _debugLog("[AsyncTask#pollForEvent()] args", { taskID: this.#id, waitableSetRep, isAsync });
      if (this.#isAsync !== isAsync) {
        throw new Error("async pollForEvent called on non-async task");
      }
      throw new Error("AsyncTask#pollForEvent() not implemented");
    }
    pollForEventSync(opts) {
      throw new Error("AsyncTask#yieldSync() not implemented");
    }
    async blockOn(opts) {
      const { awaitable: awaitable2, isCancellable, forCallback } = opts;
      _debugLog("[AsyncTask#blockOn()] args", { taskID: this.#id, awaitable: awaitable2, isCancellable, forCallback });
      if (awaitable2.resolved() && !ASYNC_DETERMINISM && _coinFlip()) {
        return AsyncTask.BlockResult.NOT_CANCELLED;
      }
      const cstate = getOrCreateAsyncState(this.#componentIdx);
      if (forCallback) {
        cstate.exclusiveRelease();
      }
      let cancelled = await this.onBlock(awaitable2);
      if (cancelled === AsyncTask.BlockResult.CANCELLED && !isCancellable) {
        const secondCancel = await this.onBlock(awaitable2);
        if (secondCancel !== AsyncTask.BlockResult.NOT_CANCELLED) {
          throw new Error("uncancellable task was canceled despite second onBlock()");
        }
      }
      if (forCallback) {
        const acquired = new Awaitable(cstate.exclusiveLock());
        cancelled = await this.onBlock(acquired);
        if (cancelled === AsyncTask.BlockResult.CANCELLED) {
          const secondCancel = await this.onBlock(acquired);
          if (secondCancel !== AsyncTask.BlockResult.NOT_CANCELLED) {
            throw new Error("uncancellable callback task was canceled despite second onBlock()");
          }
        }
      }
      if (cancelled === AsyncTask.BlockResult.CANCELLED) {
        if (this.#state !== AsyncTask.State.INITIAL) {
          throw new Error("cancelled task is not at initial state");
        }
        if (isCancellable) {
          this.#state = AsyncTask.State.CANCELLED;
          return AsyncTask.BlockResult.CANCELLED;
        } else {
          this.#state = AsyncTask.State.CANCEL_PENDING;
          return AsyncTask.BlockResult.NOT_CANCELLED;
        }
      }
      return AsyncTask.BlockResult.NOT_CANCELLED;
    }
    async onBlock(awaitable2) {
      _debugLog("[AsyncTask#onBlock()] args", { taskID: this.#id, awaitable: awaitable2 });
      if (!(awaitable2 instanceof Awaitable)) {
        throw new Error("invalid awaitable during onBlock");
      }
      const { promise: promise2, resolve: resolve2, reject: reject2 } = Promise.withResolvers();
      this.awaitableResume = () => {
        _debugLog("[AsyncTask] resuming after onBlock", { taskID: this.#id });
        resolve2();
      };
      this.awaitableCancel = (err) => {
        _debugLog("[AsyncTask] rejecting after onBlock", { taskID: this.#id, err });
        reject2(err);
      };
      const state = getOrCreateAsyncState(this.#componentIdx);
      state.parkTaskOnAwaitable({ awaitable: awaitable2, task: this });
      try {
        await promise2;
        return AsyncTask.BlockResult.NOT_CANCELLED;
      } catch (err) {
        return AsyncTask.BlockResult.CANCELLED;
      }
    }
    // NOTE: this should likely be moved to a SubTask class
    async asyncOnBlock(awaitable2) {
      _debugLog("[AsyncTask#asyncOnBlock()] args", { taskID: this.#id, awaitable: awaitable2 });
      if (!(awaitable2 instanceof Awaitable)) {
        throw new Error("invalid awaitable during onBlock");
      }
      throw new Error("AsyncTask#asyncOnBlock() not yet implemented");
    }
    async yield(opts) {
      const { isCancellable, forCallback } = opts;
      _debugLog("[AsyncTask#yield()] args", { taskID: this.#id, isCancellable, forCallback });
      if (isCancellable && this.status === AsyncTask.State.CANCEL_PENDING) {
        this.#state = AsyncTask.State.CANCELLED;
        return {
          code: ASYNC_EVENT_CODE.TASK_CANCELLED,
          payload: [0, 0]
        };
      }
      const blockResult = await this.blockOn({
        awaitable: new Awaitable(new Promise((resolve2) => setTimeout(resolve2, 0))),
        isCancellable,
        forCallback
      });
      if (blockResult === AsyncTask.BlockResult.CANCELLED) {
        if (this.#state !== AsyncTask.State.INITIAL) {
          throw new Error("task should be in initial state found [" + this.#state + "]");
        }
        this.#state = AsyncTask.State.CANCELLED;
        return {
          code: ASYNC_EVENT_CODE.TASK_CANCELLED,
          payload: [0, 0]
        };
      }
      return {
        code: ASYNC_EVENT_CODE.NONE,
        payload: [0, 0]
      };
    }
    yieldSync(opts) {
      throw new Error("AsyncTask#yieldSync() not implemented");
    }
    cancel() {
      _debugLog("[AsyncTask#cancel()] args", {});
      if (!this.taskState() !== AsyncTask.State.CANCEL_DELIVERED) {
        throw new Error("invalid task state for cancellation");
      }
      if (this.borrowedHandles.length > 0) {
        throw new Error("task still has borrow handles");
      }
      this.#onResolve([]);
      this.#state = AsyncTask.State.RESOLVED;
    }
    resolve(result) {
      if (this.#state === AsyncTask.State.RESOLVED) {
        throw new Error("task is already resolved");
      }
      if (this.borrowedHandles.length > 0) {
        throw new Error("task still has borrow handles");
      }
      this.#onResolve(result);
      this.#state = AsyncTask.State.RESOLVED;
    }
    exit() {
      if (this.#state !== AsyncTask.State.RESOLVED) {
        throw new Error("task exited without resolution");
      }
      if (this.borrowedHandles > 0) {
        throw new Error("task exited without clearing borrowed handles");
      }
      const state = getOrCreateAsyncState(this.#componentIdx);
      if (!state) {
        throw new Error("missing async state for component [" + this.#componentIdx + "]");
      }
      if (!this.#isAsync && !state.inSyncExportCall) {
        throw new Error("sync task must be run from components known to be in a sync export call");
      }
      state.inSyncExportCall = false;
      this.startPendingTask();
    }
    startPendingTask(opts) {
    }
  }
  function unpackCallbackResult(result) {
    _debugLog("[unpackCallbackResult()] args", { result });
    if (!_typeCheckValidI32(result)) {
      throw new Error("invalid callback return value [" + result + "], not a valid i32");
    }
    const eventCode = result & 15;
    if (eventCode < 0 || eventCode > 3) {
      throw new Error("invalid async return value [" + eventCode + "], outside callback code range");
    }
    if (result < 0 || result >= 2 ** 32) {
      throw new Error("invalid callback result");
    }
    const waitableSetIdx = result >> 4;
    return [eventCode, waitableSetIdx];
  }
  const ASYNC_STATE = /* @__PURE__ */ new Map();
  function getOrCreateAsyncState(componentIdx, init) {
    if (!ASYNC_STATE.has(componentIdx)) {
      ASYNC_STATE.set(componentIdx, new ComponentAsyncState());
    }
    return ASYNC_STATE.get(componentIdx);
  }
  class ComponentAsyncState {
    #callingAsyncImport = false;
    #syncImportWait = Promise.withResolvers();
    #lock = null;
    mayLeave = false;
    waitableSets = new RepTable();
    waitables = new RepTable();
    #parkedTasks = /* @__PURE__ */ new Map();
    callingSyncImport(val) {
      if (val === void 0) {
        return this.#callingAsyncImport;
      }
      if (typeof val !== "boolean") {
        throw new TypeError("invalid setting for async import");
      }
      const prev = this.#callingAsyncImport;
      this.#callingAsyncImport = val;
      if (prev === true && this.#callingAsyncImport === false) {
        this.#notifySyncImportEnd();
      }
    }
    #notifySyncImportEnd() {
      const existing = this.#syncImportWait;
      this.#syncImportWait = Promise.withResolvers();
      existing.resolve();
    }
    async waitForSyncImportCallEnd() {
      await this.#syncImportWait.promise;
    }
    parkTaskOnAwaitable(args) {
      if (!args.awaitable) {
        throw new TypeError("missing awaitable when trying to park");
      }
      if (!args.task) {
        throw new TypeError("missing task when trying to park");
      }
      const { awaitable: awaitable2, task } = args;
      let taskList = this.#parkedTasks.get(awaitable2.id());
      if (!taskList) {
        taskList = [];
        this.#parkedTasks.set(awaitable2.id(), taskList);
      }
      taskList.push(task);
      this.wakeNextTaskForAwaitable(awaitable2);
    }
    wakeNextTaskForAwaitable(awaitable2) {
      if (!awaitable2) {
        throw new TypeError("missing awaitable when waking next task");
      }
      const awaitableID = awaitable2.id();
      const taskList = this.#parkedTasks.get(awaitableID);
      if (!taskList || taskList.length === 0) {
        _debugLog("[ComponentAsyncState] no tasks waiting for awaitable", { awaitableID: awaitable2.id() });
        return;
      }
      let task = taskList.shift();
      if (!task) {
        throw new Error("no task in parked list despite previous check");
      }
      if (!task.awaitableResume) {
        throw new Error("task ready due to awaitable is missing resume", { taskID: task.id(), awaitableID });
      }
      task.awaitableResume();
    }
    async exclusiveLock() {
      if (this.#lock === null) {
        this.#lock = { ticket: 0n };
      }
      const ticket = ++this.#lock.ticket;
      _debugLog("[ComponentAsyncState#exclusiveLock()] locking", {
        currentTicket: ticket - 1n,
        ticket
      });
      let finishedTicket;
      while (this.#lock.promise) {
        finishedTicket = await this.#lock.promise;
        if (finishedTicket === ticket - 1n) {
          break;
        }
      }
      const { promise: promise2, resolve: resolve2 } = Promise.withResolvers();
      this.#lock = {
        ticket,
        promise: promise2,
        resolve: resolve2
      };
      return this.#lock.promise;
    }
    exclusiveRelease() {
      _debugLog("[ComponentAsyncState#exclusiveRelease()] releasing", {
        currentTicket: this.#lock === null ? "none" : this.#lock.ticket
      });
      if (this.#lock === null) {
        return;
      }
      const existingLock = this.#lock;
      this.#lock = null;
      existingLock.resolve(existingLock.ticket);
    }
    isExclusivelyLocked() {
      return this.#lock !== null;
    }
  }
  if (!Promise.withResolvers) {
    Promise.withResolvers = () => {
      let resolve2;
      let reject2;
      const promise2 = new Promise((res, rej) => {
        resolve2 = res;
        reject2 = rej;
      });
      return { promise: promise2, resolve: resolve2, reject: reject2 };
    };
  }
  const _debugLog = (...args) => {
    if (!globalThis?.process?.env?.JCO_DEBUG) {
      return;
    }
    console.debug(...args);
  };
  const ASYNC_DETERMINISM = "random";
  const _coinFlip = () => {
    return Math.random() > 0.5;
  };
  const I32_MAX = 2147483647;
  const I32_MIN = -2147483648;
  const _typeCheckValidI32 = (n) => typeof n === "number" && n >= I32_MIN && n <= I32_MAX;
  const fetchCompile = (url) => fetch(url).then(WebAssembly.compileStreaming);
  const symbolCabiDispose = Symbol.for("cabiDispose");
  const symbolRscHandle = Symbol("handle");
  const symbolRscRep = Symbol.for("cabiRep");
  const symbolDispose3 = Symbol.dispose || Symbol.for("dispose");
  const handleTables = [];
  class ComponentError extends Error {
    constructor(value) {
      const enumerable = typeof value !== "string";
      super(enumerable ? `${String(value)} (see error.payload)` : value);
      Object.defineProperty(this, "payload", { value, enumerable });
    }
  }
  function getErrorPayload(e) {
    if (e && hasOwnProperty.call(e, "payload")) return e.payload;
    if (e instanceof Error) throw e;
    return e;
  }
  class RepTable {
    #data = [0, null];
    insert(val) {
      _debugLog("[RepTable#insert()] args", { val });
      const freeIdx = this.#data[0];
      if (freeIdx === 0) {
        this.#data.push(val);
        this.#data.push(null);
        return (this.#data.length >> 1) - 1;
      }
      this.#data[0] = this.#data[freeIdx];
      const newFreeIdx = freeIdx << 1;
      this.#data[newFreeIdx] = val;
      this.#data[newFreeIdx + 1] = null;
      return free;
    }
    get(rep) {
      _debugLog("[RepTable#insert()] args", { rep });
      const baseIdx = idx << 1;
      const val = this.#data[baseIdx];
      return val;
    }
    contains(rep) {
      _debugLog("[RepTable#insert()] args", { rep });
      const baseIdx = idx << 1;
      return !!this.#data[baseIdx];
    }
    remove(rep) {
      _debugLog("[RepTable#insert()] args", { idx });
      if (this.#data.length === 2) {
        throw new Error("invalid");
      }
      const baseIdx = idx << 1;
      const val = this.#data[baseIdx];
      if (val === 0) {
        throw new Error("invalid resource rep (cannot be 0)");
      }
      this.#data[baseIdx] = this.#data[0];
      this.#data[0] = idx;
      return val;
    }
    clear() {
      this.#data = [0, null];
    }
  }
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  if (!getCoreModule) getCoreModule = (name) => fetchCompile(new URL(`./${name}`, import.meta.url));
  const module0 = getCoreModule("src/js.wasm.core.wasm");
  const module1 = getCoreModule("src/js.wasm.core2.wasm");
  const module2 = getCoreModule("src/js.wasm.core3.wasm");
  const module3 = getCoreModule("src/js.wasm.core4.wasm");
  const { getArguments, getEnvironment } = imports["wasi:cli/environment"];
  const { exit: exit2 } = imports["wasi:cli/exit"];
  const { getStderr } = imports["wasi:cli/stderr"];
  const { getStdin } = imports["wasi:cli/stdin"];
  const { getStdout } = imports["wasi:cli/stdout"];
  const { TerminalInput: TerminalInput2 } = imports["wasi:cli/terminal-input"];
  const { TerminalOutput: TerminalOutput2 } = imports["wasi:cli/terminal-output"];
  const { getTerminalStderr } = imports["wasi:cli/terminal-stderr"];
  const { getTerminalStdin } = imports["wasi:cli/terminal-stdin"];
  const { getTerminalStdout } = imports["wasi:cli/terminal-stdout"];
  const { now, resolution } = imports["wasi:clocks/monotonic-clock"];
  const { now: now$1, resolution: resolution$1 } = imports["wasi:clocks/wall-clock"];
  const { getDirectories } = imports["wasi:filesystem/preopens"];
  const { Descriptor: Descriptor2, DirectoryEntryStream: DirectoryEntryStream2, filesystemErrorCode } = imports["wasi:filesystem/types"];
  const { Error: Error$1 } = imports["wasi:io/error"];
  const { InputStream: InputStream4, OutputStream: OutputStream4 } = imports["wasi:io/streams"];
  const { getRandomBytes } = imports["wasi:random/random"];
  let gen = (function* init() {
    let exports0;
    let exports1;
    function trampoline0() {
      _debugLog('[iface="wasi:clocks/monotonic-clock@0.2.6", function="resolution"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "resolution");
      const ret = resolution();
      _debugLog('[iface="wasi:clocks/monotonic-clock@0.2.6", function="resolution"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      _debugLog('[iface="wasi:clocks/monotonic-clock@0.2.6", function="resolution"][Instruction::Return]', {
        funcName: "resolution",
        paramCount: 1,
        postReturn: false
      });
      return toUint64(ret);
    }
    function trampoline1() {
      _debugLog('[iface="wasi:clocks/monotonic-clock@0.2.6", function="now"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "now");
      const ret = now();
      _debugLog('[iface="wasi:clocks/monotonic-clock@0.2.6", function="now"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      _debugLog('[iface="wasi:clocks/monotonic-clock@0.2.6", function="now"][Instruction::Return]', {
        funcName: "now",
        paramCount: 1,
        postReturn: false
      });
      return toUint64(ret);
    }
    const handleTable2 = [T_FLAG, 0];
    const captureTable2 = /* @__PURE__ */ new Map();
    let captureCnt2 = 0;
    handleTables[2] = handleTable2;
    function trampoline7() {
      _debugLog('[iface="wasi:cli/stderr@0.2.6", function="get-stderr"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "get-stderr");
      const ret = getStderr();
      _debugLog('[iface="wasi:cli/stderr@0.2.6", function="get-stderr"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      if (!(ret instanceof OutputStream4)) {
        throw new TypeError('Resource error: Not a valid "OutputStream" resource.');
      }
      var handle0 = ret[symbolRscHandle];
      if (!handle0) {
        const rep = ret[symbolRscRep] || ++captureCnt2;
        captureTable2.set(rep, ret);
        handle0 = rscTableCreateOwn(handleTable2, rep);
      }
      _debugLog('[iface="wasi:cli/stderr@0.2.6", function="get-stderr"][Instruction::Return]', {
        funcName: "get-stderr",
        paramCount: 1,
        postReturn: false
      });
      return handle0;
    }
    const handleTable1 = [T_FLAG, 0];
    const captureTable1 = /* @__PURE__ */ new Map();
    let captureCnt1 = 0;
    handleTables[1] = handleTable1;
    function trampoline10() {
      _debugLog('[iface="wasi:cli/stdin@0.2.6", function="get-stdin"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "get-stdin");
      const ret = getStdin();
      _debugLog('[iface="wasi:cli/stdin@0.2.6", function="get-stdin"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      if (!(ret instanceof InputStream4)) {
        throw new TypeError('Resource error: Not a valid "InputStream" resource.');
      }
      var handle0 = ret[symbolRscHandle];
      if (!handle0) {
        const rep = ret[symbolRscRep] || ++captureCnt1;
        captureTable1.set(rep, ret);
        handle0 = rscTableCreateOwn(handleTable1, rep);
      }
      _debugLog('[iface="wasi:cli/stdin@0.2.6", function="get-stdin"][Instruction::Return]', {
        funcName: "get-stdin",
        paramCount: 1,
        postReturn: false
      });
      return handle0;
    }
    function trampoline11() {
      _debugLog('[iface="wasi:cli/stdout@0.2.6", function="get-stdout"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "get-stdout");
      const ret = getStdout();
      _debugLog('[iface="wasi:cli/stdout@0.2.6", function="get-stdout"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      if (!(ret instanceof OutputStream4)) {
        throw new TypeError('Resource error: Not a valid "OutputStream" resource.');
      }
      var handle0 = ret[symbolRscHandle];
      if (!handle0) {
        const rep = ret[symbolRscRep] || ++captureCnt2;
        captureTable2.set(rep, ret);
        handle0 = rscTableCreateOwn(handleTable2, rep);
      }
      _debugLog('[iface="wasi:cli/stdout@0.2.6", function="get-stdout"][Instruction::Return]', {
        funcName: "get-stdout",
        paramCount: 1,
        postReturn: false
      });
      return handle0;
    }
    function trampoline12(arg0) {
      let variant0;
      switch (arg0) {
        case 0: {
          variant0 = {
            tag: "ok",
            val: void 0
          };
          break;
        }
        case 1: {
          variant0 = {
            tag: "err",
            val: void 0
          };
          break;
        }
        default: {
          throw new TypeError("invalid variant discriminant for expected");
        }
      }
      _debugLog('[iface="wasi:cli/exit@0.2.6", function="exit"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "exit");
      exit2(variant0);
      _debugLog('[iface="wasi:cli/exit@0.2.6", function="exit"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      _debugLog('[iface="wasi:cli/exit@0.2.6", function="exit"][Instruction::Return]', {
        funcName: "exit",
        paramCount: 0,
        postReturn: false
      });
    }
    let exports2;
    let memory0;
    let realloc0;
    function trampoline13(arg0) {
      _debugLog('[iface="wasi:cli/environment@0.2.6", function="get-arguments"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "get-arguments");
      const ret = getArguments();
      _debugLog('[iface="wasi:cli/environment@0.2.6", function="get-arguments"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      var vec1 = ret;
      var len1 = vec1.length;
      var result1 = realloc0(0, 0, 4, len1 * 8);
      for (let i = 0; i < vec1.length; i++) {
        const e = vec1[i];
        const base = result1 + i * 8;
        var ptr0 = utf8Encode(e, realloc0, memory0);
        var len0 = utf8EncodedLen;
        dataView(memory0).setUint32(base + 4, len0, true);
        dataView(memory0).setUint32(base + 0, ptr0, true);
      }
      dataView(memory0).setUint32(arg0 + 4, len1, true);
      dataView(memory0).setUint32(arg0 + 0, result1, true);
      _debugLog('[iface="wasi:cli/environment@0.2.6", function="get-arguments"][Instruction::Return]', {
        funcName: "get-arguments",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline14(arg0) {
      _debugLog('[iface="wasi:cli/environment@0.2.6", function="get-environment"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "get-environment");
      const ret = getEnvironment();
      _debugLog('[iface="wasi:cli/environment@0.2.6", function="get-environment"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      var vec3 = ret;
      var len3 = vec3.length;
      var result3 = realloc0(0, 0, 4, len3 * 16);
      for (let i = 0; i < vec3.length; i++) {
        const e = vec3[i];
        const base = result3 + i * 16;
        var [tuple0_0, tuple0_1] = e;
        var ptr1 = utf8Encode(tuple0_0, realloc0, memory0);
        var len1 = utf8EncodedLen;
        dataView(memory0).setUint32(base + 4, len1, true);
        dataView(memory0).setUint32(base + 0, ptr1, true);
        var ptr2 = utf8Encode(tuple0_1, realloc0, memory0);
        var len2 = utf8EncodedLen;
        dataView(memory0).setUint32(base + 12, len2, true);
        dataView(memory0).setUint32(base + 8, ptr2, true);
      }
      dataView(memory0).setUint32(arg0 + 4, len3, true);
      dataView(memory0).setUint32(arg0 + 0, result3, true);
      _debugLog('[iface="wasi:cli/environment@0.2.6", function="get-environment"][Instruction::Return]', {
        funcName: "get-environment",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline15(arg0) {
      _debugLog('[iface="wasi:clocks/wall-clock@0.2.6", function="resolution"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "resolution");
      const ret = resolution$1();
      _debugLog('[iface="wasi:clocks/wall-clock@0.2.6", function="resolution"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      var { seconds: v0_0, nanoseconds: v0_1 } = ret;
      dataView(memory0).setBigInt64(arg0 + 0, toUint64(v0_0), true);
      dataView(memory0).setInt32(arg0 + 8, toUint32(v0_1), true);
      _debugLog('[iface="wasi:clocks/wall-clock@0.2.6", function="resolution"][Instruction::Return]', {
        funcName: "resolution",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline16(arg0) {
      _debugLog('[iface="wasi:clocks/wall-clock@0.2.6", function="now"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "now");
      const ret = now$1();
      _debugLog('[iface="wasi:clocks/wall-clock@0.2.6", function="now"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      var { seconds: v0_0, nanoseconds: v0_1 } = ret;
      dataView(memory0).setBigInt64(arg0 + 0, toUint64(v0_0), true);
      dataView(memory0).setInt32(arg0 + 8, toUint32(v0_1), true);
      _debugLog('[iface="wasi:clocks/wall-clock@0.2.6", function="now"][Instruction::Return]', {
        funcName: "now",
        paramCount: 0,
        postReturn: false
      });
    }
    const handleTable6 = [T_FLAG, 0];
    const captureTable6 = /* @__PURE__ */ new Map();
    let captureCnt6 = 0;
    handleTables[6] = handleTable6;
    function trampoline17(arg0, arg1) {
      var handle1 = arg0;
      var rep2 = handleTable6[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable6.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(Descriptor2.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.get-flags"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]descriptor.get-flags");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.getFlags() };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.get-flags"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant5 = ret;
      switch (variant5.tag) {
        case "ok": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg1 + 0, 0, true);
          let flags3 = 0;
          if (typeof e === "object" && e !== null) {
            flags3 = Boolean(e.read) << 0 | Boolean(e.write) << 1 | Boolean(e.fileIntegritySync) << 2 | Boolean(e.dataIntegritySync) << 3 | Boolean(e.requestedWriteSync) << 4 | Boolean(e.mutateDirectory) << 5;
          } else if (e !== null && e !== void 0) {
            throw new TypeError("only an object, undefined or null can be converted to flags");
          }
          dataView(memory0).setInt8(arg1 + 1, flags3, true);
          break;
        }
        case "err": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg1 + 0, 1, true);
          var val4 = e;
          let enum4;
          switch (val4) {
            case "access": {
              enum4 = 0;
              break;
            }
            case "would-block": {
              enum4 = 1;
              break;
            }
            case "already": {
              enum4 = 2;
              break;
            }
            case "bad-descriptor": {
              enum4 = 3;
              break;
            }
            case "busy": {
              enum4 = 4;
              break;
            }
            case "deadlock": {
              enum4 = 5;
              break;
            }
            case "quota": {
              enum4 = 6;
              break;
            }
            case "exist": {
              enum4 = 7;
              break;
            }
            case "file-too-large": {
              enum4 = 8;
              break;
            }
            case "illegal-byte-sequence": {
              enum4 = 9;
              break;
            }
            case "in-progress": {
              enum4 = 10;
              break;
            }
            case "interrupted": {
              enum4 = 11;
              break;
            }
            case "invalid": {
              enum4 = 12;
              break;
            }
            case "io": {
              enum4 = 13;
              break;
            }
            case "is-directory": {
              enum4 = 14;
              break;
            }
            case "loop": {
              enum4 = 15;
              break;
            }
            case "too-many-links": {
              enum4 = 16;
              break;
            }
            case "message-size": {
              enum4 = 17;
              break;
            }
            case "name-too-long": {
              enum4 = 18;
              break;
            }
            case "no-device": {
              enum4 = 19;
              break;
            }
            case "no-entry": {
              enum4 = 20;
              break;
            }
            case "no-lock": {
              enum4 = 21;
              break;
            }
            case "insufficient-memory": {
              enum4 = 22;
              break;
            }
            case "insufficient-space": {
              enum4 = 23;
              break;
            }
            case "not-directory": {
              enum4 = 24;
              break;
            }
            case "not-empty": {
              enum4 = 25;
              break;
            }
            case "not-recoverable": {
              enum4 = 26;
              break;
            }
            case "unsupported": {
              enum4 = 27;
              break;
            }
            case "no-tty": {
              enum4 = 28;
              break;
            }
            case "no-such-device": {
              enum4 = 29;
              break;
            }
            case "overflow": {
              enum4 = 30;
              break;
            }
            case "not-permitted": {
              enum4 = 31;
              break;
            }
            case "pipe": {
              enum4 = 32;
              break;
            }
            case "read-only": {
              enum4 = 33;
              break;
            }
            case "invalid-seek": {
              enum4 = 34;
              break;
            }
            case "text-file-busy": {
              enum4 = 35;
              break;
            }
            case "cross-device": {
              enum4 = 36;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val4}" is not one of the cases of error-code`);
            }
          }
          dataView(memory0).setInt8(arg1 + 1, enum4, true);
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.get-flags"][Instruction::Return]', {
        funcName: "[method]descriptor.get-flags",
        paramCount: 0,
        postReturn: false
      });
    }
    const handleTable0 = [T_FLAG, 0];
    const captureTable0 = /* @__PURE__ */ new Map();
    let captureCnt0 = 0;
    handleTables[0] = handleTable0;
    function trampoline18(arg0, arg1) {
      var handle1 = arg0;
      var rep2 = handleTable0[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable0.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(Error$1.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="filesystem-error-code"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "filesystem-error-code");
      const ret = filesystemErrorCode(rsc0);
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="filesystem-error-code"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant4 = ret;
      if (variant4 === null || variant4 === void 0) {
        dataView(memory0).setInt8(arg1 + 0, 0, true);
      } else {
        const e = variant4;
        dataView(memory0).setInt8(arg1 + 0, 1, true);
        var val3 = e;
        let enum3;
        switch (val3) {
          case "access": {
            enum3 = 0;
            break;
          }
          case "would-block": {
            enum3 = 1;
            break;
          }
          case "already": {
            enum3 = 2;
            break;
          }
          case "bad-descriptor": {
            enum3 = 3;
            break;
          }
          case "busy": {
            enum3 = 4;
            break;
          }
          case "deadlock": {
            enum3 = 5;
            break;
          }
          case "quota": {
            enum3 = 6;
            break;
          }
          case "exist": {
            enum3 = 7;
            break;
          }
          case "file-too-large": {
            enum3 = 8;
            break;
          }
          case "illegal-byte-sequence": {
            enum3 = 9;
            break;
          }
          case "in-progress": {
            enum3 = 10;
            break;
          }
          case "interrupted": {
            enum3 = 11;
            break;
          }
          case "invalid": {
            enum3 = 12;
            break;
          }
          case "io": {
            enum3 = 13;
            break;
          }
          case "is-directory": {
            enum3 = 14;
            break;
          }
          case "loop": {
            enum3 = 15;
            break;
          }
          case "too-many-links": {
            enum3 = 16;
            break;
          }
          case "message-size": {
            enum3 = 17;
            break;
          }
          case "name-too-long": {
            enum3 = 18;
            break;
          }
          case "no-device": {
            enum3 = 19;
            break;
          }
          case "no-entry": {
            enum3 = 20;
            break;
          }
          case "no-lock": {
            enum3 = 21;
            break;
          }
          case "insufficient-memory": {
            enum3 = 22;
            break;
          }
          case "insufficient-space": {
            enum3 = 23;
            break;
          }
          case "not-directory": {
            enum3 = 24;
            break;
          }
          case "not-empty": {
            enum3 = 25;
            break;
          }
          case "not-recoverable": {
            enum3 = 26;
            break;
          }
          case "unsupported": {
            enum3 = 27;
            break;
          }
          case "no-tty": {
            enum3 = 28;
            break;
          }
          case "no-such-device": {
            enum3 = 29;
            break;
          }
          case "overflow": {
            enum3 = 30;
            break;
          }
          case "not-permitted": {
            enum3 = 31;
            break;
          }
          case "pipe": {
            enum3 = 32;
            break;
          }
          case "read-only": {
            enum3 = 33;
            break;
          }
          case "invalid-seek": {
            enum3 = 34;
            break;
          }
          case "text-file-busy": {
            enum3 = 35;
            break;
          }
          case "cross-device": {
            enum3 = 36;
            break;
          }
          default: {
            if (e instanceof Error) {
              console.error(e);
            }
            throw new TypeError(`"${val3}" is not one of the cases of error-code`);
          }
        }
        dataView(memory0).setInt8(arg1 + 1, enum3, true);
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="filesystem-error-code"][Instruction::Return]', {
        funcName: "filesystem-error-code",
        paramCount: 0,
        postReturn: false
      });
    }
    const handleTable5 = [T_FLAG, 0];
    const captureTable5 = /* @__PURE__ */ new Map();
    let captureCnt5 = 0;
    handleTables[5] = handleTable5;
    function trampoline19(arg0, arg1) {
      var handle1 = arg0;
      var rep2 = handleTable6[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable6.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(Descriptor2.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.read-directory"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]descriptor.read-directory");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.readDirectory() };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.read-directory"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant5 = ret;
      switch (variant5.tag) {
        case "ok": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg1 + 0, 0, true);
          if (!(e instanceof DirectoryEntryStream2)) {
            throw new TypeError('Resource error: Not a valid "DirectoryEntryStream" resource.');
          }
          var handle3 = e[symbolRscHandle];
          if (!handle3) {
            const rep = e[symbolRscRep] || ++captureCnt5;
            captureTable5.set(rep, e);
            handle3 = rscTableCreateOwn(handleTable5, rep);
          }
          dataView(memory0).setInt32(arg1 + 4, handle3, true);
          break;
        }
        case "err": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg1 + 0, 1, true);
          var val4 = e;
          let enum4;
          switch (val4) {
            case "access": {
              enum4 = 0;
              break;
            }
            case "would-block": {
              enum4 = 1;
              break;
            }
            case "already": {
              enum4 = 2;
              break;
            }
            case "bad-descriptor": {
              enum4 = 3;
              break;
            }
            case "busy": {
              enum4 = 4;
              break;
            }
            case "deadlock": {
              enum4 = 5;
              break;
            }
            case "quota": {
              enum4 = 6;
              break;
            }
            case "exist": {
              enum4 = 7;
              break;
            }
            case "file-too-large": {
              enum4 = 8;
              break;
            }
            case "illegal-byte-sequence": {
              enum4 = 9;
              break;
            }
            case "in-progress": {
              enum4 = 10;
              break;
            }
            case "interrupted": {
              enum4 = 11;
              break;
            }
            case "invalid": {
              enum4 = 12;
              break;
            }
            case "io": {
              enum4 = 13;
              break;
            }
            case "is-directory": {
              enum4 = 14;
              break;
            }
            case "loop": {
              enum4 = 15;
              break;
            }
            case "too-many-links": {
              enum4 = 16;
              break;
            }
            case "message-size": {
              enum4 = 17;
              break;
            }
            case "name-too-long": {
              enum4 = 18;
              break;
            }
            case "no-device": {
              enum4 = 19;
              break;
            }
            case "no-entry": {
              enum4 = 20;
              break;
            }
            case "no-lock": {
              enum4 = 21;
              break;
            }
            case "insufficient-memory": {
              enum4 = 22;
              break;
            }
            case "insufficient-space": {
              enum4 = 23;
              break;
            }
            case "not-directory": {
              enum4 = 24;
              break;
            }
            case "not-empty": {
              enum4 = 25;
              break;
            }
            case "not-recoverable": {
              enum4 = 26;
              break;
            }
            case "unsupported": {
              enum4 = 27;
              break;
            }
            case "no-tty": {
              enum4 = 28;
              break;
            }
            case "no-such-device": {
              enum4 = 29;
              break;
            }
            case "overflow": {
              enum4 = 30;
              break;
            }
            case "not-permitted": {
              enum4 = 31;
              break;
            }
            case "pipe": {
              enum4 = 32;
              break;
            }
            case "read-only": {
              enum4 = 33;
              break;
            }
            case "invalid-seek": {
              enum4 = 34;
              break;
            }
            case "text-file-busy": {
              enum4 = 35;
              break;
            }
            case "cross-device": {
              enum4 = 36;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val4}" is not one of the cases of error-code`);
            }
          }
          dataView(memory0).setInt8(arg1 + 4, enum4, true);
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.read-directory"][Instruction::Return]', {
        funcName: "[method]descriptor.read-directory",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline20(arg0, arg1) {
      var handle1 = arg0;
      var rep2 = handleTable5[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable5.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(DirectoryEntryStream2.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]directory-entry-stream.read-directory-entry"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]directory-entry-stream.read-directory-entry");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.readDirectoryEntry() };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]directory-entry-stream.read-directory-entry"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant8 = ret;
      switch (variant8.tag) {
        case "ok": {
          const e = variant8.val;
          dataView(memory0).setInt8(arg1 + 0, 0, true);
          var variant6 = e;
          if (variant6 === null || variant6 === void 0) {
            dataView(memory0).setInt8(arg1 + 4, 0, true);
          } else {
            const e2 = variant6;
            dataView(memory0).setInt8(arg1 + 4, 1, true);
            var { type: v3_0, name: v3_1 } = e2;
            var val4 = v3_0;
            let enum4;
            switch (val4) {
              case "unknown": {
                enum4 = 0;
                break;
              }
              case "block-device": {
                enum4 = 1;
                break;
              }
              case "character-device": {
                enum4 = 2;
                break;
              }
              case "directory": {
                enum4 = 3;
                break;
              }
              case "fifo": {
                enum4 = 4;
                break;
              }
              case "symbolic-link": {
                enum4 = 5;
                break;
              }
              case "regular-file": {
                enum4 = 6;
                break;
              }
              case "socket": {
                enum4 = 7;
                break;
              }
              default: {
                if (v3_0 instanceof Error) {
                  console.error(v3_0);
                }
                throw new TypeError(`"${val4}" is not one of the cases of descriptor-type`);
              }
            }
            dataView(memory0).setInt8(arg1 + 8, enum4, true);
            var ptr5 = utf8Encode(v3_1, realloc0, memory0);
            var len5 = utf8EncodedLen;
            dataView(memory0).setUint32(arg1 + 16, len5, true);
            dataView(memory0).setUint32(arg1 + 12, ptr5, true);
          }
          break;
        }
        case "err": {
          const e = variant8.val;
          dataView(memory0).setInt8(arg1 + 0, 1, true);
          var val7 = e;
          let enum7;
          switch (val7) {
            case "access": {
              enum7 = 0;
              break;
            }
            case "would-block": {
              enum7 = 1;
              break;
            }
            case "already": {
              enum7 = 2;
              break;
            }
            case "bad-descriptor": {
              enum7 = 3;
              break;
            }
            case "busy": {
              enum7 = 4;
              break;
            }
            case "deadlock": {
              enum7 = 5;
              break;
            }
            case "quota": {
              enum7 = 6;
              break;
            }
            case "exist": {
              enum7 = 7;
              break;
            }
            case "file-too-large": {
              enum7 = 8;
              break;
            }
            case "illegal-byte-sequence": {
              enum7 = 9;
              break;
            }
            case "in-progress": {
              enum7 = 10;
              break;
            }
            case "interrupted": {
              enum7 = 11;
              break;
            }
            case "invalid": {
              enum7 = 12;
              break;
            }
            case "io": {
              enum7 = 13;
              break;
            }
            case "is-directory": {
              enum7 = 14;
              break;
            }
            case "loop": {
              enum7 = 15;
              break;
            }
            case "too-many-links": {
              enum7 = 16;
              break;
            }
            case "message-size": {
              enum7 = 17;
              break;
            }
            case "name-too-long": {
              enum7 = 18;
              break;
            }
            case "no-device": {
              enum7 = 19;
              break;
            }
            case "no-entry": {
              enum7 = 20;
              break;
            }
            case "no-lock": {
              enum7 = 21;
              break;
            }
            case "insufficient-memory": {
              enum7 = 22;
              break;
            }
            case "insufficient-space": {
              enum7 = 23;
              break;
            }
            case "not-directory": {
              enum7 = 24;
              break;
            }
            case "not-empty": {
              enum7 = 25;
              break;
            }
            case "not-recoverable": {
              enum7 = 26;
              break;
            }
            case "unsupported": {
              enum7 = 27;
              break;
            }
            case "no-tty": {
              enum7 = 28;
              break;
            }
            case "no-such-device": {
              enum7 = 29;
              break;
            }
            case "overflow": {
              enum7 = 30;
              break;
            }
            case "not-permitted": {
              enum7 = 31;
              break;
            }
            case "pipe": {
              enum7 = 32;
              break;
            }
            case "read-only": {
              enum7 = 33;
              break;
            }
            case "invalid-seek": {
              enum7 = 34;
              break;
            }
            case "text-file-busy": {
              enum7 = 35;
              break;
            }
            case "cross-device": {
              enum7 = 36;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val7}" is not one of the cases of error-code`);
            }
          }
          dataView(memory0).setInt8(arg1 + 4, enum7, true);
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]directory-entry-stream.read-directory-entry"][Instruction::Return]', {
        funcName: "[method]directory-entry-stream.read-directory-entry",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline21(arg0, arg1, arg2, arg3, arg4) {
      var handle1 = arg0;
      var rep2 = handleTable6[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable6.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(Descriptor2.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      if ((arg1 & 4294967294) !== 0) {
        throw new TypeError("flags have extraneous bits set");
      }
      var flags3 = {
        symlinkFollow: Boolean(arg1 & 1)
      };
      var ptr4 = arg2;
      var len4 = arg3;
      var result4 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr4, len4));
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.stat-at"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]descriptor.stat-at");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.statAt(flags3, result4) };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.stat-at"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant14 = ret;
      switch (variant14.tag) {
        case "ok": {
          const e = variant14.val;
          dataView(memory0).setInt8(arg4 + 0, 0, true);
          var { type: v5_0, linkCount: v5_1, size: v5_2, dataAccessTimestamp: v5_3, dataModificationTimestamp: v5_4, statusChangeTimestamp: v5_5 } = e;
          var val6 = v5_0;
          let enum6;
          switch (val6) {
            case "unknown": {
              enum6 = 0;
              break;
            }
            case "block-device": {
              enum6 = 1;
              break;
            }
            case "character-device": {
              enum6 = 2;
              break;
            }
            case "directory": {
              enum6 = 3;
              break;
            }
            case "fifo": {
              enum6 = 4;
              break;
            }
            case "symbolic-link": {
              enum6 = 5;
              break;
            }
            case "regular-file": {
              enum6 = 6;
              break;
            }
            case "socket": {
              enum6 = 7;
              break;
            }
            default: {
              if (v5_0 instanceof Error) {
                console.error(v5_0);
              }
              throw new TypeError(`"${val6}" is not one of the cases of descriptor-type`);
            }
          }
          dataView(memory0).setInt8(arg4 + 8, enum6, true);
          dataView(memory0).setBigInt64(arg4 + 16, toUint64(v5_1), true);
          dataView(memory0).setBigInt64(arg4 + 24, toUint64(v5_2), true);
          var variant8 = v5_3;
          if (variant8 === null || variant8 === void 0) {
            dataView(memory0).setInt8(arg4 + 32, 0, true);
          } else {
            const e2 = variant8;
            dataView(memory0).setInt8(arg4 + 32, 1, true);
            var { seconds: v7_0, nanoseconds: v7_1 } = e2;
            dataView(memory0).setBigInt64(arg4 + 40, toUint64(v7_0), true);
            dataView(memory0).setInt32(arg4 + 48, toUint32(v7_1), true);
          }
          var variant10 = v5_4;
          if (variant10 === null || variant10 === void 0) {
            dataView(memory0).setInt8(arg4 + 56, 0, true);
          } else {
            const e2 = variant10;
            dataView(memory0).setInt8(arg4 + 56, 1, true);
            var { seconds: v9_0, nanoseconds: v9_1 } = e2;
            dataView(memory0).setBigInt64(arg4 + 64, toUint64(v9_0), true);
            dataView(memory0).setInt32(arg4 + 72, toUint32(v9_1), true);
          }
          var variant12 = v5_5;
          if (variant12 === null || variant12 === void 0) {
            dataView(memory0).setInt8(arg4 + 80, 0, true);
          } else {
            const e2 = variant12;
            dataView(memory0).setInt8(arg4 + 80, 1, true);
            var { seconds: v11_0, nanoseconds: v11_1 } = e2;
            dataView(memory0).setBigInt64(arg4 + 88, toUint64(v11_0), true);
            dataView(memory0).setInt32(arg4 + 96, toUint32(v11_1), true);
          }
          break;
        }
        case "err": {
          const e = variant14.val;
          dataView(memory0).setInt8(arg4 + 0, 1, true);
          var val13 = e;
          let enum13;
          switch (val13) {
            case "access": {
              enum13 = 0;
              break;
            }
            case "would-block": {
              enum13 = 1;
              break;
            }
            case "already": {
              enum13 = 2;
              break;
            }
            case "bad-descriptor": {
              enum13 = 3;
              break;
            }
            case "busy": {
              enum13 = 4;
              break;
            }
            case "deadlock": {
              enum13 = 5;
              break;
            }
            case "quota": {
              enum13 = 6;
              break;
            }
            case "exist": {
              enum13 = 7;
              break;
            }
            case "file-too-large": {
              enum13 = 8;
              break;
            }
            case "illegal-byte-sequence": {
              enum13 = 9;
              break;
            }
            case "in-progress": {
              enum13 = 10;
              break;
            }
            case "interrupted": {
              enum13 = 11;
              break;
            }
            case "invalid": {
              enum13 = 12;
              break;
            }
            case "io": {
              enum13 = 13;
              break;
            }
            case "is-directory": {
              enum13 = 14;
              break;
            }
            case "loop": {
              enum13 = 15;
              break;
            }
            case "too-many-links": {
              enum13 = 16;
              break;
            }
            case "message-size": {
              enum13 = 17;
              break;
            }
            case "name-too-long": {
              enum13 = 18;
              break;
            }
            case "no-device": {
              enum13 = 19;
              break;
            }
            case "no-entry": {
              enum13 = 20;
              break;
            }
            case "no-lock": {
              enum13 = 21;
              break;
            }
            case "insufficient-memory": {
              enum13 = 22;
              break;
            }
            case "insufficient-space": {
              enum13 = 23;
              break;
            }
            case "not-directory": {
              enum13 = 24;
              break;
            }
            case "not-empty": {
              enum13 = 25;
              break;
            }
            case "not-recoverable": {
              enum13 = 26;
              break;
            }
            case "unsupported": {
              enum13 = 27;
              break;
            }
            case "no-tty": {
              enum13 = 28;
              break;
            }
            case "no-such-device": {
              enum13 = 29;
              break;
            }
            case "overflow": {
              enum13 = 30;
              break;
            }
            case "not-permitted": {
              enum13 = 31;
              break;
            }
            case "pipe": {
              enum13 = 32;
              break;
            }
            case "read-only": {
              enum13 = 33;
              break;
            }
            case "invalid-seek": {
              enum13 = 34;
              break;
            }
            case "text-file-busy": {
              enum13 = 35;
              break;
            }
            case "cross-device": {
              enum13 = 36;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val13}" is not one of the cases of error-code`);
            }
          }
          dataView(memory0).setInt8(arg4 + 8, enum13, true);
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.stat-at"][Instruction::Return]', {
        funcName: "[method]descriptor.stat-at",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline22(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
      var handle1 = arg0;
      var rep2 = handleTable6[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable6.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(Descriptor2.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      if ((arg1 & 4294967294) !== 0) {
        throw new TypeError("flags have extraneous bits set");
      }
      var flags3 = {
        symlinkFollow: Boolean(arg1 & 1)
      };
      var ptr4 = arg2;
      var len4 = arg3;
      var result4 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr4, len4));
      if ((arg4 & 4294967280) !== 0) {
        throw new TypeError("flags have extraneous bits set");
      }
      var flags5 = {
        create: Boolean(arg4 & 1),
        directory: Boolean(arg4 & 2),
        exclusive: Boolean(arg4 & 4),
        truncate: Boolean(arg4 & 8)
      };
      if ((arg5 & 4294967232) !== 0) {
        throw new TypeError("flags have extraneous bits set");
      }
      var flags6 = {
        read: Boolean(arg5 & 1),
        write: Boolean(arg5 & 2),
        fileIntegritySync: Boolean(arg5 & 4),
        dataIntegritySync: Boolean(arg5 & 8),
        requestedWriteSync: Boolean(arg5 & 16),
        mutateDirectory: Boolean(arg5 & 32)
      };
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.open-at"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]descriptor.open-at");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.openAt(flags3, result4, flags5, flags6) };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.open-at"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant9 = ret;
      switch (variant9.tag) {
        case "ok": {
          const e = variant9.val;
          dataView(memory0).setInt8(arg6 + 0, 0, true);
          if (!(e instanceof Descriptor2)) {
            throw new TypeError('Resource error: Not a valid "Descriptor" resource.');
          }
          var handle7 = e[symbolRscHandle];
          if (!handle7) {
            const rep = e[symbolRscRep] || ++captureCnt6;
            captureTable6.set(rep, e);
            handle7 = rscTableCreateOwn(handleTable6, rep);
          }
          dataView(memory0).setInt32(arg6 + 4, handle7, true);
          break;
        }
        case "err": {
          const e = variant9.val;
          dataView(memory0).setInt8(arg6 + 0, 1, true);
          var val8 = e;
          let enum8;
          switch (val8) {
            case "access": {
              enum8 = 0;
              break;
            }
            case "would-block": {
              enum8 = 1;
              break;
            }
            case "already": {
              enum8 = 2;
              break;
            }
            case "bad-descriptor": {
              enum8 = 3;
              break;
            }
            case "busy": {
              enum8 = 4;
              break;
            }
            case "deadlock": {
              enum8 = 5;
              break;
            }
            case "quota": {
              enum8 = 6;
              break;
            }
            case "exist": {
              enum8 = 7;
              break;
            }
            case "file-too-large": {
              enum8 = 8;
              break;
            }
            case "illegal-byte-sequence": {
              enum8 = 9;
              break;
            }
            case "in-progress": {
              enum8 = 10;
              break;
            }
            case "interrupted": {
              enum8 = 11;
              break;
            }
            case "invalid": {
              enum8 = 12;
              break;
            }
            case "io": {
              enum8 = 13;
              break;
            }
            case "is-directory": {
              enum8 = 14;
              break;
            }
            case "loop": {
              enum8 = 15;
              break;
            }
            case "too-many-links": {
              enum8 = 16;
              break;
            }
            case "message-size": {
              enum8 = 17;
              break;
            }
            case "name-too-long": {
              enum8 = 18;
              break;
            }
            case "no-device": {
              enum8 = 19;
              break;
            }
            case "no-entry": {
              enum8 = 20;
              break;
            }
            case "no-lock": {
              enum8 = 21;
              break;
            }
            case "insufficient-memory": {
              enum8 = 22;
              break;
            }
            case "insufficient-space": {
              enum8 = 23;
              break;
            }
            case "not-directory": {
              enum8 = 24;
              break;
            }
            case "not-empty": {
              enum8 = 25;
              break;
            }
            case "not-recoverable": {
              enum8 = 26;
              break;
            }
            case "unsupported": {
              enum8 = 27;
              break;
            }
            case "no-tty": {
              enum8 = 28;
              break;
            }
            case "no-such-device": {
              enum8 = 29;
              break;
            }
            case "overflow": {
              enum8 = 30;
              break;
            }
            case "not-permitted": {
              enum8 = 31;
              break;
            }
            case "pipe": {
              enum8 = 32;
              break;
            }
            case "read-only": {
              enum8 = 33;
              break;
            }
            case "invalid-seek": {
              enum8 = 34;
              break;
            }
            case "text-file-busy": {
              enum8 = 35;
              break;
            }
            case "cross-device": {
              enum8 = 36;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val8}" is not one of the cases of error-code`);
            }
          }
          dataView(memory0).setInt8(arg6 + 4, enum8, true);
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.open-at"][Instruction::Return]', {
        funcName: "[method]descriptor.open-at",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline23(arg0, arg1, arg2, arg3) {
      var handle1 = arg0;
      var rep2 = handleTable6[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable6.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(Descriptor2.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      var ptr3 = arg1;
      var len3 = arg2;
      var result3 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr3, len3));
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.remove-directory-at"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]descriptor.remove-directory-at");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.removeDirectoryAt(result3) };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.remove-directory-at"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant5 = ret;
      switch (variant5.tag) {
        case "ok": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg3 + 0, 0, true);
          break;
        }
        case "err": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg3 + 0, 1, true);
          var val4 = e;
          let enum4;
          switch (val4) {
            case "access": {
              enum4 = 0;
              break;
            }
            case "would-block": {
              enum4 = 1;
              break;
            }
            case "already": {
              enum4 = 2;
              break;
            }
            case "bad-descriptor": {
              enum4 = 3;
              break;
            }
            case "busy": {
              enum4 = 4;
              break;
            }
            case "deadlock": {
              enum4 = 5;
              break;
            }
            case "quota": {
              enum4 = 6;
              break;
            }
            case "exist": {
              enum4 = 7;
              break;
            }
            case "file-too-large": {
              enum4 = 8;
              break;
            }
            case "illegal-byte-sequence": {
              enum4 = 9;
              break;
            }
            case "in-progress": {
              enum4 = 10;
              break;
            }
            case "interrupted": {
              enum4 = 11;
              break;
            }
            case "invalid": {
              enum4 = 12;
              break;
            }
            case "io": {
              enum4 = 13;
              break;
            }
            case "is-directory": {
              enum4 = 14;
              break;
            }
            case "loop": {
              enum4 = 15;
              break;
            }
            case "too-many-links": {
              enum4 = 16;
              break;
            }
            case "message-size": {
              enum4 = 17;
              break;
            }
            case "name-too-long": {
              enum4 = 18;
              break;
            }
            case "no-device": {
              enum4 = 19;
              break;
            }
            case "no-entry": {
              enum4 = 20;
              break;
            }
            case "no-lock": {
              enum4 = 21;
              break;
            }
            case "insufficient-memory": {
              enum4 = 22;
              break;
            }
            case "insufficient-space": {
              enum4 = 23;
              break;
            }
            case "not-directory": {
              enum4 = 24;
              break;
            }
            case "not-empty": {
              enum4 = 25;
              break;
            }
            case "not-recoverable": {
              enum4 = 26;
              break;
            }
            case "unsupported": {
              enum4 = 27;
              break;
            }
            case "no-tty": {
              enum4 = 28;
              break;
            }
            case "no-such-device": {
              enum4 = 29;
              break;
            }
            case "overflow": {
              enum4 = 30;
              break;
            }
            case "not-permitted": {
              enum4 = 31;
              break;
            }
            case "pipe": {
              enum4 = 32;
              break;
            }
            case "read-only": {
              enum4 = 33;
              break;
            }
            case "invalid-seek": {
              enum4 = 34;
              break;
            }
            case "text-file-busy": {
              enum4 = 35;
              break;
            }
            case "cross-device": {
              enum4 = 36;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val4}" is not one of the cases of error-code`);
            }
          }
          dataView(memory0).setInt8(arg3 + 1, enum4, true);
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.remove-directory-at"][Instruction::Return]', {
        funcName: "[method]descriptor.remove-directory-at",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline24(arg0, arg1, arg2, arg3) {
      var handle1 = arg0;
      var rep2 = handleTable6[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable6.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(Descriptor2.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      var ptr3 = arg1;
      var len3 = arg2;
      var result3 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr3, len3));
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.unlink-file-at"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]descriptor.unlink-file-at");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.unlinkFileAt(result3) };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.unlink-file-at"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant5 = ret;
      switch (variant5.tag) {
        case "ok": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg3 + 0, 0, true);
          break;
        }
        case "err": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg3 + 0, 1, true);
          var val4 = e;
          let enum4;
          switch (val4) {
            case "access": {
              enum4 = 0;
              break;
            }
            case "would-block": {
              enum4 = 1;
              break;
            }
            case "already": {
              enum4 = 2;
              break;
            }
            case "bad-descriptor": {
              enum4 = 3;
              break;
            }
            case "busy": {
              enum4 = 4;
              break;
            }
            case "deadlock": {
              enum4 = 5;
              break;
            }
            case "quota": {
              enum4 = 6;
              break;
            }
            case "exist": {
              enum4 = 7;
              break;
            }
            case "file-too-large": {
              enum4 = 8;
              break;
            }
            case "illegal-byte-sequence": {
              enum4 = 9;
              break;
            }
            case "in-progress": {
              enum4 = 10;
              break;
            }
            case "interrupted": {
              enum4 = 11;
              break;
            }
            case "invalid": {
              enum4 = 12;
              break;
            }
            case "io": {
              enum4 = 13;
              break;
            }
            case "is-directory": {
              enum4 = 14;
              break;
            }
            case "loop": {
              enum4 = 15;
              break;
            }
            case "too-many-links": {
              enum4 = 16;
              break;
            }
            case "message-size": {
              enum4 = 17;
              break;
            }
            case "name-too-long": {
              enum4 = 18;
              break;
            }
            case "no-device": {
              enum4 = 19;
              break;
            }
            case "no-entry": {
              enum4 = 20;
              break;
            }
            case "no-lock": {
              enum4 = 21;
              break;
            }
            case "insufficient-memory": {
              enum4 = 22;
              break;
            }
            case "insufficient-space": {
              enum4 = 23;
              break;
            }
            case "not-directory": {
              enum4 = 24;
              break;
            }
            case "not-empty": {
              enum4 = 25;
              break;
            }
            case "not-recoverable": {
              enum4 = 26;
              break;
            }
            case "unsupported": {
              enum4 = 27;
              break;
            }
            case "no-tty": {
              enum4 = 28;
              break;
            }
            case "no-such-device": {
              enum4 = 29;
              break;
            }
            case "overflow": {
              enum4 = 30;
              break;
            }
            case "not-permitted": {
              enum4 = 31;
              break;
            }
            case "pipe": {
              enum4 = 32;
              break;
            }
            case "read-only": {
              enum4 = 33;
              break;
            }
            case "invalid-seek": {
              enum4 = 34;
              break;
            }
            case "text-file-busy": {
              enum4 = 35;
              break;
            }
            case "cross-device": {
              enum4 = 36;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val4}" is not one of the cases of error-code`);
            }
          }
          dataView(memory0).setInt8(arg3 + 1, enum4, true);
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.unlink-file-at"][Instruction::Return]', {
        funcName: "[method]descriptor.unlink-file-at",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline25(arg0, arg1, arg2) {
      var handle1 = arg0;
      var rep2 = handleTable6[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable6.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(Descriptor2.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.read-via-stream"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]descriptor.read-via-stream");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.readViaStream(BigInt.asUintN(64, arg1)) };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.read-via-stream"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant5 = ret;
      switch (variant5.tag) {
        case "ok": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg2 + 0, 0, true);
          if (!(e instanceof InputStream4)) {
            throw new TypeError('Resource error: Not a valid "InputStream" resource.');
          }
          var handle3 = e[symbolRscHandle];
          if (!handle3) {
            const rep = e[symbolRscRep] || ++captureCnt1;
            captureTable1.set(rep, e);
            handle3 = rscTableCreateOwn(handleTable1, rep);
          }
          dataView(memory0).setInt32(arg2 + 4, handle3, true);
          break;
        }
        case "err": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg2 + 0, 1, true);
          var val4 = e;
          let enum4;
          switch (val4) {
            case "access": {
              enum4 = 0;
              break;
            }
            case "would-block": {
              enum4 = 1;
              break;
            }
            case "already": {
              enum4 = 2;
              break;
            }
            case "bad-descriptor": {
              enum4 = 3;
              break;
            }
            case "busy": {
              enum4 = 4;
              break;
            }
            case "deadlock": {
              enum4 = 5;
              break;
            }
            case "quota": {
              enum4 = 6;
              break;
            }
            case "exist": {
              enum4 = 7;
              break;
            }
            case "file-too-large": {
              enum4 = 8;
              break;
            }
            case "illegal-byte-sequence": {
              enum4 = 9;
              break;
            }
            case "in-progress": {
              enum4 = 10;
              break;
            }
            case "interrupted": {
              enum4 = 11;
              break;
            }
            case "invalid": {
              enum4 = 12;
              break;
            }
            case "io": {
              enum4 = 13;
              break;
            }
            case "is-directory": {
              enum4 = 14;
              break;
            }
            case "loop": {
              enum4 = 15;
              break;
            }
            case "too-many-links": {
              enum4 = 16;
              break;
            }
            case "message-size": {
              enum4 = 17;
              break;
            }
            case "name-too-long": {
              enum4 = 18;
              break;
            }
            case "no-device": {
              enum4 = 19;
              break;
            }
            case "no-entry": {
              enum4 = 20;
              break;
            }
            case "no-lock": {
              enum4 = 21;
              break;
            }
            case "insufficient-memory": {
              enum4 = 22;
              break;
            }
            case "insufficient-space": {
              enum4 = 23;
              break;
            }
            case "not-directory": {
              enum4 = 24;
              break;
            }
            case "not-empty": {
              enum4 = 25;
              break;
            }
            case "not-recoverable": {
              enum4 = 26;
              break;
            }
            case "unsupported": {
              enum4 = 27;
              break;
            }
            case "no-tty": {
              enum4 = 28;
              break;
            }
            case "no-such-device": {
              enum4 = 29;
              break;
            }
            case "overflow": {
              enum4 = 30;
              break;
            }
            case "not-permitted": {
              enum4 = 31;
              break;
            }
            case "pipe": {
              enum4 = 32;
              break;
            }
            case "read-only": {
              enum4 = 33;
              break;
            }
            case "invalid-seek": {
              enum4 = 34;
              break;
            }
            case "text-file-busy": {
              enum4 = 35;
              break;
            }
            case "cross-device": {
              enum4 = 36;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val4}" is not one of the cases of error-code`);
            }
          }
          dataView(memory0).setInt8(arg2 + 4, enum4, true);
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.read-via-stream"][Instruction::Return]', {
        funcName: "[method]descriptor.read-via-stream",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline26(arg0, arg1, arg2) {
      var handle1 = arg0;
      var rep2 = handleTable6[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable6.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(Descriptor2.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.write-via-stream"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]descriptor.write-via-stream");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.writeViaStream(BigInt.asUintN(64, arg1)) };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.write-via-stream"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant5 = ret;
      switch (variant5.tag) {
        case "ok": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg2 + 0, 0, true);
          if (!(e instanceof OutputStream4)) {
            throw new TypeError('Resource error: Not a valid "OutputStream" resource.');
          }
          var handle3 = e[symbolRscHandle];
          if (!handle3) {
            const rep = e[symbolRscRep] || ++captureCnt2;
            captureTable2.set(rep, e);
            handle3 = rscTableCreateOwn(handleTable2, rep);
          }
          dataView(memory0).setInt32(arg2 + 4, handle3, true);
          break;
        }
        case "err": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg2 + 0, 1, true);
          var val4 = e;
          let enum4;
          switch (val4) {
            case "access": {
              enum4 = 0;
              break;
            }
            case "would-block": {
              enum4 = 1;
              break;
            }
            case "already": {
              enum4 = 2;
              break;
            }
            case "bad-descriptor": {
              enum4 = 3;
              break;
            }
            case "busy": {
              enum4 = 4;
              break;
            }
            case "deadlock": {
              enum4 = 5;
              break;
            }
            case "quota": {
              enum4 = 6;
              break;
            }
            case "exist": {
              enum4 = 7;
              break;
            }
            case "file-too-large": {
              enum4 = 8;
              break;
            }
            case "illegal-byte-sequence": {
              enum4 = 9;
              break;
            }
            case "in-progress": {
              enum4 = 10;
              break;
            }
            case "interrupted": {
              enum4 = 11;
              break;
            }
            case "invalid": {
              enum4 = 12;
              break;
            }
            case "io": {
              enum4 = 13;
              break;
            }
            case "is-directory": {
              enum4 = 14;
              break;
            }
            case "loop": {
              enum4 = 15;
              break;
            }
            case "too-many-links": {
              enum4 = 16;
              break;
            }
            case "message-size": {
              enum4 = 17;
              break;
            }
            case "name-too-long": {
              enum4 = 18;
              break;
            }
            case "no-device": {
              enum4 = 19;
              break;
            }
            case "no-entry": {
              enum4 = 20;
              break;
            }
            case "no-lock": {
              enum4 = 21;
              break;
            }
            case "insufficient-memory": {
              enum4 = 22;
              break;
            }
            case "insufficient-space": {
              enum4 = 23;
              break;
            }
            case "not-directory": {
              enum4 = 24;
              break;
            }
            case "not-empty": {
              enum4 = 25;
              break;
            }
            case "not-recoverable": {
              enum4 = 26;
              break;
            }
            case "unsupported": {
              enum4 = 27;
              break;
            }
            case "no-tty": {
              enum4 = 28;
              break;
            }
            case "no-such-device": {
              enum4 = 29;
              break;
            }
            case "overflow": {
              enum4 = 30;
              break;
            }
            case "not-permitted": {
              enum4 = 31;
              break;
            }
            case "pipe": {
              enum4 = 32;
              break;
            }
            case "read-only": {
              enum4 = 33;
              break;
            }
            case "invalid-seek": {
              enum4 = 34;
              break;
            }
            case "text-file-busy": {
              enum4 = 35;
              break;
            }
            case "cross-device": {
              enum4 = 36;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val4}" is not one of the cases of error-code`);
            }
          }
          dataView(memory0).setInt8(arg2 + 4, enum4, true);
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.write-via-stream"][Instruction::Return]', {
        funcName: "[method]descriptor.write-via-stream",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline27(arg0, arg1) {
      var handle1 = arg0;
      var rep2 = handleTable6[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable6.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(Descriptor2.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.append-via-stream"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]descriptor.append-via-stream");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.appendViaStream() };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.append-via-stream"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant5 = ret;
      switch (variant5.tag) {
        case "ok": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg1 + 0, 0, true);
          if (!(e instanceof OutputStream4)) {
            throw new TypeError('Resource error: Not a valid "OutputStream" resource.');
          }
          var handle3 = e[symbolRscHandle];
          if (!handle3) {
            const rep = e[symbolRscRep] || ++captureCnt2;
            captureTable2.set(rep, e);
            handle3 = rscTableCreateOwn(handleTable2, rep);
          }
          dataView(memory0).setInt32(arg1 + 4, handle3, true);
          break;
        }
        case "err": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg1 + 0, 1, true);
          var val4 = e;
          let enum4;
          switch (val4) {
            case "access": {
              enum4 = 0;
              break;
            }
            case "would-block": {
              enum4 = 1;
              break;
            }
            case "already": {
              enum4 = 2;
              break;
            }
            case "bad-descriptor": {
              enum4 = 3;
              break;
            }
            case "busy": {
              enum4 = 4;
              break;
            }
            case "deadlock": {
              enum4 = 5;
              break;
            }
            case "quota": {
              enum4 = 6;
              break;
            }
            case "exist": {
              enum4 = 7;
              break;
            }
            case "file-too-large": {
              enum4 = 8;
              break;
            }
            case "illegal-byte-sequence": {
              enum4 = 9;
              break;
            }
            case "in-progress": {
              enum4 = 10;
              break;
            }
            case "interrupted": {
              enum4 = 11;
              break;
            }
            case "invalid": {
              enum4 = 12;
              break;
            }
            case "io": {
              enum4 = 13;
              break;
            }
            case "is-directory": {
              enum4 = 14;
              break;
            }
            case "loop": {
              enum4 = 15;
              break;
            }
            case "too-many-links": {
              enum4 = 16;
              break;
            }
            case "message-size": {
              enum4 = 17;
              break;
            }
            case "name-too-long": {
              enum4 = 18;
              break;
            }
            case "no-device": {
              enum4 = 19;
              break;
            }
            case "no-entry": {
              enum4 = 20;
              break;
            }
            case "no-lock": {
              enum4 = 21;
              break;
            }
            case "insufficient-memory": {
              enum4 = 22;
              break;
            }
            case "insufficient-space": {
              enum4 = 23;
              break;
            }
            case "not-directory": {
              enum4 = 24;
              break;
            }
            case "not-empty": {
              enum4 = 25;
              break;
            }
            case "not-recoverable": {
              enum4 = 26;
              break;
            }
            case "unsupported": {
              enum4 = 27;
              break;
            }
            case "no-tty": {
              enum4 = 28;
              break;
            }
            case "no-such-device": {
              enum4 = 29;
              break;
            }
            case "overflow": {
              enum4 = 30;
              break;
            }
            case "not-permitted": {
              enum4 = 31;
              break;
            }
            case "pipe": {
              enum4 = 32;
              break;
            }
            case "read-only": {
              enum4 = 33;
              break;
            }
            case "invalid-seek": {
              enum4 = 34;
              break;
            }
            case "text-file-busy": {
              enum4 = 35;
              break;
            }
            case "cross-device": {
              enum4 = 36;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val4}" is not one of the cases of error-code`);
            }
          }
          dataView(memory0).setInt8(arg1 + 4, enum4, true);
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.append-via-stream"][Instruction::Return]', {
        funcName: "[method]descriptor.append-via-stream",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline28(arg0, arg1) {
      var handle1 = arg0;
      var rep2 = handleTable6[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable6.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(Descriptor2.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.get-type"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]descriptor.get-type");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.getType() };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.get-type"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant5 = ret;
      switch (variant5.tag) {
        case "ok": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg1 + 0, 0, true);
          var val3 = e;
          let enum3;
          switch (val3) {
            case "unknown": {
              enum3 = 0;
              break;
            }
            case "block-device": {
              enum3 = 1;
              break;
            }
            case "character-device": {
              enum3 = 2;
              break;
            }
            case "directory": {
              enum3 = 3;
              break;
            }
            case "fifo": {
              enum3 = 4;
              break;
            }
            case "symbolic-link": {
              enum3 = 5;
              break;
            }
            case "regular-file": {
              enum3 = 6;
              break;
            }
            case "socket": {
              enum3 = 7;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val3}" is not one of the cases of descriptor-type`);
            }
          }
          dataView(memory0).setInt8(arg1 + 1, enum3, true);
          break;
        }
        case "err": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg1 + 0, 1, true);
          var val4 = e;
          let enum4;
          switch (val4) {
            case "access": {
              enum4 = 0;
              break;
            }
            case "would-block": {
              enum4 = 1;
              break;
            }
            case "already": {
              enum4 = 2;
              break;
            }
            case "bad-descriptor": {
              enum4 = 3;
              break;
            }
            case "busy": {
              enum4 = 4;
              break;
            }
            case "deadlock": {
              enum4 = 5;
              break;
            }
            case "quota": {
              enum4 = 6;
              break;
            }
            case "exist": {
              enum4 = 7;
              break;
            }
            case "file-too-large": {
              enum4 = 8;
              break;
            }
            case "illegal-byte-sequence": {
              enum4 = 9;
              break;
            }
            case "in-progress": {
              enum4 = 10;
              break;
            }
            case "interrupted": {
              enum4 = 11;
              break;
            }
            case "invalid": {
              enum4 = 12;
              break;
            }
            case "io": {
              enum4 = 13;
              break;
            }
            case "is-directory": {
              enum4 = 14;
              break;
            }
            case "loop": {
              enum4 = 15;
              break;
            }
            case "too-many-links": {
              enum4 = 16;
              break;
            }
            case "message-size": {
              enum4 = 17;
              break;
            }
            case "name-too-long": {
              enum4 = 18;
              break;
            }
            case "no-device": {
              enum4 = 19;
              break;
            }
            case "no-entry": {
              enum4 = 20;
              break;
            }
            case "no-lock": {
              enum4 = 21;
              break;
            }
            case "insufficient-memory": {
              enum4 = 22;
              break;
            }
            case "insufficient-space": {
              enum4 = 23;
              break;
            }
            case "not-directory": {
              enum4 = 24;
              break;
            }
            case "not-empty": {
              enum4 = 25;
              break;
            }
            case "not-recoverable": {
              enum4 = 26;
              break;
            }
            case "unsupported": {
              enum4 = 27;
              break;
            }
            case "no-tty": {
              enum4 = 28;
              break;
            }
            case "no-such-device": {
              enum4 = 29;
              break;
            }
            case "overflow": {
              enum4 = 30;
              break;
            }
            case "not-permitted": {
              enum4 = 31;
              break;
            }
            case "pipe": {
              enum4 = 32;
              break;
            }
            case "read-only": {
              enum4 = 33;
              break;
            }
            case "invalid-seek": {
              enum4 = 34;
              break;
            }
            case "text-file-busy": {
              enum4 = 35;
              break;
            }
            case "cross-device": {
              enum4 = 36;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val4}" is not one of the cases of error-code`);
            }
          }
          dataView(memory0).setInt8(arg1 + 1, enum4, true);
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.get-type"][Instruction::Return]', {
        funcName: "[method]descriptor.get-type",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline29(arg0, arg1) {
      var handle1 = arg0;
      var rep2 = handleTable6[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable6.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(Descriptor2.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.stat"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]descriptor.stat");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.stat() };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.stat"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant12 = ret;
      switch (variant12.tag) {
        case "ok": {
          const e = variant12.val;
          dataView(memory0).setInt8(arg1 + 0, 0, true);
          var { type: v3_0, linkCount: v3_1, size: v3_2, dataAccessTimestamp: v3_3, dataModificationTimestamp: v3_4, statusChangeTimestamp: v3_5 } = e;
          var val4 = v3_0;
          let enum4;
          switch (val4) {
            case "unknown": {
              enum4 = 0;
              break;
            }
            case "block-device": {
              enum4 = 1;
              break;
            }
            case "character-device": {
              enum4 = 2;
              break;
            }
            case "directory": {
              enum4 = 3;
              break;
            }
            case "fifo": {
              enum4 = 4;
              break;
            }
            case "symbolic-link": {
              enum4 = 5;
              break;
            }
            case "regular-file": {
              enum4 = 6;
              break;
            }
            case "socket": {
              enum4 = 7;
              break;
            }
            default: {
              if (v3_0 instanceof Error) {
                console.error(v3_0);
              }
              throw new TypeError(`"${val4}" is not one of the cases of descriptor-type`);
            }
          }
          dataView(memory0).setInt8(arg1 + 8, enum4, true);
          dataView(memory0).setBigInt64(arg1 + 16, toUint64(v3_1), true);
          dataView(memory0).setBigInt64(arg1 + 24, toUint64(v3_2), true);
          var variant6 = v3_3;
          if (variant6 === null || variant6 === void 0) {
            dataView(memory0).setInt8(arg1 + 32, 0, true);
          } else {
            const e2 = variant6;
            dataView(memory0).setInt8(arg1 + 32, 1, true);
            var { seconds: v5_0, nanoseconds: v5_1 } = e2;
            dataView(memory0).setBigInt64(arg1 + 40, toUint64(v5_0), true);
            dataView(memory0).setInt32(arg1 + 48, toUint32(v5_1), true);
          }
          var variant8 = v3_4;
          if (variant8 === null || variant8 === void 0) {
            dataView(memory0).setInt8(arg1 + 56, 0, true);
          } else {
            const e2 = variant8;
            dataView(memory0).setInt8(arg1 + 56, 1, true);
            var { seconds: v7_0, nanoseconds: v7_1 } = e2;
            dataView(memory0).setBigInt64(arg1 + 64, toUint64(v7_0), true);
            dataView(memory0).setInt32(arg1 + 72, toUint32(v7_1), true);
          }
          var variant10 = v3_5;
          if (variant10 === null || variant10 === void 0) {
            dataView(memory0).setInt8(arg1 + 80, 0, true);
          } else {
            const e2 = variant10;
            dataView(memory0).setInt8(arg1 + 80, 1, true);
            var { seconds: v9_0, nanoseconds: v9_1 } = e2;
            dataView(memory0).setBigInt64(arg1 + 88, toUint64(v9_0), true);
            dataView(memory0).setInt32(arg1 + 96, toUint32(v9_1), true);
          }
          break;
        }
        case "err": {
          const e = variant12.val;
          dataView(memory0).setInt8(arg1 + 0, 1, true);
          var val11 = e;
          let enum11;
          switch (val11) {
            case "access": {
              enum11 = 0;
              break;
            }
            case "would-block": {
              enum11 = 1;
              break;
            }
            case "already": {
              enum11 = 2;
              break;
            }
            case "bad-descriptor": {
              enum11 = 3;
              break;
            }
            case "busy": {
              enum11 = 4;
              break;
            }
            case "deadlock": {
              enum11 = 5;
              break;
            }
            case "quota": {
              enum11 = 6;
              break;
            }
            case "exist": {
              enum11 = 7;
              break;
            }
            case "file-too-large": {
              enum11 = 8;
              break;
            }
            case "illegal-byte-sequence": {
              enum11 = 9;
              break;
            }
            case "in-progress": {
              enum11 = 10;
              break;
            }
            case "interrupted": {
              enum11 = 11;
              break;
            }
            case "invalid": {
              enum11 = 12;
              break;
            }
            case "io": {
              enum11 = 13;
              break;
            }
            case "is-directory": {
              enum11 = 14;
              break;
            }
            case "loop": {
              enum11 = 15;
              break;
            }
            case "too-many-links": {
              enum11 = 16;
              break;
            }
            case "message-size": {
              enum11 = 17;
              break;
            }
            case "name-too-long": {
              enum11 = 18;
              break;
            }
            case "no-device": {
              enum11 = 19;
              break;
            }
            case "no-entry": {
              enum11 = 20;
              break;
            }
            case "no-lock": {
              enum11 = 21;
              break;
            }
            case "insufficient-memory": {
              enum11 = 22;
              break;
            }
            case "insufficient-space": {
              enum11 = 23;
              break;
            }
            case "not-directory": {
              enum11 = 24;
              break;
            }
            case "not-empty": {
              enum11 = 25;
              break;
            }
            case "not-recoverable": {
              enum11 = 26;
              break;
            }
            case "unsupported": {
              enum11 = 27;
              break;
            }
            case "no-tty": {
              enum11 = 28;
              break;
            }
            case "no-such-device": {
              enum11 = 29;
              break;
            }
            case "overflow": {
              enum11 = 30;
              break;
            }
            case "not-permitted": {
              enum11 = 31;
              break;
            }
            case "pipe": {
              enum11 = 32;
              break;
            }
            case "read-only": {
              enum11 = 33;
              break;
            }
            case "invalid-seek": {
              enum11 = 34;
              break;
            }
            case "text-file-busy": {
              enum11 = 35;
              break;
            }
            case "cross-device": {
              enum11 = 36;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val11}" is not one of the cases of error-code`);
            }
          }
          dataView(memory0).setInt8(arg1 + 8, enum11, true);
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.stat"][Instruction::Return]', {
        funcName: "[method]descriptor.stat",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline30(arg0, arg1) {
      var handle1 = arg0;
      var rep2 = handleTable6[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable6.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(Descriptor2.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.metadata-hash"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]descriptor.metadata-hash");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.metadataHash() };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.metadata-hash"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant5 = ret;
      switch (variant5.tag) {
        case "ok": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg1 + 0, 0, true);
          var { lower: v3_0, upper: v3_1 } = e;
          dataView(memory0).setBigInt64(arg1 + 8, toUint64(v3_0), true);
          dataView(memory0).setBigInt64(arg1 + 16, toUint64(v3_1), true);
          break;
        }
        case "err": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg1 + 0, 1, true);
          var val4 = e;
          let enum4;
          switch (val4) {
            case "access": {
              enum4 = 0;
              break;
            }
            case "would-block": {
              enum4 = 1;
              break;
            }
            case "already": {
              enum4 = 2;
              break;
            }
            case "bad-descriptor": {
              enum4 = 3;
              break;
            }
            case "busy": {
              enum4 = 4;
              break;
            }
            case "deadlock": {
              enum4 = 5;
              break;
            }
            case "quota": {
              enum4 = 6;
              break;
            }
            case "exist": {
              enum4 = 7;
              break;
            }
            case "file-too-large": {
              enum4 = 8;
              break;
            }
            case "illegal-byte-sequence": {
              enum4 = 9;
              break;
            }
            case "in-progress": {
              enum4 = 10;
              break;
            }
            case "interrupted": {
              enum4 = 11;
              break;
            }
            case "invalid": {
              enum4 = 12;
              break;
            }
            case "io": {
              enum4 = 13;
              break;
            }
            case "is-directory": {
              enum4 = 14;
              break;
            }
            case "loop": {
              enum4 = 15;
              break;
            }
            case "too-many-links": {
              enum4 = 16;
              break;
            }
            case "message-size": {
              enum4 = 17;
              break;
            }
            case "name-too-long": {
              enum4 = 18;
              break;
            }
            case "no-device": {
              enum4 = 19;
              break;
            }
            case "no-entry": {
              enum4 = 20;
              break;
            }
            case "no-lock": {
              enum4 = 21;
              break;
            }
            case "insufficient-memory": {
              enum4 = 22;
              break;
            }
            case "insufficient-space": {
              enum4 = 23;
              break;
            }
            case "not-directory": {
              enum4 = 24;
              break;
            }
            case "not-empty": {
              enum4 = 25;
              break;
            }
            case "not-recoverable": {
              enum4 = 26;
              break;
            }
            case "unsupported": {
              enum4 = 27;
              break;
            }
            case "no-tty": {
              enum4 = 28;
              break;
            }
            case "no-such-device": {
              enum4 = 29;
              break;
            }
            case "overflow": {
              enum4 = 30;
              break;
            }
            case "not-permitted": {
              enum4 = 31;
              break;
            }
            case "pipe": {
              enum4 = 32;
              break;
            }
            case "read-only": {
              enum4 = 33;
              break;
            }
            case "invalid-seek": {
              enum4 = 34;
              break;
            }
            case "text-file-busy": {
              enum4 = 35;
              break;
            }
            case "cross-device": {
              enum4 = 36;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val4}" is not one of the cases of error-code`);
            }
          }
          dataView(memory0).setInt8(arg1 + 8, enum4, true);
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.metadata-hash"][Instruction::Return]', {
        funcName: "[method]descriptor.metadata-hash",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline31(arg0, arg1, arg2, arg3, arg4) {
      var handle1 = arg0;
      var rep2 = handleTable6[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable6.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(Descriptor2.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      if ((arg1 & 4294967294) !== 0) {
        throw new TypeError("flags have extraneous bits set");
      }
      var flags3 = {
        symlinkFollow: Boolean(arg1 & 1)
      };
      var ptr4 = arg2;
      var len4 = arg3;
      var result4 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr4, len4));
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.metadata-hash-at"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]descriptor.metadata-hash-at");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.metadataHashAt(flags3, result4) };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.metadata-hash-at"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant7 = ret;
      switch (variant7.tag) {
        case "ok": {
          const e = variant7.val;
          dataView(memory0).setInt8(arg4 + 0, 0, true);
          var { lower: v5_0, upper: v5_1 } = e;
          dataView(memory0).setBigInt64(arg4 + 8, toUint64(v5_0), true);
          dataView(memory0).setBigInt64(arg4 + 16, toUint64(v5_1), true);
          break;
        }
        case "err": {
          const e = variant7.val;
          dataView(memory0).setInt8(arg4 + 0, 1, true);
          var val6 = e;
          let enum6;
          switch (val6) {
            case "access": {
              enum6 = 0;
              break;
            }
            case "would-block": {
              enum6 = 1;
              break;
            }
            case "already": {
              enum6 = 2;
              break;
            }
            case "bad-descriptor": {
              enum6 = 3;
              break;
            }
            case "busy": {
              enum6 = 4;
              break;
            }
            case "deadlock": {
              enum6 = 5;
              break;
            }
            case "quota": {
              enum6 = 6;
              break;
            }
            case "exist": {
              enum6 = 7;
              break;
            }
            case "file-too-large": {
              enum6 = 8;
              break;
            }
            case "illegal-byte-sequence": {
              enum6 = 9;
              break;
            }
            case "in-progress": {
              enum6 = 10;
              break;
            }
            case "interrupted": {
              enum6 = 11;
              break;
            }
            case "invalid": {
              enum6 = 12;
              break;
            }
            case "io": {
              enum6 = 13;
              break;
            }
            case "is-directory": {
              enum6 = 14;
              break;
            }
            case "loop": {
              enum6 = 15;
              break;
            }
            case "too-many-links": {
              enum6 = 16;
              break;
            }
            case "message-size": {
              enum6 = 17;
              break;
            }
            case "name-too-long": {
              enum6 = 18;
              break;
            }
            case "no-device": {
              enum6 = 19;
              break;
            }
            case "no-entry": {
              enum6 = 20;
              break;
            }
            case "no-lock": {
              enum6 = 21;
              break;
            }
            case "insufficient-memory": {
              enum6 = 22;
              break;
            }
            case "insufficient-space": {
              enum6 = 23;
              break;
            }
            case "not-directory": {
              enum6 = 24;
              break;
            }
            case "not-empty": {
              enum6 = 25;
              break;
            }
            case "not-recoverable": {
              enum6 = 26;
              break;
            }
            case "unsupported": {
              enum6 = 27;
              break;
            }
            case "no-tty": {
              enum6 = 28;
              break;
            }
            case "no-such-device": {
              enum6 = 29;
              break;
            }
            case "overflow": {
              enum6 = 30;
              break;
            }
            case "not-permitted": {
              enum6 = 31;
              break;
            }
            case "pipe": {
              enum6 = 32;
              break;
            }
            case "read-only": {
              enum6 = 33;
              break;
            }
            case "invalid-seek": {
              enum6 = 34;
              break;
            }
            case "text-file-busy": {
              enum6 = 35;
              break;
            }
            case "cross-device": {
              enum6 = 36;
              break;
            }
            default: {
              if (e instanceof Error) {
                console.error(e);
              }
              throw new TypeError(`"${val6}" is not one of the cases of error-code`);
            }
          }
          dataView(memory0).setInt8(arg4 + 8, enum6, true);
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:filesystem/types@0.2.6", function="[method]descriptor.metadata-hash-at"][Instruction::Return]', {
        funcName: "[method]descriptor.metadata-hash-at",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline32(arg0, arg1, arg2) {
      var handle1 = arg0;
      var rep2 = handleTable1[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable1.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(InputStream4.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]input-stream.blocking-read"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]input-stream.blocking-read");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.blockingRead(BigInt.asUintN(64, arg1)) };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]input-stream.blocking-read"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant6 = ret;
      switch (variant6.tag) {
        case "ok": {
          const e = variant6.val;
          dataView(memory0).setInt8(arg2 + 0, 0, true);
          var val3 = e;
          var len3 = val3.byteLength;
          var ptr3 = realloc0(0, 0, 1, len3 * 1);
          var src3 = new Uint8Array(val3.buffer || val3, val3.byteOffset, len3 * 1);
          new Uint8Array(memory0.buffer, ptr3, len3 * 1).set(src3);
          dataView(memory0).setUint32(arg2 + 8, len3, true);
          dataView(memory0).setUint32(arg2 + 4, ptr3, true);
          break;
        }
        case "err": {
          const e = variant6.val;
          dataView(memory0).setInt8(arg2 + 0, 1, true);
          var variant5 = e;
          switch (variant5.tag) {
            case "last-operation-failed": {
              const e2 = variant5.val;
              dataView(memory0).setInt8(arg2 + 4, 0, true);
              if (!(e2 instanceof Error$1)) {
                throw new TypeError('Resource error: Not a valid "Error" resource.');
              }
              var handle4 = e2[symbolRscHandle];
              if (!handle4) {
                const rep = e2[symbolRscRep] || ++captureCnt0;
                captureTable0.set(rep, e2);
                handle4 = rscTableCreateOwn(handleTable0, rep);
              }
              dataView(memory0).setInt32(arg2 + 8, handle4, true);
              break;
            }
            case "closed": {
              dataView(memory0).setInt8(arg2 + 4, 1, true);
              break;
            }
            default: {
              throw new TypeError(`invalid variant tag value \`${JSON.stringify(variant5.tag)}\` (received \`${variant5}\`) specified for \`StreamError\``);
            }
          }
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]input-stream.blocking-read"][Instruction::Return]', {
        funcName: "[method]input-stream.blocking-read",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline33(arg0, arg1, arg2) {
      var handle1 = arg0;
      var rep2 = handleTable1[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable1.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(InputStream4.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]input-stream.read"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]input-stream.read");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.read(BigInt.asUintN(64, arg1)) };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]input-stream.read"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant6 = ret;
      switch (variant6.tag) {
        case "ok": {
          const e = variant6.val;
          dataView(memory0).setInt8(arg2 + 0, 0, true);
          var val3 = e;
          var len3 = val3.byteLength;
          var ptr3 = realloc0(0, 0, 1, len3 * 1);
          var src3 = new Uint8Array(val3.buffer || val3, val3.byteOffset, len3 * 1);
          new Uint8Array(memory0.buffer, ptr3, len3 * 1).set(src3);
          dataView(memory0).setUint32(arg2 + 8, len3, true);
          dataView(memory0).setUint32(arg2 + 4, ptr3, true);
          break;
        }
        case "err": {
          const e = variant6.val;
          dataView(memory0).setInt8(arg2 + 0, 1, true);
          var variant5 = e;
          switch (variant5.tag) {
            case "last-operation-failed": {
              const e2 = variant5.val;
              dataView(memory0).setInt8(arg2 + 4, 0, true);
              if (!(e2 instanceof Error$1)) {
                throw new TypeError('Resource error: Not a valid "Error" resource.');
              }
              var handle4 = e2[symbolRscHandle];
              if (!handle4) {
                const rep = e2[symbolRscRep] || ++captureCnt0;
                captureTable0.set(rep, e2);
                handle4 = rscTableCreateOwn(handleTable0, rep);
              }
              dataView(memory0).setInt32(arg2 + 8, handle4, true);
              break;
            }
            case "closed": {
              dataView(memory0).setInt8(arg2 + 4, 1, true);
              break;
            }
            default: {
              throw new TypeError(`invalid variant tag value \`${JSON.stringify(variant5.tag)}\` (received \`${variant5}\`) specified for \`StreamError\``);
            }
          }
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]input-stream.read"][Instruction::Return]', {
        funcName: "[method]input-stream.read",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline34(arg0, arg1) {
      var handle1 = arg0;
      var rep2 = handleTable2[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable2.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(OutputStream4.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]output-stream.check-write"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]output-stream.check-write");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.checkWrite() };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]output-stream.check-write"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant5 = ret;
      switch (variant5.tag) {
        case "ok": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg1 + 0, 0, true);
          dataView(memory0).setBigInt64(arg1 + 8, toUint64(e), true);
          break;
        }
        case "err": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg1 + 0, 1, true);
          var variant4 = e;
          switch (variant4.tag) {
            case "last-operation-failed": {
              const e2 = variant4.val;
              dataView(memory0).setInt8(arg1 + 8, 0, true);
              if (!(e2 instanceof Error$1)) {
                throw new TypeError('Resource error: Not a valid "Error" resource.');
              }
              var handle3 = e2[symbolRscHandle];
              if (!handle3) {
                const rep = e2[symbolRscRep] || ++captureCnt0;
                captureTable0.set(rep, e2);
                handle3 = rscTableCreateOwn(handleTable0, rep);
              }
              dataView(memory0).setInt32(arg1 + 12, handle3, true);
              break;
            }
            case "closed": {
              dataView(memory0).setInt8(arg1 + 8, 1, true);
              break;
            }
            default: {
              throw new TypeError(`invalid variant tag value \`${JSON.stringify(variant4.tag)}\` (received \`${variant4}\`) specified for \`StreamError\``);
            }
          }
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]output-stream.check-write"][Instruction::Return]', {
        funcName: "[method]output-stream.check-write",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline35(arg0, arg1, arg2, arg3) {
      var handle1 = arg0;
      var rep2 = handleTable2[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable2.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(OutputStream4.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      var ptr3 = arg1;
      var len3 = arg2;
      var result3 = new Uint8Array(memory0.buffer.slice(ptr3, ptr3 + len3 * 1));
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]output-stream.write"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]output-stream.write");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.write(result3) };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]output-stream.write"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant6 = ret;
      switch (variant6.tag) {
        case "ok": {
          const e = variant6.val;
          dataView(memory0).setInt8(arg3 + 0, 0, true);
          break;
        }
        case "err": {
          const e = variant6.val;
          dataView(memory0).setInt8(arg3 + 0, 1, true);
          var variant5 = e;
          switch (variant5.tag) {
            case "last-operation-failed": {
              const e2 = variant5.val;
              dataView(memory0).setInt8(arg3 + 4, 0, true);
              if (!(e2 instanceof Error$1)) {
                throw new TypeError('Resource error: Not a valid "Error" resource.');
              }
              var handle4 = e2[symbolRscHandle];
              if (!handle4) {
                const rep = e2[symbolRscRep] || ++captureCnt0;
                captureTable0.set(rep, e2);
                handle4 = rscTableCreateOwn(handleTable0, rep);
              }
              dataView(memory0).setInt32(arg3 + 8, handle4, true);
              break;
            }
            case "closed": {
              dataView(memory0).setInt8(arg3 + 4, 1, true);
              break;
            }
            default: {
              throw new TypeError(`invalid variant tag value \`${JSON.stringify(variant5.tag)}\` (received \`${variant5}\`) specified for \`StreamError\``);
            }
          }
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]output-stream.write"][Instruction::Return]', {
        funcName: "[method]output-stream.write",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline36(arg0, arg1) {
      var handle1 = arg0;
      var rep2 = handleTable2[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable2.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(OutputStream4.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]output-stream.blocking-flush"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]output-stream.blocking-flush");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.blockingFlush() };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]output-stream.blocking-flush"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant5 = ret;
      switch (variant5.tag) {
        case "ok": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg1 + 0, 0, true);
          break;
        }
        case "err": {
          const e = variant5.val;
          dataView(memory0).setInt8(arg1 + 0, 1, true);
          var variant4 = e;
          switch (variant4.tag) {
            case "last-operation-failed": {
              const e2 = variant4.val;
              dataView(memory0).setInt8(arg1 + 4, 0, true);
              if (!(e2 instanceof Error$1)) {
                throw new TypeError('Resource error: Not a valid "Error" resource.');
              }
              var handle3 = e2[symbolRscHandle];
              if (!handle3) {
                const rep = e2[symbolRscRep] || ++captureCnt0;
                captureTable0.set(rep, e2);
                handle3 = rscTableCreateOwn(handleTable0, rep);
              }
              dataView(memory0).setInt32(arg1 + 8, handle3, true);
              break;
            }
            case "closed": {
              dataView(memory0).setInt8(arg1 + 4, 1, true);
              break;
            }
            default: {
              throw new TypeError(`invalid variant tag value \`${JSON.stringify(variant4.tag)}\` (received \`${variant4}\`) specified for \`StreamError\``);
            }
          }
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]output-stream.blocking-flush"][Instruction::Return]', {
        funcName: "[method]output-stream.blocking-flush",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline37(arg0, arg1, arg2, arg3) {
      var handle1 = arg0;
      var rep2 = handleTable2[(handle1 << 1) + 1] & ~T_FLAG;
      var rsc0 = captureTable2.get(rep2);
      if (!rsc0) {
        rsc0 = Object.create(OutputStream4.prototype);
        Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1 });
        Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2 });
      }
      curResourceBorrows.push(rsc0);
      var ptr3 = arg1;
      var len3 = arg2;
      var result3 = new Uint8Array(memory0.buffer.slice(ptr3, ptr3 + len3 * 1));
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]output-stream.blocking-write-and-flush"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "[method]output-stream.blocking-write-and-flush");
      let ret;
      try {
        ret = { tag: "ok", val: rsc0.blockingWriteAndFlush(result3) };
      } catch (e) {
        ret = { tag: "err", val: getErrorPayload(e) };
      }
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]output-stream.blocking-write-and-flush"] [Instruction::CallInterface] (sync, @ post-call)');
      for (const rsc of curResourceBorrows) {
        rsc[symbolRscHandle] = void 0;
      }
      curResourceBorrows = [];
      endCurrentTask(0);
      var variant6 = ret;
      switch (variant6.tag) {
        case "ok": {
          const e = variant6.val;
          dataView(memory0).setInt8(arg3 + 0, 0, true);
          break;
        }
        case "err": {
          const e = variant6.val;
          dataView(memory0).setInt8(arg3 + 0, 1, true);
          var variant5 = e;
          switch (variant5.tag) {
            case "last-operation-failed": {
              const e2 = variant5.val;
              dataView(memory0).setInt8(arg3 + 4, 0, true);
              if (!(e2 instanceof Error$1)) {
                throw new TypeError('Resource error: Not a valid "Error" resource.');
              }
              var handle4 = e2[symbolRscHandle];
              if (!handle4) {
                const rep = e2[symbolRscRep] || ++captureCnt0;
                captureTable0.set(rep, e2);
                handle4 = rscTableCreateOwn(handleTable0, rep);
              }
              dataView(memory0).setInt32(arg3 + 8, handle4, true);
              break;
            }
            case "closed": {
              dataView(memory0).setInt8(arg3 + 4, 1, true);
              break;
            }
            default: {
              throw new TypeError(`invalid variant tag value \`${JSON.stringify(variant5.tag)}\` (received \`${variant5}\`) specified for \`StreamError\``);
            }
          }
          break;
        }
        default: {
          throw new TypeError("invalid variant specified for result");
        }
      }
      _debugLog('[iface="wasi:io/streams@0.2.6", function="[method]output-stream.blocking-write-and-flush"][Instruction::Return]', {
        funcName: "[method]output-stream.blocking-write-and-flush",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline38(arg0, arg1) {
      _debugLog('[iface="wasi:random/random@0.2.6", function="get-random-bytes"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "get-random-bytes");
      const ret = getRandomBytes(BigInt.asUintN(64, arg0));
      _debugLog('[iface="wasi:random/random@0.2.6", function="get-random-bytes"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      var val0 = ret;
      var len0 = val0.byteLength;
      var ptr0 = realloc0(0, 0, 1, len0 * 1);
      var src0 = new Uint8Array(val0.buffer || val0, val0.byteOffset, len0 * 1);
      new Uint8Array(memory0.buffer, ptr0, len0 * 1).set(src0);
      dataView(memory0).setUint32(arg1 + 4, len0, true);
      dataView(memory0).setUint32(arg1 + 0, ptr0, true);
      _debugLog('[iface="wasi:random/random@0.2.6", function="get-random-bytes"][Instruction::Return]', {
        funcName: "get-random-bytes",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline39(arg0) {
      _debugLog('[iface="wasi:filesystem/preopens@0.2.6", function="get-directories"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "get-directories");
      const ret = getDirectories();
      _debugLog('[iface="wasi:filesystem/preopens@0.2.6", function="get-directories"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      var vec3 = ret;
      var len3 = vec3.length;
      var result3 = realloc0(0, 0, 4, len3 * 12);
      for (let i = 0; i < vec3.length; i++) {
        const e = vec3[i];
        const base = result3 + i * 12;
        var [tuple0_0, tuple0_1] = e;
        if (!(tuple0_0 instanceof Descriptor2)) {
          throw new TypeError('Resource error: Not a valid "Descriptor" resource.');
        }
        var handle1 = tuple0_0[symbolRscHandle];
        if (!handle1) {
          const rep = tuple0_0[symbolRscRep] || ++captureCnt6;
          captureTable6.set(rep, tuple0_0);
          handle1 = rscTableCreateOwn(handleTable6, rep);
        }
        dataView(memory0).setInt32(base + 0, handle1, true);
        var ptr2 = utf8Encode(tuple0_1, realloc0, memory0);
        var len2 = utf8EncodedLen;
        dataView(memory0).setUint32(base + 8, len2, true);
        dataView(memory0).setUint32(base + 4, ptr2, true);
      }
      dataView(memory0).setUint32(arg0 + 4, len3, true);
      dataView(memory0).setUint32(arg0 + 0, result3, true);
      _debugLog('[iface="wasi:filesystem/preopens@0.2.6", function="get-directories"][Instruction::Return]', {
        funcName: "get-directories",
        paramCount: 0,
        postReturn: false
      });
    }
    const handleTable3 = [T_FLAG, 0];
    const captureTable3 = /* @__PURE__ */ new Map();
    let captureCnt3 = 0;
    handleTables[3] = handleTable3;
    function trampoline40(arg0) {
      _debugLog('[iface="wasi:cli/terminal-stdin@0.2.6", function="get-terminal-stdin"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "get-terminal-stdin");
      const ret = getTerminalStdin();
      _debugLog('[iface="wasi:cli/terminal-stdin@0.2.6", function="get-terminal-stdin"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      var variant1 = ret;
      if (variant1 === null || variant1 === void 0) {
        dataView(memory0).setInt8(arg0 + 0, 0, true);
      } else {
        const e = variant1;
        dataView(memory0).setInt8(arg0 + 0, 1, true);
        if (!(e instanceof TerminalInput2)) {
          throw new TypeError('Resource error: Not a valid "TerminalInput" resource.');
        }
        var handle0 = e[symbolRscHandle];
        if (!handle0) {
          const rep = e[symbolRscRep] || ++captureCnt3;
          captureTable3.set(rep, e);
          handle0 = rscTableCreateOwn(handleTable3, rep);
        }
        dataView(memory0).setInt32(arg0 + 4, handle0, true);
      }
      _debugLog('[iface="wasi:cli/terminal-stdin@0.2.6", function="get-terminal-stdin"][Instruction::Return]', {
        funcName: "get-terminal-stdin",
        paramCount: 0,
        postReturn: false
      });
    }
    const handleTable4 = [T_FLAG, 0];
    const captureTable4 = /* @__PURE__ */ new Map();
    let captureCnt4 = 0;
    handleTables[4] = handleTable4;
    function trampoline41(arg0) {
      _debugLog('[iface="wasi:cli/terminal-stdout@0.2.6", function="get-terminal-stdout"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "get-terminal-stdout");
      const ret = getTerminalStdout();
      _debugLog('[iface="wasi:cli/terminal-stdout@0.2.6", function="get-terminal-stdout"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      var variant1 = ret;
      if (variant1 === null || variant1 === void 0) {
        dataView(memory0).setInt8(arg0 + 0, 0, true);
      } else {
        const e = variant1;
        dataView(memory0).setInt8(arg0 + 0, 1, true);
        if (!(e instanceof TerminalOutput2)) {
          throw new TypeError('Resource error: Not a valid "TerminalOutput" resource.');
        }
        var handle0 = e[symbolRscHandle];
        if (!handle0) {
          const rep = e[symbolRscRep] || ++captureCnt4;
          captureTable4.set(rep, e);
          handle0 = rscTableCreateOwn(handleTable4, rep);
        }
        dataView(memory0).setInt32(arg0 + 4, handle0, true);
      }
      _debugLog('[iface="wasi:cli/terminal-stdout@0.2.6", function="get-terminal-stdout"][Instruction::Return]', {
        funcName: "get-terminal-stdout",
        paramCount: 0,
        postReturn: false
      });
    }
    function trampoline42(arg0) {
      _debugLog('[iface="wasi:cli/terminal-stderr@0.2.6", function="get-terminal-stderr"] [Instruction::CallInterface] (async? sync, @ enter)');
      const _interface_call_currentTaskID = startCurrentTask(0, false, "get-terminal-stderr");
      const ret = getTerminalStderr();
      _debugLog('[iface="wasi:cli/terminal-stderr@0.2.6", function="get-terminal-stderr"] [Instruction::CallInterface] (sync, @ post-call)');
      endCurrentTask(0);
      var variant1 = ret;
      if (variant1 === null || variant1 === void 0) {
        dataView(memory0).setInt8(arg0 + 0, 0, true);
      } else {
        const e = variant1;
        dataView(memory0).setInt8(arg0 + 0, 1, true);
        if (!(e instanceof TerminalOutput2)) {
          throw new TypeError('Resource error: Not a valid "TerminalOutput" resource.');
        }
        var handle0 = e[symbolRscHandle];
        if (!handle0) {
          const rep = e[symbolRscRep] || ++captureCnt4;
          captureTable4.set(rep, e);
          handle0 = rscTableCreateOwn(handleTable4, rep);
        }
        dataView(memory0).setInt32(arg0 + 4, handle0, true);
      }
      _debugLog('[iface="wasi:cli/terminal-stderr@0.2.6", function="get-terminal-stderr"][Instruction::Return]', {
        funcName: "get-terminal-stderr",
        paramCount: 0,
        postReturn: false
      });
    }
    let exports3;
    function trampoline2(handle) {
      const handleEntry = rscTableRemove(handleTable5, handle);
      if (handleEntry.own) {
        const rsc = captureTable5.get(handleEntry.rep);
        if (rsc) {
          if (rsc[symbolDispose3]) rsc[symbolDispose3]();
          captureTable5.delete(handleEntry.rep);
        } else if (DirectoryEntryStream2[symbolCabiDispose]) {
          DirectoryEntryStream2[symbolCabiDispose](handleEntry.rep);
        }
      }
    }
    function trampoline3(handle) {
      const handleEntry = rscTableRemove(handleTable6, handle);
      if (handleEntry.own) {
        const rsc = captureTable6.get(handleEntry.rep);
        if (rsc) {
          if (rsc[symbolDispose3]) rsc[symbolDispose3]();
          captureTable6.delete(handleEntry.rep);
        } else if (Descriptor2[symbolCabiDispose]) {
          Descriptor2[symbolCabiDispose](handleEntry.rep);
        }
      }
    }
    function trampoline4(handle) {
      const handleEntry = rscTableRemove(handleTable2, handle);
      if (handleEntry.own) {
        const rsc = captureTable2.get(handleEntry.rep);
        if (rsc) {
          if (rsc[symbolDispose3]) rsc[symbolDispose3]();
          captureTable2.delete(handleEntry.rep);
        } else if (OutputStream4[symbolCabiDispose]) {
          OutputStream4[symbolCabiDispose](handleEntry.rep);
        }
      }
    }
    function trampoline5(handle) {
      const handleEntry = rscTableRemove(handleTable0, handle);
      if (handleEntry.own) {
        const rsc = captureTable0.get(handleEntry.rep);
        if (rsc) {
          if (rsc[symbolDispose3]) rsc[symbolDispose3]();
          captureTable0.delete(handleEntry.rep);
        } else if (Error$1[symbolCabiDispose]) {
          Error$1[symbolCabiDispose](handleEntry.rep);
        }
      }
    }
    function trampoline6(handle) {
      const handleEntry = rscTableRemove(handleTable1, handle);
      if (handleEntry.own) {
        const rsc = captureTable1.get(handleEntry.rep);
        if (rsc) {
          if (rsc[symbolDispose3]) rsc[symbolDispose3]();
          captureTable1.delete(handleEntry.rep);
        } else if (InputStream4[symbolCabiDispose]) {
          InputStream4[symbolCabiDispose](handleEntry.rep);
        }
      }
    }
    function trampoline8(handle) {
      const handleEntry = rscTableRemove(handleTable3, handle);
      if (handleEntry.own) {
        const rsc = captureTable3.get(handleEntry.rep);
        if (rsc) {
          if (rsc[symbolDispose3]) rsc[symbolDispose3]();
          captureTable3.delete(handleEntry.rep);
        } else if (TerminalInput2[symbolCabiDispose]) {
          TerminalInput2[symbolCabiDispose](handleEntry.rep);
        }
      }
    }
    function trampoline9(handle) {
      const handleEntry = rscTableRemove(handleTable4, handle);
      if (handleEntry.own) {
        const rsc = captureTable4.get(handleEntry.rep);
        if (rsc) {
          if (rsc[symbolDispose3]) rsc[symbolDispose3]();
          captureTable4.delete(handleEntry.rep);
        } else if (TerminalOutput2[symbolCabiDispose]) {
          TerminalOutput2[symbolCabiDispose](handleEntry.rep);
        }
      }
    }
    Promise.all([module0, module1, module2, module3]).catch(() => {
    });
    ({ exports: exports0 } = yield instantiateCore(yield module2));
    ({ exports: exports1 } = yield instantiateCore(yield module0, {
      wasi_snapshot_preview1: {
        args_get: exports0["1"],
        args_sizes_get: exports0["2"],
        clock_res_get: exports0["5"],
        clock_time_get: exports0["6"],
        environ_get: exports0["3"],
        environ_sizes_get: exports0["4"],
        fd_close: exports0["7"],
        fd_fdstat_get: exports0["8"],
        fd_fdstat_set_flags: exports0["9"],
        fd_filestat_get: exports0["10"],
        fd_prestat_dir_name: exports0["12"],
        fd_prestat_get: exports0["11"],
        fd_read: exports0["13"],
        fd_readdir: exports0["14"],
        fd_seek: exports0["15"],
        fd_write: exports0["0"],
        path_filestat_get: exports0["16"],
        path_open: exports0["17"],
        path_remove_directory: exports0["18"],
        path_unlink_file: exports0["19"],
        proc_exit: exports0["20"],
        random_get: exports0["21"]
      }
    }));
    ({ exports: exports2 } = yield instantiateCore(yield module1, {
      __main_module__: {
        _start: exports1._start
      },
      env: {
        memory: exports1.memory
      },
      "wasi:cli/environment@0.2.6": {
        "get-arguments": exports0["22"],
        "get-environment": exports0["23"]
      },
      "wasi:cli/exit@0.2.6": {
        exit: trampoline12
      },
      "wasi:cli/stderr@0.2.6": {
        "get-stderr": trampoline7
      },
      "wasi:cli/stdin@0.2.6": {
        "get-stdin": trampoline10
      },
      "wasi:cli/stdout@0.2.6": {
        "get-stdout": trampoline11
      },
      "wasi:cli/terminal-input@0.2.6": {
        "[resource-drop]terminal-input": trampoline8
      },
      "wasi:cli/terminal-output@0.2.6": {
        "[resource-drop]terminal-output": trampoline9
      },
      "wasi:cli/terminal-stderr@0.2.6": {
        "get-terminal-stderr": exports0["51"]
      },
      "wasi:cli/terminal-stdin@0.2.6": {
        "get-terminal-stdin": exports0["49"]
      },
      "wasi:cli/terminal-stdout@0.2.6": {
        "get-terminal-stdout": exports0["50"]
      },
      "wasi:clocks/monotonic-clock@0.2.6": {
        now: trampoline1,
        resolution: trampoline0
      },
      "wasi:clocks/wall-clock@0.2.6": {
        now: exports0["25"],
        resolution: exports0["24"]
      },
      "wasi:filesystem/preopens@0.2.6": {
        "get-directories": exports0["48"]
      },
      "wasi:filesystem/types@0.2.6": {
        "[method]descriptor.append-via-stream": exports0["36"],
        "[method]descriptor.get-flags": exports0["26"],
        "[method]descriptor.get-type": exports0["37"],
        "[method]descriptor.metadata-hash": exports0["39"],
        "[method]descriptor.metadata-hash-at": exports0["40"],
        "[method]descriptor.open-at": exports0["31"],
        "[method]descriptor.read-directory": exports0["28"],
        "[method]descriptor.read-via-stream": exports0["34"],
        "[method]descriptor.remove-directory-at": exports0["32"],
        "[method]descriptor.stat": exports0["38"],
        "[method]descriptor.stat-at": exports0["30"],
        "[method]descriptor.unlink-file-at": exports0["33"],
        "[method]descriptor.write-via-stream": exports0["35"],
        "[method]directory-entry-stream.read-directory-entry": exports0["29"],
        "[resource-drop]descriptor": trampoline3,
        "[resource-drop]directory-entry-stream": trampoline2,
        "filesystem-error-code": exports0["27"]
      },
      "wasi:io/error@0.2.6": {
        "[resource-drop]error": trampoline5
      },
      "wasi:io/streams@0.2.6": {
        "[method]input-stream.blocking-read": exports0["41"],
        "[method]input-stream.read": exports0["42"],
        "[method]output-stream.blocking-flush": exports0["45"],
        "[method]output-stream.blocking-write-and-flush": exports0["46"],
        "[method]output-stream.check-write": exports0["43"],
        "[method]output-stream.write": exports0["44"],
        "[resource-drop]input-stream": trampoline6,
        "[resource-drop]output-stream": trampoline4
      },
      "wasi:random/random@0.2.6": {
        "get-random-bytes": exports0["47"]
      }
    }));
    memory0 = exports1.memory;
    realloc0 = exports2.cabi_import_realloc;
    ({ exports: exports3 } = yield instantiateCore(yield module3, {
      "": {
        $imports: exports0.$imports,
        "0": exports2.fd_write,
        "1": exports2.args_get,
        "10": exports2.fd_filestat_get,
        "11": exports2.fd_prestat_get,
        "12": exports2.fd_prestat_dir_name,
        "13": exports2.fd_read,
        "14": exports2.fd_readdir,
        "15": exports2.fd_seek,
        "16": exports2.path_filestat_get,
        "17": exports2.path_open,
        "18": exports2.path_remove_directory,
        "19": exports2.path_unlink_file,
        "2": exports2.args_sizes_get,
        "20": exports2.proc_exit,
        "21": exports2.random_get,
        "22": trampoline13,
        "23": trampoline14,
        "24": trampoline15,
        "25": trampoline16,
        "26": trampoline17,
        "27": trampoline18,
        "28": trampoline19,
        "29": trampoline20,
        "3": exports2.environ_get,
        "30": trampoline21,
        "31": trampoline22,
        "32": trampoline23,
        "33": trampoline24,
        "34": trampoline25,
        "35": trampoline26,
        "36": trampoline27,
        "37": trampoline28,
        "38": trampoline29,
        "39": trampoline30,
        "4": exports2.environ_sizes_get,
        "40": trampoline31,
        "41": trampoline32,
        "42": trampoline33,
        "43": trampoline34,
        "44": trampoline35,
        "45": trampoline36,
        "46": trampoline37,
        "47": trampoline38,
        "48": trampoline39,
        "49": trampoline40,
        "5": exports2.clock_res_get,
        "50": trampoline41,
        "51": trampoline42,
        "6": exports2.clock_time_get,
        "7": exports2.fd_close,
        "8": exports2.fd_fdstat_get,
        "9": exports2.fd_fdstat_set_flags
      }
    }));
    let run026Run;
    function run2() {
      _debugLog('[iface="wasi:cli/run@0.2.6", function="run"] [Instruction::CallWasm] (async? false, @ enter)');
      const _wasm_call_currentTaskID = startCurrentTask(0, false, "run026Run");
      const ret = run026Run();
      endCurrentTask(0);
      let variant0;
      switch (ret) {
        case 0: {
          variant0 = {
            tag: "ok",
            val: void 0
          };
          break;
        }
        case 1: {
          variant0 = {
            tag: "err",
            val: void 0
          };
          break;
        }
        default: {
          throw new TypeError("invalid variant discriminant for expected");
        }
      }
      _debugLog('[iface="wasi:cli/run@0.2.6", function="run"][Instruction::Return]', {
        funcName: "run",
        paramCount: 1,
        postReturn: false
      });
      const retCopy = variant0;
      if (typeof retCopy === "object" && retCopy.tag === "err") {
        throw new ComponentError(retCopy.val);
      }
      return retCopy.val;
    }
    run026Run = exports2["wasi:cli/run@0.2.6#run"];
    const run026 = {
      run: run2
    };
    return { run: run026, "wasi:cli/run@0.2.6": run026 };
  })();
  let promise, resolve, reject;
  function runNext(value) {
    try {
      let done;
      do {
        ({ value, done } = gen.next(value));
      } while (!(value instanceof Promise) && !done);
      if (done) {
        if (resolve) return resolve(value);
        else return value;
      }
      if (!promise) promise = new Promise((_resolve, _reject) => (resolve = _resolve, reject = _reject));
      value.then((nextVal) => done ? resolve() : runNext(nextVal), reject);
    } catch (e) {
      if (reject) reject(e);
      else throw e;
    }
  }
  const maybeSyncReturn = runNext(null);
  return promise || maybeSyncReturn;
}

// wasi-0.1-module-stub:src/js.wasm
var modulePaths = /* @__PURE__ */ new Map();
modulePaths.set("src/js.wasm.core.wasm", js_wasm_core_default);
modulePaths.set("src/js.wasm.core2.wasm", js_wasm_core2_default);
modulePaths.set("src/js.wasm.core3.wasm", js_wasm_core3_default);
modulePaths.set("src/js.wasm.core4.wasm", js_wasm_core4_default);

// src/worker.js
var moduleMap = /* @__PURE__ */ new Map();
function loader(name) {
  return moduleMap.get(name);
}
var magic = "=-=-=-=-=-=-= HERE BEGINS THE JSON =-=-=-=-=-=-=";
async function run(input) {
  const component = await instantiate(loader, new WASIShim().getImportObject());
  const program = `
    ${input}

    print("${magic}");
    print(os.file.readFile("/tmp/ion.json"));
  `;
  let stdout2 = "";
  let stderr2 = "";
  filesystem_exports._setFileData({
    dir: {
      "input.js": { source: new TextEncoder().encode(program) },
      "tmp": { dir: {} }
    }
  });
  cli_exports._setStdout({
    write(contents) {
      stdout2 += new TextDecoder().decode(contents);
    },
    blockingFlush() {
    }
  });
  cli_exports._setStderr({
    write(contents) {
      stderr2 += new TextDecoder().decode(contents);
    },
    blockingFlush() {
    }
  });
  cli_exports._setEnv({ "IONFLAGS": "logs" });
  cli_exports._setArgs(["js.wasm", "--fast-warmup", "input.js"]);
  try {
    component.run.run();
    let rawJSON = stdout2.slice(stdout2.indexOf(magic) + magic.length).trim();
    const ionJSON = JSON.parse(rawJSON ? rawJSON + "]}" : `{ "version": 1, "functions": [] }`);
    postMessage({
      ok: true,
      ionJSON,
      stdout: stdout2,
      stderr: stderr2
    });
  } catch (e) {
    if (e.exitError) {
      postMessage({
        ok: false,
        stdout: stdout2,
        stderr: stderr2
      });
    } else {
      postMessage({
        ok: false,
        stdout: stdout2,
        stderr: "Bug in this demo! See console for details."
      });
      throw e;
    }
  }
}
onmessage = (e) => {
  switch (e.data.action) {
    case "receiveModules":
      {
        moduleMap = e.data.moduleMap;
      }
      break;
    case "runProgram":
      {
        run(e.data.program);
      }
      break;
  }
};
//# sourceMappingURL=worker.js.map

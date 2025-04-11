---
layout: post
title: "5 Things You Might Not Know about Developing Self-Hosted Code"
author: "Bryan Thrall"
---

Self-hosted code is JavaScript code that SpiderMonkey uses to implement some of its intrinsic functions for JavaScript. Because it is written in JavaScript, it gets all the benefits of our JITs, like inlining and inline caches.

Even if you are just getting started with self-hosted code, you probably already know that it isn't quite the same as your typical, day-to-day JavaScript. You've probably already been pointed at the [SMDOC](https://searchfox.org/mozilla-central/rev/d602f8558872d133dc9240a01cd25d0898c58e5a/js/src/vm/SelfHosting.h#16), but here are a couple tips to make developing self-hosted code a little easier.

# 1. When you change self-hosted code, you need to build

When you make changes to SpiderMonkey's self-hosted JavaScript code, you will not automatically see your changes take effect in Firefox or the JS Shell.

SpiderMonkey's self-hosted code is split up into multiple files and functions to make it easier for developers to understand, but at runtime, SpiderMonkey loads it all from a single, compressed data stream. This means that all those files are gathered together into a single script file and compressed at build time.

To see your changes take effect, you must remember to build!

# 2. dbg()

Self-hosted JavaScript code is hidden from the JS Debugger, and it can be challenging to debug JS using a C++ debugger. You might want to try logging messages to `console.log()` to help you debug your code, but that is not available in self-hosted code!

In debug builds, you can print out messages and objects using [dbg()](https://searchfox.org/mozilla-central/rev/d602f8558872d133dc9240a01cd25d0898c58e5a/js/src/builtin/Utilities.js#16-21), which takes a single argument to print to stderr.

# 3. Specification step comments

If you are stuck trying to figure out how to implement a step in the JS specification or a proposal, you can see if SpiderMonkey has implemented a similar step elsewhere and base your implementation off that. We try to diligently comment our implementations with references to the specification, so there's a good chance you can find what you are looking for.

For example, if you need to use the specification function `CreateDataPropertyOrThrow()`, you can search for it ([SearchFox is a great tool for this](https://searchfox.org/mozilla-central/search?q=CreateDataPropertyOrThrow&path=js%2Fsrc%2Fbuiltin&case=false&regexp=false)) and discover that it is implemented in self-hosted code using `DefineDataProperty()`.

# 4. getSelfHostedValue()

If you want to explore how a self-hosted function works directly, you can use the JS Shell helper function [getSelfHostedValue()](https://searchfox.org/mozilla-central/rev/40da66b801b7dee3bdc77a06ac7de77bed1de3fc/js/src/shell/js.cpp#10406-10409).

We use this method to write many of our tests. For example, [unicode-extension-sequences.js](https://searchfox.org/mozilla-central/rev/40da66b801b7dee3bdc77a06ac7de77bed1de3fc/js/src/tests/non262/Intl/extensions/unicode-extension-sequences.js) checks the implementation of the self-hosted functions `startOfUnicodeExtensions()` and `endOfUnicodeExtensions()`.

You can also use `getSelfHostedValue()` to get C++ intrinsic functions, like how [toLength.js](https://searchfox.org/mozilla-central/rev/40da66b801b7dee3bdc77a06ac7de77bed1de3fc/js/src/tests/non262/extensions/toLength.js) tests [ToLength()](https://searchfox.org/mozilla-central/rev/40da66b801b7dee3bdc77a06ac7de77bed1de3fc/js/src/vm/SelfHosting.cpp#2247).

# 5. You can define your own self-hosted functions

You can write your own self-hosted functions and make them available in the JS Shell and XPC shell. For example, you could write a self-hosted function to print a formatted error message:

```js
  function report(msg) {
      dbg("|ERROR| " + msg + "|");
  }
```
Then, while you are setting up globals for your JS runtime, call `JS_DefineFunctions(cx, obj, funcs)`:

```cpp
  static const JSFunctionSpec funcs[] = {
      JS_SELF_HOSTED_FN("report", "report", 1, 0),
      JS_FS_END,
  };

  if (!JS_DefineFunctions(cx, globalObject, funcs)) {
    return false;
  }
```

The `JS_SELF_HOSTED_FN()` macro takes the following parameters:
1. `name` - The name you want your function to have in JS.
1. `selfHostedName` - The name of the self-hosted function.
1. `nargs` - Number of formal JS arguments to the self-hosted function.
1. `flags` - This is almost always 0, but could be any combination of [JSPROP_*](https://searchfox.org/mozilla-central/rev/3b95c8dbe724b10390c96c1b9dd0f12c873e2f2e/js/public/PropertyDescriptor.h#28-61).

Now, when you build the JS Shell or XPC Shell, you can call your function:

```js
js> report("BOOM!");          
Iterator.js#6: |ERROR| BOOM!|
```

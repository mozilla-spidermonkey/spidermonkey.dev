---
layout: post
title:  "Top Level Await Ships with Firefox 89"
author: Yulia Startsev
date:   2021-04-05 17:30:00 +0100
---

Firefox will ship Top Level Await by default starting in Firefox 89. This new feature introduces a capability to modules allowing programmers to do asynchronous work, such as fetching data, directly at the top level of any module.

For example, if you want to instantiate your file with some custom data, you can now do this:

```js
import process from "./api.js";

const response = await fetch("./data.json");
const parsedData = await response.json();

export process(parsedData);
```

This is much simpler and robust than previous solutions, such as:

```js
import { process } from "./some-module.mjs";
let output;
async function main() {
  const response = await fetch("./data.json");
  const parsedData = await response.json();
  output = process(parsedData);
}
main();
export { output };
```
... in which case, any consumer of this module would need check when the _output_ variable is bound.

If you are curious about this proposal, you can read more about it in the
[explainer](https://github.com/tc39/proposal-top-level-await). The
proposal is currently at stage 3, but we have high confidence in it going to stage 4.

Happy Hacking!

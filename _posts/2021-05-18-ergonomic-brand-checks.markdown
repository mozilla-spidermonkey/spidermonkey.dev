---
layout: post
title: "Ergonomic Brand Checks will ship with Firefox 90"
author: Matthew Gaudet
date: 2021-05-18 08:44:29 -0600
---

When programming with [Private Fields and methods][mdn], it can sometimes be desirable to check
if an object _has_ a given private field. While the semantics of private fields allow doing that
check by using `try...catch`, the [Ergonomic Brand checks proposal][proposal] provides a simpler syntax,
allowing one to simply write `#field in o`.

As an example, the following class uses ergonomic brand checks to provide a more helpful custom
error.

```js
class Scalar {
  #length = 0;

  add(s) {
    if (!(#length in s)) {
      throw new TypeError("Expected an instance of Scalar");
    }

    this.#length += s.#length;
  }
}
```

While the same effect could be accomplished with `try...catch`, it's much uglier, and also doesn't
work reliably in the presence of private getters which may possibly throw for different reasons.

This JavaScript language feature proposal is at [Stage 3 of the TC39 process][process],
and will ship in Firefox 90.

[mdn]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields
[proposal]: https://github.com/tc39/proposal-private-fields-in-in
[process]: https://tc39.es/process-document/

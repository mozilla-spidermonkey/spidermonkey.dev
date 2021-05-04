---
layout: post
title: "Private Fields and Methods ship with Firefox 90"
author: Matthew Gaudet
date: 2021-05-03 09:30:00 -0600
---

Firefox will ship [Private Fields][fields] and [Methods][methods] in Firefox 90. This new language syntax
allows programmers to have strict access control over their class internals. A private field can only be accessed
by code inside the class declaration.

```js
class PrivateDetails {
  #private_data = "I shouldn't be seen by others";

  #private_method { return "private data" }

  useData() {
    /.../.test(this.#private_data);

    var p = this.#private_method();
  }
}

var p = new PrivateDetails();
p.useData(); // OK
p.#private_data; // SyntaxError
```

This is the last remaining piece of the [Stage 3 Proposal, Class field declarations for JavaScript][proposal], which
has many more details about the design of private data.

[fields]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields
[methods]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields#private_methods
[proposal]: https://github.com/tc39/proposal-class-fields

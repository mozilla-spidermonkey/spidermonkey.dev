---
layout: post
title:  "JavaScript Import maps, Part 1: Introduction"
date:   2023-02-23 09:00:00 +0100
---
We recently shipped import maps in Firefox 108 and this article is the first in
a series that describes what they are and the problems they can solve. In this
first article, we will go through the background and basics of import maps and
follow up with a second article explaining more details of import maps.


## Background: JavaScript Modules

If you don’t know JavaScript modules, you can read the MDN docs for [JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
first, and there are also some related articles on Mozilla Hacks like [ES6 In Depth: Modules](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/)
and [ES modules: A cartoon deep-dive](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/).
If you are already familiar with them, then you are probably familiar with [static import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
and [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import).
As a quick refresher:


```
<!-- In a module script you can do a static import like so: -->
<script type="module">
import lodash from "/node_modules/lodash-es/lodash.js";
</script>

<!-- In a classic or a module script,
you can do a dynamic import like so: -->
<script>
import("/node_modules/lodash-es/lodash.js");
</script>
```


Notice that in both static import and dynamic import above, you need to provide
a string literal with either the absolute path or the relative path of the
module script, so the [host](https://tc39.es/ecma262/#host) can know where the
module script is located.

This string literal is called [the Module Specifier](https://tc39.es/ecma262/#prod-ModuleSpecifier)
in ECMAScript specification[^1].

One subtle thing about the **Module Specifier** is that each host has its own
module resolution algorithm to interpret the module specifier. For example,
Node.js has its own [Resolver Algorithm Specification](https://nodejs.org/api/esm.html#resolver-algorithm-specification),
whereas browsers have their [Resolve A Module Specifier Specification](https://html.spec.whatwg.org/multipage/webappapis.html#resolve-a-module-specifier).
The main difference between the two algorithms is the resolution of the **bare
specifier**, which is a module specifier that is neither an absolute URL nor a
relative URL. Before continuing to explain bare specifiers, we need to know
some history first.


### History: Modules between Node.js and ECMAScript

When Node.js v4 was released, it adopted an existing server-side-JavaScript
framework called “CommonJS” as its module system, which had various ways to
import a module. For example
* Using a relative path or an absolute path.
* Using a core module name, like require(“http”)
* Using file modules.
* Using folders as modules.

Details can be found in [Node.js v4.x modules documentation](https://nodejs.org/docs/latest-v4.x/api/modules.html).

Later, when ECMAScript Modules were merged into the HTML specification, only
relative URLs and absolute URLs were allowed. Bare specifiers were excluded at
that time (see [HTML PR 443](https://github.com/whatwg/html/pull/443)) because
CommonJS was originally designed for server side applications instead of web
browsers and bare specifiers could cause some security concerns and would
require a more complex design in other web standards.

After ECMAScript Modules became an official standard, Node.js wanted to ship
support for them so they added an implementation in [Node.js v12 modules](https://nodejs.org/docs/latest-v12.x/api/esm.html).
This implementation also borrowed from CommonJS including the concept of a bare
specifier. See [import specifier](https://nodejs.org/api/esm.html#import-specifiers)
from Node.js documentation.


### Resolving a bare specifier

The following code will import a built-in module `'lodash'` in Node.js.
However, **it won’t work for browsers that don’t support import maps** unless
you use a transpiler like webpack or Babel.


```
// Import a bare specifier 'lodash'.
// Valid on Node.js, but for browsers that don't support Import maps,
// it will fail.
import lodash from 'lodash';
```


This is a pretty common issue for web developers: they want to use a JavaScript
module in their website, but it turns out the module is a Node.js module so
they now need to spend time to transpile it.

**Import maps are designed to reduce the friction of resolving module
specifiers between different Javascript runtimes like Node.js and browsers**.
It not only saves us from using bundlers like webpack or Babel but also gives
us the ergonomics of bare specifiers while ensuring that the security
properties of URLs are preserved. This is what the proposal does at a
fundamental level for most use cases.


## Introduction to import maps

Let’s explain what import maps are and how you should use them in your web
apps.


### Module Specifier remapping

With import maps now supported in Firefox, you can do the following:


```
<!-- In a module script. -->
<script type="module">
import lodash from "lodash";
</script>

<!-- In a classic or module script. -->
<script>
import("lodash");
</script>

<script type="module">
import("lodash");
</script>
```


To make the resolution of `lodash` work in browsers, we need to provide the
location of the module `'lodash'`. This is where “Import maps” come into play.

To create an import map, you need to add a script tag whose type is
“**importmap**” to your HTML document[^2]. The body of the script tag is a JSON
object that maps the module specifier to the URL.


```
<!-- In the HTML document -->
<script type="importmap">
{
  "imports": {
     "lodash": "/node_modules/lodash-es/lodash.js"
  }
}
</script>
```


When the browser tries to resolve a _Module Specifier_, it will check if an
import map exists in the HTML document and try to get the corresponding URL of
the module specifier. If it doesn’t find one, it will try to resolve the
specifier as a URL.

In our example with the `"lodash"` library, it will try to find the entry whose
key is `"lodash"`, and get the value` "/node_modules/lodash-es/lodash.js"` from
the import map.

What about more complex use cases? For example, browsers cache all files with
the same name so your websites will load faster. But what if we update our
module? In this case, we would have to do “cache busting”. That is, we rename
the file we are loading. The name will be appended with the hash of the file’s
content. In the above example, `lodash.js` could become `lodash-1234abcd.js`,
where the `"1234abcd"` is the hash of the content of lodash.js.


```
<!-- Static import -->
<script type="module">
import lodash from "/node_modules/lodash-es/lodash-1234abcd.js";
</script>

<!-- Dynamic import -->
<script>
import("/node_modules/lodash-es/lodash-1234abcd.js");
</script>
```


This is quite a pain to do by hand! Instead of modifying all the files that
would import the cached module script, you could use import maps to keep track
of the hashed module script so you only have to modify it once and can use the
module specifier in multiple places without modification.


```
<!--
An import map example to map the module specifier to the actual cached file
in the HTML document
-->
<script type="importmap">
{
  "imports": {
    "lodash": "/node_modules/lodash-es/lodash-1234abcd.js"
  }
}
</script>
```


### Prefix remapping via a trailing slash ‘/’

Import maps also allow you to remap the prefix of the module specifier,
provided that the entry in the import map ends with a trailing slash ‘**/**’.


```
<!--In the HTML document. -->
<script type="importmap">
{
  "imports": {
    "app/": "/js/app/"
  }
}
</script>

<!-- In a module script. -->
<script type="module">
import foo from "app/foo.js";
</script>
```


In this example, there is no entry `"app/foo.js"` in the import map. However,
there’s an entry `"app/"` (notice that it ends with a slash ‘**/**’), so the
`"app/foo.js"` will be resolved to `"/js/app/foo.js"`.

This feature is quite useful when the module contains several sub-modules, or
when you’re about to test multiple versions of the external module. For
example, the import map below contains two sub-modules: _feature_ and _app_.
And in the _app_ sub-module, we choose version 4.0. If the developer wants to
use another version of “`app"`, he or she can simply change that in the URL in
the `"app/"` entry.


```
<!-- In the HTML document -->
<script type="importmap">
{
  "imports": {
    "feature/": "/js/module/feature/",
    "app/": "/js/app@4.0/",
  }
}
</script>
```


### **Sub-folders need different versions of the external module.**

Import maps provide another mapping called “**scopes**”. It allows you to use
the specific mapping table according to the URL of the module script. For
example,


```
<!-- In the HTML document. -->
<script type="importmap">
{
  "scopes": {
    "/foo/": {
      "app.mjs": "/js/app-1.mjs"
    },
    "/bar/": {
      "app.mjs": "/js/app-2.mjs"
    }
  }
}
</script>
```


In this example, the _scopes_ map has two entries:
1. `"/foo/"` → A [Module specifier map](https://html.spec.whatwg.org/multipage/webappapis.html#module-specifier-map)
   which maps `"app.mjs"` to `"/js/app-1.mjs"`.
2. `"/bar/"` → A [Module specifier map](https://html.spec.whatwg.org/multipage/webappapis.html#module-specifier-map)
   which maps `"app.mjs"` to `"/js/app-2.mjs"`.

For the module scripts located in `"/foo/"`, the `"app.mjs"` will be resolved
to `"/js/app-1.mjs"`, whereas for those located in `"/bar/"`, `"app.mjs"` will
be resolved to `"/js/app-2.mjs"`.


```
// In /foo/foo.js
import app from "app.mjs"; // Will import "/js/app-1.mjs"
```


```
// In /bar/bar.js
import app from "app.mjs"; // Will import "/js/app-2.mjs"
```


This covers the basics of import maps, including its historical background, how
to use it and what problem it is trying to solve. In the following article we
will explain more details of import maps, including the validation of the
entries in the module specifier maps, the resolution precedence in import maps,
and the common problems when you use import maps.


<!-- Footnotes themselves at the bottom. -->
## Notes

[^1]: In Node.js, it’s called [import specifier](https://nodejs.org/api/esm.html#import-specifiers), but in ECMAScript, [ImportSpecifier](https://tc39.es/ecma262/#prod-ImportSpecifier) has a different meaning.
[^2]: Currently, external import maps are not supported, so you can only specify the import map in an HTML document.


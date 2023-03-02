---
layout: post
title:  "JavaScript Import maps, Part 2: In-Depth Exploration"
date:   2023-03-02 10:00:00 +0100
author: Yoshi Huang
---
We recently shipped import maps in Firefox 108. you might be wondering what
this new feature is and what problems it solves. In the [previous post](/blog/02/23/javascript-import-maps-part-1-introduction.html)
we introduced what import maps are and how they work, in this article we are
going to explore the feature in depth.


## Explanation in-depth

Let’s explain the terms first. The string literal `"app.mjs"` in the above
examples is called a [Module Specifier](https://tc39.es/ecma262/#prod-ModuleSpecifier) in ECMAScript,
and the map which maps `"app.mjs"` to a URL is called a [Module Specifier Map](https://html.spec.whatwg.org/multipage/webappapis.html#module-specifier-map).

An import map is an object with two optional items:
* **_imports_**, which is a _module specifier map_.
* **_scopes_**, which is a map of URLs to _module specifier maps_.

So an import map could be thought of as
* A top-level module specifier map called “**_imports_**”.
* A map of module specifier maps called “**_scopes_**”, which can override the
  top-level module specifier map according to the location of the referrer.

If we put it into a graph


```
Module Specifier Map:
  +------------------+-----------------+
  | Module Specifier |      URL        |
  +------------------+-----------------+
  |  ......          | ......          |
  +------------------+-----------------+
  |  foo             | https://foo.com |
  +------------------+-----------------+

Import Map:
  imports: Top-level Module Specifier Map
    +------------+------------------------+
    | URL        | Module Specifier Map   |
    +------------+------------------------+
    | /          | ...                    |
    +------------+------------------------+

  scopes: Sub-directories Module Specifier Map
    +------------+------------------------+
    | URL        | Module Specifier Map   |
    +------------+------------------------+
    | /subdir1/  | ...                    |
    +------------+------------------------+
    | /subdir2/  | ...                    |
    +------------+------------------------+
```

### Validation of entries when parsing the import map

The format of the import map text has some requirements:
* A valid JSON string.
* The parsed JSON string must be a JSON object.
* The _imports_ and _scopes_ must be JSON objects as well.
* The values in _scopes_ must be JSON objects since they should be the type of
  _Module Specifier Maps_.

Failing to meet any one of the above requirements will result in a failure to
parse the import map, and a **SyntaxError**/**TypeError** will be thrown.[^1]


```
<!-- In the HTML document -->
<script>
window.onerror = (e) => {
  // SyntaxError will be thrown.
};
</script>
<script type="importmap">
NOT_A_JSON_STRING
</script>
```


```
<!-- In another HTML document -->
<script>
window.onerror = (e) => {
  // TypeError will be thrown.
};
</script>
<script type="importmap">
{
  "imports": "NOT_AN_OBJECT"
}
</script>
```


After the validation of JSON is done, parsing the import map will check whether
the values (URLs) in the Module specifier maps are valid.

If the map contains an invalid URL, the value of the entry in the module
specifier map will be marked as invalid. Later when the browser is trying to
resolve the module specifier, if the resolution result is the invalid value,
the resolution will fail and throw a **TypeError**.


```
<!-- In the HTML document -->
<script type="importmap">
{
  "imports": {
    "foo": "INVALID URL"
  }
}
</script>

<script>
// Notice that TypeError is thrown when trying to resolve the specifier
// with an invalid URL, not when parsing the import map.
import("foo").catch((err) => {
  // TypeError will be thrown.
});
</script>
```



### Resolution precedence

When the browser is trying to resolve the module specifier, it will find out
the most specific _Module Specifier Map_ to use, depending on the URL of the
referrer.

The precedence order of the _Module Specifier Maps_ from high to low is
1. **scopes**
2. **imports**

After the most specific _Module Specifier Map_ is determined, then the
resolving will iterate the parsed module specifier map to find out the best
match of the module specifier:
1. The entry whose key equals the module specifier.
2. The entry whose key has the **longest common prefix** with the module
   specifier provided the key ends with a trailing slash ‘/’.

```
<!-- In the HTML document -->
<script type="importmap">
{
  "imports": {
    "a/": "/js/test/a/",
    "a/b/": "/js/dir/b/"
  }
}
</script>
```


```
// In a module script.
import foo from "a/b/c.js"; // will import "/js/dir/b/c.js"
```


Notice that although the first entry `"a/"` in the import map could be used to
resolve `"a/b/c.js"`, there is a better match `"a/b/" `below since it has a
longer common prefix of the module specifier. So `"a/b/c.js"` will be resolved
to `"js/dir/b/c.js"`, instead of `"/js/test/a/b/c.js"`.

Details can be found in [Resolve A Module Specifier Specification](https://html.spec.whatwg.org/multipage/webappapis.html#resolve-a-module-specifier).


### Limitations of import maps
Currently, import maps have some limitations that may be lifted in the future:
* Only one import map is supported
    * Processing the first import map script tag will disallow the following
      import maps from being processed. Those import map script tags won’t be
      parsed and the onError handlers will be called. Even if the first import
      map fails to parse, later import maps won’t be processed.
* External import maps are not supported. See [issue 235](https://github.com/WICG/import-maps/issues/235).
* Import maps won’t be processed if module loading has already started. The
  module loading includes the following module loads:
    * Inline/External module load.
    * Static import/Dynamic import of Javascript modules.
    * Preload the module script in <modulepreload>.
* Not supported for workers/worklets. See [issue 2](https://github.com/WICG/import-maps/issues/2).


---


## Common problems when using import maps

There are some common problems when you use import maps **incorrectly**:
* Invalid JSON format
    * Check the **[Validation of entries when parsing the import map](#validation-of-entries-when-parsing-the-import-map)** section
      above. If the validation of the import map fails, a SyntaxError or
      TypeError will be thrown when parsing the import map text.
* The module specifier cannot be resolved, but the import map seems correct:
  This is one of the most common problems when using import maps. The import
  map tag needs to be loaded **before** any module load happens, check the
  **[Limitations of import maps](#limitations-of-import-maps)** section above.
* Unexpected resolution
    * See the **[Resolution precedence](#resolution-precedence)** part above, and check if there is
      another specifier key that takes higher precedence than the specifier key
      you thought.


---


## Specification link

The specification can be found in[ import maps](https://html.spec.whatwg.org/multipage/webappapis.html#import-maps).


---


## Acknowledgments

Many thanks to [Jon Coppeard](https://hacks.mozilla.org/author/jcoppeardmozilla-com/), [Yulia Startsev](https://hacks.mozilla.org/author/ystartsevmozilla-com/), and [Tooru Fujisawa](https://github.com/arai-a) for their contributions
to the modules implementations and code reviews on the import maps implementation in Spidermonkey.
In addition, great thanks to[ Domenic Denicola](https://github.com/domenic) for clarifying and explaining the specifications,
and to Steven De Tar for coordinating this project.

Finally, thanks to [Yulia Startsev](https://hacks.mozilla.org/author/ystartsevmozilla-com/), [Steve Fink](https://hacks.mozilla.org/author/sfink/), [Jon Coppeard](https://hacks.mozilla.org/author/jcoppeardmozilla-com/), and Will Medina
for reading a draft version of this post and giving their valuable feedback.


<!-- Footnotes themselves at the bottom. -->
## Notes

[^1]: If it isn’t a valid JSON string, a **SyntaxError** will be thrown. Otherwise, if the parsed strings are not of type JSON objects, a **TypeError** will be thrown.


---
layout: post
title:  "Making Teleporting Smarter"
date:   2025-02-19 12:00:00 -0600
author: Matthew Gaudet
---



_Recently I got to land a patch which touches a cool optimization, that I had to really make sure I understood deeply. As a result, I wrote a [huge commit message](https://phabricator.services.mozilla.com/D236961). I’d like to expand that message a touch here and turn it into a nice blog post._

_This post assumes roughly that you understand how Shapes work in the JavaScript object model, and how prototypical property lookup works in JavaScript. If you don’t understand that just yet, [this blog post by Matthias Bynens is a good start](https://mathiasbynens.be/notes/shapes-ics)._

This patch aims to mitigate a performance cliff that occurs when we have applications which shadow properties on the prototype chain or which mutate the prototype chain.  

The problem is that these actions currently break a property lookup optimization called "Shape Teleportation".

### What is Shape Teleporting?

Suppose you’re looking up some property `y` on an object `obj`, which has a prototype chain with 4 elements. Suppose `y` isn’t stored on `obj`, but instead is stored on some prototype object `B`, in slot 1.

<img src="/assets/img/teleport-1.png" alt="A diagram of shape teleporting" style="width: 45%; display: block; margin: auto;">

In order to get the value of this property, officially you have to walk from `obj` up to `B` to find the value of `y`. Of course, this would be inefficient, so what we do instead is attach an [inline cache](https://www.mgaudet.ca/technical/2023/10/16/cacheir-the-benefits-of-a-structured-representation-for-inline-caches) to make this lookup more efficient.

Now we have to guard against future mutation when creating an inline cache. A basic version of a cache for this lookup might look like: 

- Check `obj` still has the same shape.
- Check `obj`‘s prototype (`D`) still has the same shape.
- Check `D`‘s prototype (`C`) still has the same shape
- Check `C`’s prototype (`B`) still has the same shape.
- Load slot 1 out of B.

This is less efficient than we would like though. Imagine if instead of having 3 intermediate prototypes, there were 13 or 30? You’d have this long chain of prototype shape checking, which takes a long time! 

Ideally, what you’d like is to be able to simply say 
- Check `obj` still has the same shape.
- Check `B` still has the same shape
- Load slot 1 out of B.

The problem with doing this naively is “What if someone adds `y` as a property to `C`? With the faster guards, you’d totally miss that value, and as a result compute the wrong result. We don’t like wrong results. 

Shape Teleporting is the existing optimization which says that so long as you actively force a change of shape on objects in the prototype chain when certain modifications occur, then you **can** guard in inline-caches only on the shape of the receiver object and the shape of the holder object.

By forcing each shape to be changed, inline caches which have baked in assumptions about these objects will no longer succeed, and we'll take a slow path, potentially attaching a new IC if possible.

We must reshape in the following situations:

*  Adding a property to a prototype which shadows a property further up the prototype chain. In this circumstance, the object getting the new property will naturally reshape to account for the new property, but the old holder needs to be explicitly reshaped at this point, to avoid an inline cache jumping over the newly defined prototype.


<img src="/assets/img/teleport-2.png" alt="A diagram of shape teleporting" style="width: 45%; display: block; margin: auto;">

* Modifying the prototype of an object which exists on the prototype chain. For this case we need to invalidate the shape of the object being mutated (natural reshape due to changed prototype), as well as the shapes of all objects on the mutated object’s prototype chain. This is to invalidate all stubs which have teleported over the mutated object.


<img src="/assets/img/teleport-3.png" alt="A diagram of shape teleporting" style="width: 80%; display: block; margin: auto;">

Furthermore, we must avoid an "A-B-A" problem, where an object returns to a shape prior to prototype modification: for example, even if we re-shape `B`, what if code deleted and then re-added `y`, causing `B` to take on its old shape? Then the IC would start working again, even though the prototype chain may have been mutated!

Prior to this patch, Watchtower watches for prototype mutation and shadowing, and marks the shapes of the prototype objects involved with these operations as `InvalidatedTeleporting`. This means that property access with the objects involved can never more rely on the shape teleporting optimization. This also avoids the A-B-A problem as new shapes will always carry along the `InvalidatedTeleporting` flag.

This patch instead chooses to migrate an object shape to dictionary mode, or generate a new dictionary shape if it's already in dictionary mode. Using dictionary mode shapes works because all dictionary mode shapes are unique and never recycled. This ensures the ICs are no longer valid as expected, as well as handily avoiding the A-B-A problem.

The patch does keep the `InvalidatedTeleporting` flag to catch potentially ill-behaved sites that do lots of mutation and shadowing, avoiding having to reshape proto objects forever.

The patch also provides a preference to allow cross-comparison between old and new, however this patch defaults to dictionary mode teleportation.

Performance testing on micro-benchmarks shows large impact by allowing ICs to attach where they couldn't before, however Speedometer3 shows no real movement.

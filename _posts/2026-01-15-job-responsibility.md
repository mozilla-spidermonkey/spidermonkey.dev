---
layout: post
title: Flipping Responsibility for Jobs in SpiderMonkey
author: Matthew Gaudet
date: 2026-01-15 12:00:00 -0500
description: Changes are coming to job handling in SpiderMonkey
---

_This blog post is written both as a heads-up to embedders of SpiderMonkey, and an explanation of why the changes are coming_

As an embedder of SpiderMonkey one of the decisions you have to make is whether or not to provide your own implementation of the job queue. 

The responsibility of the job queue is to hold pending jobs for `Promise`s, which in the HTML spec are called ‘microtasks’. For embedders, the status quo of 2025 was two options:

1. Call [`JS::UseInternalJobQueues`](https://searchfox.org/firefox-main/rev/5917a9f2af3294b27a325371c5c499e7dd9554fd/js/src/jsfriendapi.h#203), and then at the appropriate point for your embedding, call [`JS::RunJobs`](https://searchfox.org/firefox-main/rev/5917a9f2af3294b27a325371c5c499e7dd9554fd/js/src/jsfriendapi.h#203). This uses an internal job queue and drain function.
2. Subclass and implement the [`JS::JobQueue` type](https://searchfox.org/firefox-main/rev/5917a9f2af3294b27a325371c5c499e7dd9554fd/js/public/Promise.h#34), storing and invoking your own jobs. An embedding might want to do this if they wanted to add their own jobs, or had particular needs for the shape of jobs and data carried alongside them.

The goal of this blog post is to indicate that SpiderMonkey’s handling of `Promise` jobs is changing over the next little while, and explain a bit of why.

If you’ve chosen to use the internal job queue, almost nothing should change for your embedding. If you’ve provided your own job queue, read on:

# What’s Changing

1. The actual type of a job from the JS engine is changing to be opaque.
2. The responsibility for actually *storing* the `Promise` jobs is moving from the embedding, even in the case of an embedding provided JobQueue.
3. As a result of (1), the interface to *run* a job from the queue is also changing.

I’ll cover this in a bit more detail, but a good chunk of the interface discussed is in [`MicroTask.h`](https://searchfox.org/firefox-main/rev/8e6b6cb1dd0fdd9838e2359219e2b8d3b84490b2/js/public/friend/MicroTask.h) (this link is to a specific revision because I expect the header to move). 

For most embeddings the changes turn out to be very mechanical. If you have specific challenges with your embedding please reach out. 

## Job Type

The type of a JS `Promise` job has been a `JSFunction`, and thus invoked with `JS::Call`. The job type is changing to an opaque type. The external interface to this type will be `JS::Value` (`typedef`’d as `JS::GenericMicroTask`);

This means that if you’re an embedder who had been storing your own tasks in the same queue as JS tasks you’ll still be able to, but you’ll need to use the queue access APIs in MicroTask.h. A queue entry is simply a `JS::Value` and so an arbitrary C address can be stored in it as a `JS::PrivateValue`. 

Jobs now are split into two types: `JSMicroTasks` (enqueued by the JS engine) and GenericMicroTasks (possibly JS engine provided, possibly embedding provided).

## Storage Responsibility 

It used to be that if an embedding provided its own JobQueue, we’d expect them to store the jobs and trace the queue. Now that an embedding finds that the queue is inside the engine, the model is changing to one where the embedding must ask the JS engine to store jobs it produces outside of promises if it would like to share the job queue.

## Running Micro Tasks

The basic loop of microtask execution now looks like this: 

```c++

JS::Rooted<JSObject*> executionGlobal(cx)
JS::Rooted<JS::GenericMicroTask> genericTask(cx);
JS::Rooted<JS::JSMicroTask> jsTask(cx);

while (JS::HasAnyMicroTasks(cx)) {
  genericTask = JS::DequeueNextMicroTask(cx); 

  if (JS::IsJSMicroTask(genericTask)) {
    jsMicroTask = JS::ToMaybeWrappedJSMicroTask(genericMicroTask);
    executionGlobal = JS::GetExecutionGlobalFromJSMicroTask(jsMicroTask);

    {
      AutoRealm ar(cx, executionGlobal);
      if (!JS::RunJSMicroTask(cx, jsMicroTask)) {
        // Handle job execution failure in the 
        // same way JS::Call failure would have been
        // handled
      }
    }

    continue;
  }

  // Handle embedding jobs as appropriate. 
}
```

The abstract separation of the execution global is required to handle cases with many compartments and complicated realm semantics (aka a web browser).

## An example

In order to see roughly what the changes would look like, I attempted to patch [GJS](https://gitlab.gnome.org/GNOME/gjs/), the GNOME JS embedding which uses SpiderMonkey. 

The patch is [here](https://gist.github.com/mgaudet/ae38a457d7d26b07f599e3f13f3b57e0). It doesn’t build due to other incompatibilities I found, but this is the rough shape of a patch for an embedding. As you can see, it’s fairly self contained with not too much work to be done.  

# Why Change?

In a word, performance. The previous form of `Promise` job management is very heavyweight with lots of overhead, causing performance to suffer.

The changes made here allow us to make SpiderMonkey quite a bit faster for dealing with `Promise`s, and unlock the potential to get even faster.

## How do the changes help? 

Well, perhaps the most important change here is making the job representation opaque. What this allows us to do is use pre-existing objects as stand-ins for the jobs. This means that rather than having to allocate a new object for every job (which is costly) we can some of the time actually allocate nothing, simply enqueing an existing job with enough information to run.

Owning the queue will also allow us to choose the most efficient data structure for JS execution, potentially changing opaquely in the future as we find better choices.

Empirically, changing from the old microtask queue system to the new in Firefox led to an improvement of up to 45% on `Promise` heavy microbenchmarks.

# Is this it? 

I do not think this is the end of the story for changes in this area. I plan further investment. Aspirationally I would like this all to be stabilized by the next ESR release which is [Firefox 153, which will ship to beta in June](https://whattrainisitnow.com/calendar/), but only time will tell what we can get done.

Future changes I can predict are things like 

1. Renaming `JS::JobQueue` which is now more of a ‘jobs interface’
2. Renaming the MicroTask header to be less HTML specific

However, I can also imagine making more changes in the pursuit of performance.

## What's the bug for this work

You can find most of the work related to this under [Bug 1983153 (sm-µ-task)](https://bugzilla.mozilla.org/show_bug.cgi?id=1983153)

# An Apology 

My apologies to those embedders who will have to do some work during this transition period. Thank you for sticking with SpiderMonkey!
---
layout: post
title: "Implementing Iterator.range in SpiderMonkey"
date: 2025-02-26 10:00:00 +0300
author: "Serah Nderi"
---

In October 2024, I joined Outreachy as an Open Source contributor and in December 2024, I joined Outreachy as an intern working with Mozilla. My role was to implement the [TC39 Range Proposal](https://tc39.es/proposal-iterator.range/#sec-iteration) in the SpiderMonkey JavaScript engine.
`Iterator.range `is a new built-in method proposed for JavaScript iterators that allows generating a sequence of numbers within a specified range. It functions similarly to Python's range, providing an easy and efficient way to iterate over a series of values:

```javascript
for (const i of Iterator.range(0, 43)) console.log(i); // 0 to 42
```

But also things like:

```javascript
function* even() {
  for (const i of Iterator.range(0, Infinity)) if (i % 2 === 0) yield i;
}
```

In this blog post, we will explore the implementation of Iterator.range in the SpiderMonkey JavaScript engine.

## Understanding the Implementation

When I started working on `Iterator.range`, the initial implementation had been done, ie; adding a preference for the proposal and making the builtin accessible in the JavaScript shell.

The `Iterator.range` simply returned `false`, a stub indicating that the actual implementation of `Iterator.range` was under development or not fully implemented, which is where I came in. As a start, I created a `CreateNumericRangeIterator` function that delegates to the `Iterator.range` function. Following that, I implemented the first three steps within the Iterator.range function. Next, I initialised variables and parameters for the `NUMBER-RANGE` data type in the `CreateNumericRangeIteratorfunction`.

I focused on implementing sequences that increase by one, such as `Iterator.range(0, 10)`.Next, I created an `IteratorRangeGenerator*` function (ie, step 18 of the Range proposal), that when called doesn't execute immediately, but returns a generator object which follows the iterator protocol. Inside the generator function you have `yield` statements which represents where the function suspends its execution and provides value back to the caller. Additionaly, I updated the `CreateNumericRangeIterator` function to invoke `IteratorRangeGenerator*` with the appropriate arguments, aligning with Step 19 of the specification, and added tests to verify its functionality.

The generator will pause at each `yield`, and will not continue until the `next` method is called on the generator object that is created.
The `NumericRangeIteratorPrototype` (Step 27.1.4.2 of the proposal) is the object that holds the `iterator prototype` for the Numeric range iterator. The `next()` method is added to the `NumericRangeIteratorPrototype`, when you call the `next()` method on an object created from `NumericRangeIteratorPrototype`, it doesn't directly return a value, but it makes the generator `yield` the `next` value in the series, effectively resuming the suspended generator.

The first time you invoke `next()` on the generator object created via `IteratorRangeGenerator*`, the generator will run up to the first `yield` statement and return the first value. When you invoke `next()` again, the`NumericRangeIteratorNext()` will be called.

This method uses `GeneratorResume(this)`, which means the generator will pick up right where it left off, continuing to iterate the next `yield` statement or until iteration ends.

## Generator Alternative

After discussions with my mentors Daniel and Arai, I transitioned from a generator-based implementation to a more efficient slot-based approach. This change involved defining `slots` to store the state necessary for computing the next value. The reasons included:

- Efficiency: Directly managing iteration state is faster than relying on generator functions.
- Simplified Implementation: A slot-based approach eliminates the need for generator-specific handling, making the code more maintainable.
- Better Alignment with Other Iterators: Existing built-in iterators such as `StringIteratorPrototype` and `ArrayIteratorPrototype` do not use generators in their implementations.

## Perfomance and Benchmarks

To quantify the performance improvements gained by transitioning from a generator-based implementation to a slot-based approach, I conducted comparative benchmarks using a test in the current bookmarks/central, and in the revision that used generator-based approach. My benchmark tested two key scenarios:

- Floating-point range iteration: Iterating through 100,000 numbers with a step of 0.1
- BigInt range iteration: Iterating through 1,000,000 BigInts with a step of 2

Each test was run 100 times to eliminate anomalies. The benchmark code was structured as follows:

```javascript
// Benchmark for Number iteration
var sum = 0;
for (var i = 0; i < 100; ++i) {
  for (num of Iterator.range(0, 100000, 0.1)) {
    sum += num;
  }
}
print(sum);

// Benchmark for BigInt iteration
var sum = 0n;
for (var i = 0; i < 100; ++i) {
  for (num of Iterator.range(0n, 1000000n, 2n)) {
    sum += num;
  }
}
print(sum);
```

## Results

| Implementation  | Execution Time (ms) | Improvement |
| --------------- | ------------------- | ----------- |
| Generator-based | 8,174.60            | -           |
| Slot-based      | 2,725.33            | 66.70%      |

The slot-based implementation completed the benchmark in just 2.7 seconds compared to 8.2 seconds for the generator-based approach. This represents a 66.7% reduction in execution time, or in other words, the optimized implementation is approximately 3 times faster.

## Challenges

Implementing BigInt support was straightforward from a specification perspective, but I encountered two blockers:

### 1. Handling Infinity Checks Correctly

The specification ensures that start is either a Number or a BigInt in steps 3.a and 4.a. However, step 5 states:

- If start is +∞ or -∞, throw a RangeError.

Despite following this, my implementation still threw an error stating that start must be finite. After investigating, I found that the issue stemmed from using a self-hosted isFinite function.

The specification requires isFinite to throw a TypeError for BigInt, but the self-hosted Number_isFinite returns false instead. This turned out to be more of an implementation issue than a specification issue.

See Github discussion [here](https://github.com/tc39/proposal-iterator.range/issues/74).

- Fix: Explicitly check that start is a number before calling isFinite:

```javascript
// Step 5: If start is +∞ or -∞, throw a RangeError.
if (typeof start === "number" && !Number_isFinite(start)) {
  ThrowRangeError(JSMSG_ITERATOR_RANGE_START_INFINITY);
}
```

### 2. Floating Point Precision Errors

When testing floating-point sequences, I encountered an issue where some decimal values were not represented exactly due to JavaScript's floating-point precision limitations. This caused incorrect test results.

There's a [GitHub issue](https://github.com/tc39/proposal-iterator.range/issues/64#issuecomment-1477257423) discussing this in depth. I implemented an approximatelyEqual function to compare values within a small margin of error.

- Fix: Using approximatelyEqual in tests:

```javascript
const resultFloat2 = Array.from(Iterator.range(0, 1, 0.2));
approximatelyEqual(resultFloat2, [0, 0.2, 0.4, 0.6, 0.8]);
```

This function ensures that minor precision errors do not cause test failures, improving floating-point range calculations.

## Next Steps and Future Improvements

There are different stages a TC39 proposal goes through before it can be shipped. This [document](https://tc39.es/process-document/) shows the different stages that a proposal goes through from ideation to consumption. The Iterator.range proposal is currently at stage 1 which is the Draft stage. Ideally, the proposal should advance to stage 3 which means that the specification is stable and no changes to the proposal are expected, but some necessary changes may still occur due to web incompatibilities or feedback from production-grade implementations.

Currently, this implementation is in it's early stages of implementation, only built in Nightly and disabled by default until such a time the proposal is in stage 3 or 4 and no further revision to the specification can be made.

## Final Thoughts

Working on the `Iterator.range` implementation in SpiderMonkey has been a deeply rewarding experience. I learned how to navigate a large and complex codebase, collaborate with experienced engineers, and translate a formal specification into an optimized, real-world implementation. The transition from a generator-based approach to a slot-based one was a significant learning moment, reinforcing the importance of efficiency in JavaScript engine internals.

Beyond technical skills, I gained a deeper appreciation for the standardization process in JavaScript. The experience highlighted how proposals evolve through real-world feedback, and how early-stage implementations help shape their final form.

As `Iterator.range` continues its journey through the TC39 proposal stages, I look forward to seeing its adoption in JavaScript engines and the impact it will have on developers. I hope this post provides useful insights into SpiderMonkey development and encourages others to contribute to open-source projects and JavaScript standardization efforts.

If you'd like to read more, here are my blog posts that I made during the project:

- [Decoding Open Source: Vocabulary I've Learned on My Outreachy Journey](https://dev.to/mundianderi/decoding-open-source-vocabulary-ive-learned-on-my-outreachy-journey-34o4)
- [Mid-Internship Progress Report: Achievements and Goals Ahead](https://dev.to/mundianderi/mid-internship-progress-report-achievements-and-goals-ahead-4jif)
- [Navigating TC39 Proposals: From Error Handling to Iterator.range](https://dev.to/mundianderi/navigating-tc39-proposals-from-error-handling-to-iteratorrange-306a)

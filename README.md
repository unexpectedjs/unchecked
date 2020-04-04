# Unchecked

[![NPM version](https://badge.fury.io/js/unchecked.svg)](http://badge.fury.io/js/unchecked)
[![Build Status](https://travis-ci.org/unexpectedjs/unchecked.svg?branch=master)](https://travis-ci.org/unexpectedjs/unchecked)
[![Dependency Status](https://david-dm.org/unexpectedjs/unchecked.svg)](https://david-dm.org/unexpectedjs/unchecked)

Property based testing made easy!

This library provides a function that you can use for property based testing in
any JavaScript testing framework and with any assertion library you like. The
idea is that it should be possible to mix property based testing and normal
unit-tests using the same tool chain.

This library is build to work together with
[chance-generators](https://sunesimonsen.github.io/chance-generators/) which
provides a huge range of composable generators that supports
[shrinking](https://sunesimonsen.github.io/chance-generators/api/iterator/#shrink-value-).

If the generators you supply supports
[shrinking](https://sunesimonsen.github.io/chance-generators/api/iterator/#shrink-value-),
then unchecked will try to shrink the error space as much as possible and
therefore provide much more precise error cases.

## Install

Install it with NPM or add it to your `package.json`:

```
$ npm install --save-dev unchecked chance-generators
```

and require the forall function from `unchecked`:

<!--unexpected-markdown evaluate:false-->

```js
const { forall } = require("unchecked");
```

## Usage

Let's imagine we wanted to sort arrays of numbers using this function:

```js
const sort = (arr) => [].concat(arr).sort();
```

Then we could write a test to ensure the that the resulting array is sorted.

First we need a way to check if the array is sorted:

```js
const isSorted = (array) =>
  array.every((x, i) => array.slice(i).every((y) => x <= y));
```

Now we are ready to write the tests:

```js
const assert = require("assert");
const util = require("util");
const { array, integer } = require("chance-generators");

// generate arrays of integers with length varying from 0 to 30
const numbers = array(integer);

forall(array(integer), (numbers) => {
  const sorted = sort(numbers);

  assert(isSorted(sorted), `expected ${util.inspect(sorted)} to be sorted`);
});
```

But that assumption is actually not true as the build-in sort functions is based
on converting items to strings and comparing them. So you will get the following
error:

```output
Found an error after 1 iteration, 58 additional errors found.
counterexample:

  Generated input: [ 10, 2 ]
  with: array({ itemGenerator: integer, min: 0, max: 30 })

  expected [ 10, 2 ] to be sorted
```

If we wanted to fix the problem, we would need to use a comparison function:

```js
const sortNumbers = (arr) => [].concat(arr).sort((a, b) => a - b);
```

```js
forall(array(integer), (numbers) => {
  const sorted = sortNumbers(numbers);

  assert(isSorted(sorted), `expected ${util.inspect(sorted)} to be sorted`);
});
```

## Asynchronous testing

Support for asynchronous testing by returning a promise from the subject
function:

<!--unexpected-markdown async:true-->

```js
const { PassThrough } = require("stream");
const zlib = require("zlib");
const getStream = require("get-stream");
const { string } = require("chance-generators");

return forall(string, (text) => {
  const inputStream = new PassThrough();

  inputStream.write(text);
  inputStream.end();

  const gzip = zlib.createGzip();
  const gunzip = zlib.createGunzip();

  inputStream.pipe(gzip).pipe(gunzip);

  return getStream(gunzip).then((transformed) => {
    assert.equal(transformed, text);
  });
});
```

## Options

- `maxIterations` (default 300): the number of iterations that the subject
  function it ran when no errors occur. You can control the default for this
  option by setting the environment variable `UNCHECKED_MAX_ITERATIONS`.
- `maxErrorIterations` (default 1000): the number of iterations unexpected-check
  can use to find a better error when an error occurs.
- `maxErrors` (default 201): the number of found errors before stopping the input
  shrinking process.

```js
forall(
  array(integer),
  {
    maxIterations: 100,
    maxErrorIterations: 100,
    maxErrors: 10,
  },
  (numbers) => {
    const sorted = sort(numbers);

    assert(isSorted(sorted), `expected ${util.inspect(sorted)} to be sorted`);
  }
);
```

```output
Found an error after 1 iteration, 9 additional errors found.
counterexample:

  Generated input: [ 52477443531195, 5636349332, 5783279309 ]
  with: array({ itemGenerator: integer, min: 0, max: 30 })

  expected [ 52477443531195, 5636349332, 5783279309 ] to be sorted
```

As you can see the input shrinking is worse with less iterations, but it will be
a bit faster.

## Source

The source for this plugin can be found on
[Github](https://github.com/unexpectedjs/unchecked).

## MIT License

Copyright (c) 2018 Sune Simonsen <sune@we-knowhow.dk>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

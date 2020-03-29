# @jacobbubu/pull-tee

[![Build Status](https://travis-ci.org/jacobbubu/pull-tee.svg)](https://travis-ci.org/jacobbubu/pull-tee)
[![Coverage Status](https://coveralls.io/repos/github/jacobbubu/pull-tee/badge.svg)](https://coveralls.io/github/jacobbubu/pull-tee)
[![npm](https://img.shields.io/npm/v/@jacobbubu/pull-tee.svg)](https://www.npmjs.com/package/@jacobbubu/pull-tee/)

> Rewritten [pull-tee](https://github.com/dominictarr/pull-tee) in TypeScript.

# pull-tee

feed a pull-stream into multiple sinks

## example

```ts
import * as pull from 'pull-stream'
import tee from '../src'
import * as assert from 'assert'

let a: number[] = []
let b: number[] = []

pull(
  pull.values([1, 2, 3, 4, 5]),
  tee(
    pull.collect((_, _a: number[]) => {
      a = _a
      if (b && a) assert.deepEqual(a, b)
    })
  ),
  pull.collect((_, _b: number[]) => {
    b = _b
    if (b && a) assert.deepEqual(a, b)
  })
)

console.log(a, b)
```

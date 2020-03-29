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

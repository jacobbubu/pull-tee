import * as pull from 'pull-stream'
import tee from '../src'

describe('basic', () => {
  it('tee', (done) => {
    let a: number[] = []
    let b: number[] = []
    const input = [1, 2, 3, 4, 5]

    const next = () => {
      expect(a).toEqual(b)
      if (a.length === input.length) done()
    }

    pull(
      pull.values(input),
      tee(
        pull.collect((_, _a: number[]) => {
          a = _a
          if (b.length > 0) next()
        })
      ),
      pull.collect((_, _b: number[]) => {
        b = _b
        if (a.length > 0) next()
      })
    )
  })

  it('tee2', (done) => {
    let a: number[] = []
    let b: number[] = []
    const input = [1, 2, 3, 4, 5]

    const next = () => {
      expect(a).toEqual(b)
      if (a.length === input.length) done()
    }

    pull(
      pull.values(input),
      tee([
        pull.collect((_, _a: number[]) => {
          a = _a
          if (b.length > 0) next()
        }),
      ]),
      pull.collect((_, _b: number[]) => {
        b = _b
        if (a.length > 0) next()
      })
    )
  })

  it('tee-async', (done) => {
    function randAsync(): pull.Through<number, number> {
      return pull.asyncMap((data, cb) => {
        setTimeout(() => {
          cb(null, data)
        }, Math.random() * 20)
      })
    }

    let a: number[] = []
    let b: number[] = []
    const input = [1, 2, 3, 4, 5]

    const next = () => {
      expect(a).toEqual(b)
      if (a.length === input.length) done()
    }

    pull(
      pull.values(input),
      tee(
        pull(
          randAsync(),
          pull.collect((_, _a: number[]) => {
            a = _a
            if (b.length > 0) next()
          })
        )
      ),
      randAsync(),
      pull.collect((_, _b: number[]) => {
        b = _b
        if (a.length > 0) next()
      })
    )
  })
})

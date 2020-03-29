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

  it('A sink aborted early', (done) => {
    let a: number[] = []
    let b: number[] = []
    const input = [1, 2, 3, 4, 5]
    const aStopAt = 3
    const bStopAt = 4

    const finished = () => {
      expect(a).toEqual(input.slice(0, aStopAt))
      expect(b).toEqual(input.slice(0, bStopAt))
      done()
    }

    const noop = () => {
      /* */
    }

    function shortSink(
      stopAt: number,
      sinkCb?: (err: any, data?: number[]) => void
    ): pull.Sink<number> {
      let count = 0
      const result: number[] = []
      return function (read) {
        const readCb: pull.SourceCallback<number> = (end, value) => {
          if (end === true) {
            return sinkCb?.(null, result)
          } else if (end) {
            return sinkCb?.(end)
          }
          count++
          if (count > stopAt) {
            read(true, noop)
            sinkCb?.(true, result)
          } else {
            result.push(value!)
            read(null, readCb)
          }
        }
        read(null, readCb)
      }
    }

    pull(
      pull.values(input),
      tee(
        shortSink(aStopAt, (_, _a) => {
          a = _a!
          if (b.length > 0) finished()
        })
      ),
      shortSink(bStopAt, (_, _b) => {
        b = _b!
        if (a.length > 0) finished()
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

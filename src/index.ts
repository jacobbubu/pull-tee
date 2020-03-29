import * as pull from 'pull-stream'

// TEE stream.
// this could be improved to allow streams to read ahead.
// this slows all streams to he slowest...
export default function <T>(sinks: pull.Sink<T> | pull.Sink<T>[]) {
  return function (read: pull.Source<any>) {
    let _sinks: pull.Sink<T>[]
    if (!Array.isArray(sinks)) {
      _sinks = [sinks]
    } else {
      _sinks = [...sinks]
    }

    let cbs: pull.SourceCallback<T>[] = []
    let l = sinks.length + 1

    const _read: pull.Source<T> = (abort, cb) => {
      // TBD: we have not process abort well
      cbs.push(cb)
      if (cbs.length < l) {
        return
      }

      read(null, function (err, data) {
        const _cbs = cbs
        cbs = []
        _cbs.forEach(function (cb) {
          cb(err, data)
        })
      })
    }

    _sinks.forEach((sink) => sink(_read))

    return _read
  }
}

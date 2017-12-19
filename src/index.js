import { effects } from 'redux-saga'

const delayFn = effects.delay(0).CALL.fn

const sagaDelayMock = () => {
  const middleware = next => effect => {
    if (effect.CALL != null && effect.CALL.fn === delayFn) {
      const meta = {
        length: effect.CALL.args[0],
        next,
      }
      if (middleware.waiting.length === 0) {
        middleware.unacknowledgedDelay = meta
      } else {
        for (const resolveFn of middleware.waiting) {
          resolveFn(meta)
        }
        middleware.waiting = []
      }
    } else {
      return next(effect)
    }
  }
  middleware.unacknowledgedDelay = null
  middleware.waiting = []
  middleware.waitForDelay = () => new Promise((resolve, reject) => {
    if (middleware.unacknowledgedDelay == null) {
      middleware.waiting.push(resolve)
    } else {
      resolve(middleware.unacknowledgedDelay)
    }
  })
  return middleware
}

export default sagaDelayMock

import SagaTester from 'redux-saga-tester'
import { effects } from 'redux-saga'
import util from 'util'

import sagaDelayMock from '../src/'

// copied from the delay source. Used to create asyncronous conditions
// without using the delay fn itself.
const setTimeoutPromise = (ms, val = true) => {
  let timeoutId
  const promise = new Promise(resolve => {
    timeoutId = setTimeout(() => resolve(val), ms)
  })

  return promise
}

const {
  delay,
  put,
  takeEvery,
  takeLatest,
  select,
  all,
  call,
} = effects

const beforeDelayAction = {type: 'BEFORE_DELAY'}
const afterDelayAction = {type: 'AFTER_DELAY'}

const testDelayedSaga = async (saga, { preAwaitCheck }) => {
  const initialState = {}

  const delayMock = sagaDelayMock()
  const sagaTester = new SagaTester({
    initialState,
    options: {
      effectMiddlewares: [delayMock],
    },
  })
  sagaTester.run(saga)

  expect(sagaTester.getCalledActions()).toEqual([
    beforeDelayAction
  ])

  preAwaitCheck({ delayMock })
  const pause = await delayMock.waitForDelay()
  expect(pause.length).toBe(60*1000)
  pause.next()

  expect(sagaTester.getCalledActions()).toEqual([
    beforeDelayAction,
    afterDelayAction,
  ])
}

describe('delays pause execution until delay.next is called', () => {
  test('when the delay is after syncronous code in the saga', async () => {
    const saga = function*() {
      yield put(beforeDelayAction)
      yield delay(60*1000)
      yield put(afterDelayAction)
    }
    await testDelayedSaga(saga, {
      preAwaitCheck: ({ delayMock }) => {
        expect(delayMock.unacknowledgedDelay).not.toBe(null)
      }
    })
  })

  test('when the delay is after asyncronous code in the saga', async () => {
    const saga = function*() {
      yield put(beforeDelayAction)
      yield call(setTimeoutPromise, 0)
      yield delay(60*1000)
      yield put(afterDelayAction)
    }
    await testDelayedSaga(saga, {
      preAwaitCheck: ({ delayMock }) => {
        expect(delayMock.unacknowledgedDelay).toBe(null)
      }
    })
  })
})

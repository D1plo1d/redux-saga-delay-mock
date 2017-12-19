## redux-saga-delay-mock

Intercept and test against delays with redux-saga-tester without tying your tests to your implementation.

Currently only compatible with the master branch of redux-saga (as of 1.0.0-beta.0)

### Installation

`yarn add redux-saga-delay-mock`

### Useage

```js
import sagaDelayMock from 'redux-saga-delay-mock'

// ... create various actions and a saga ...

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

const pause = await delayMock.waitForDelay()
expect(pause.length).toBe(60*1000)
pause.next()

expect(sagaTester.getCalledActions()).toEqual([
  beforeDelayAction,
  afterDelayAction,
])
```

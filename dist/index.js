'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reduxSaga = require('redux-saga');

var delayFn = _reduxSaga.effects.delay(0).CALL.fn;

var sagaDelayMock = function sagaDelayMock() {
  var middleware = function middleware(next) {
    return function (effect) {
      if (effect.CALL != null && effect.CALL.fn === delayFn) {
        var meta = {
          length: effect.CALL.args[0],
          next: next
        };
        if (middleware.waiting.length === 0) {
          middleware.unacknowledgedDelay = meta;
        } else {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = middleware.waiting[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var resolveFn = _step.value;

              resolveFn(meta);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          middleware.waiting = [];
        }
      } else {
        return next(effect);
      }
    };
  };
  middleware.unacknowledgedDelay = null;
  middleware.waiting = [];
  middleware.waitForDelay = function () {
    return new Promise(function (resolve, reject) {
      if (middleware.unacknowledgedDelay == null) {
        middleware.waiting.push(resolve);
      } else {
        resolve(middleware.unacknowledgedDelay);
      }
    });
  };
  return middleware;
};

exports.default = sagaDelayMock;
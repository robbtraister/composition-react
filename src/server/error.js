'use strict'

const getRenderer = require('./renderer')

module.exports = (options) => {
  const loginRenderer = getRenderer('login')(options)

  return async (err, req, res, next) => {
    if ([401, 403].includes(err.status)) {
      try {
        await loginRenderer(req, res, next)
      } catch (e) {
        next(e)
      }
    } else {
      next(err)
    }
  }
}

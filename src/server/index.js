'use strict'

const path = require('path')

const React = require('react')
const ReactDOM = require('react-dom/server')

const {
  core: {
    projectRoot
  }
} = require('@composition/core/env')

function unpack (mod) {
  return mod && mod.__esModule && mod.default
    ? mod.default
    : mod
}

let Page
try {
  Page = unpack(require(path.join(projectRoot, 'build', 'server')))
} catch (_) {}

async function renderPage (location) {
  const context = {}

  const html = ReactDOM.renderToStaticMarkup(
    React.createElement(Page, { location, context })
  )

  if (context.url) {
    const redirect = new Error(`redirect to: ${context.url}`)
    redirect.status = 302
    redirect.location = context.url
    throw redirect
  }

  return html
}

module.exports = Page
  ? (options) => async (req, res, next) => {
    res.send(await renderPage(req.originalUrl))
  }
  : (options) => {
    const indexFile = path.join(projectRoot, 'dist', 'index.html')
    return (req, res, next) => { res.sendFile(indexFile) }
  }

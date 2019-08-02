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

async function renderPage (Page, location) {
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

module.exports = (options) => {
  const pageModule = path.join(projectRoot, 'build', 'page')
  const indexFile = path.join(projectRoot, 'dist', 'index.html')

  return async (req, res, next) => {
    try {
      const Page = unpack(require(pageModule))
      res.send(await renderPage(Page, req.originalUrl))
    } catch (_) {
      res.sendFile(indexFile)
    }
  }
}

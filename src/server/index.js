'use strict'

const path = require('path')

const React = require('react')
const ReactDOM = require('react-dom/server')
const { StaticRouter } = require('react-router-dom')
const { ServerStyleSheet } = require('styled-components')

const {
  core: {
    projectRoot
  },
  react: {
    appId,
    appTitle
  }
} = require('@composition/core/env')

function unpack (mod) {
  return mod && mod.__esModule && mod.default
    ? mod.default
    : mod
}

async function renderPage ({ Page, App, location }) {
  const sheet = new ServerStyleSheet()
  try {
    const context = {}

    const html = ReactDOM.renderToStaticMarkup(
      sheet.collectStyles(
        React.createElement(
          Page,
          {
            title: appTitle,

            App: () =>
              React.createElement(
                'div',
                {
                  id: appId
                },
                React.createElement(
                  StaticRouter,
                  {
                    context,
                    location
                  },
                  React.createElement(App)
                )
              ),
            Libs: () =>
              React.createElement(
                'script',
                {
                  defer: true,
                  src: '/dist/app.js'
                }
              )
          }
        )
      )
    )

    if (context.url) {
      const redirect = new Error(`redirect to: ${context.url}`)
      redirect.status = 302
      redirect.location = context.url
      throw redirect
    }

    return `<!DOCTYPE html>${html.replace(
      /<styled-components><\/styled-components>/g,
      sheet.getStyleTags()
    )}`
  } finally {
    sheet.seal()
  }
}

module.exports = (options) => {
  const appModule = path.join(projectRoot, 'build', 'app')
  const pageModule = path.join(projectRoot, 'build', 'page')

  function getPage () {
    let Page
    try {
      Page = unpack(require(pageModule))
    } catch (_) {}
    return Page || require('./page')
  }

  return async (req, res, next) => {
    try {
      res.send(await renderPage({
        App: unpack(require(appModule)),
        Page: getPage(),
        location: req.originalUrl
      }))
    } catch (err) {
      next(err)
    }
  }
}

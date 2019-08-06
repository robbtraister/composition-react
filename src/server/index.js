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

const STYLED_COMPONENTS_PLACEHOLDER = 'styled-components'

function unpack (mod) {
  return mod && mod.__esModule && mod.default
    ? mod.default
    : mod
}

async function renderSite ({ Site, Component, authEnabled, location, name, user }) {
  const sheet = new ServerStyleSheet()
  try {
    const context = {}

    const html = ReactDOM.renderToStaticMarkup(
      sheet.collectStyles(
        React.createElement(
          Site,
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
                  React.createElement(Component, { user })
                )
              ),
            Libs: () =>
              [
                'runtime',
                'common',
                name
              ]
                .map((key) =>
                  React.createElement(
                    'script',
                    {
                      key,
                      defer: true,
                      src: `/dist/${key}.js`
                    }
                  )
                )
                .concat(
                  (authEnabled)
                    ? React.createElement(
                      'script',
                      {
                        key: 'user',
                        defer: true,
                        src: '/auth/user?jsonp=setUser'
                      }
                    )
                    : []
                ),
            Styles: () =>
              [
                'site',
                name
              ]
                .map((key) =>
                  React.createElement(
                    'link',
                    {
                      key,
                      rel: 'stylesheet',
                      type: 'text/css',
                      href: `/dist/${key}.css`
                    }
                  )
                )
                .concat(React.createElement(STYLED_COMPONENTS_PLACEHOLDER))
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
      new RegExp(`<${STYLED_COMPONENTS_PLACEHOLDER}></${STYLED_COMPONENTS_PLACEHOLDER}>`, 'g'),
      sheet.getStyleTags()
    )}`
  } finally {
    sheet.seal()
  }
}

function getSite (siteModule) {
  let Site
  try {
    Site = unpack(require(siteModule))
  } catch (_) {}
  return Site || require('./site')
}

function getRenderer (name) {
  return function renderer (options) {
    const authEnabled = Object.hasOwnProperty.call(options, 'auth') && name === 'app'
    const componentModule = path.join(projectRoot, 'build', name)
    const siteModule = path.join(projectRoot, 'build', 'site')

    return async function render (req, res, next) {
      try {
        res.send(await renderSite({
          Component: unpack(require(componentModule)),
          Site: getSite(siteModule),
          authEnabled,
          location: req.originalUrl,
          name,
          user: req.user
        }))
      } catch (err) {
        next(err)
      }
    }
  }
}

module.exports = (options) => {
  const appRenderer = getRenderer('app')(options)
  const loginRenderer = getRenderer('login')(options)

  return [
    appRenderer,
    async (err, req, res, next) => {
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
  ]
}

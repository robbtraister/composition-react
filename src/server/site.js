'use strict'

const React = require('react')

const Site = ({ title, App, Libs, Styles }) =>
  React.createElement(
    'html',
    {},
    [
      React.createElement(
        'head',
        { key: 'head' },
        [
          React.createElement('title', { key: 'title' }, title),
          React.createElement(Libs, { key: 'Libs' }),
          React.createElement(Styles, { key: 'Styles' })
        ]
      ),
      React.createElement(
        'body',
        { key: 'body' },
        React.createElement(App, { key: App })
      )
    ]
  )

module.exports = Site

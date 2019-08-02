'use strict'

const React = require('react')

const Page = ({ title, App, Libs }) =>
  React.createElement(
    'html',
    {},
    [
      React.createElement(
        'head',
        { key: 'head' },
        [
          React.createElement('title', { key: 'title' }, title),
          React.createElement(Libs, { key: 'Libs' })
        ]
      ),
      React.createElement(
        'body',
        { key: 'body' },
        React.createElement(App, { key: App })
      )
    ]
  )

module.exports = Page

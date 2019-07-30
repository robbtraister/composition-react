'use strict'

/* global __COMPOSITION_APP_ID__ */

import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import * as ReactRouterDOM from 'react-router-dom'

import App from '@'

window.PropTypes = PropTypes
window.React = React
window.ReactDOM = ReactDOM
window.ReactRouterDOM = ReactRouterDOM

function render () {
  return function render (props) {
    const targetElement = document.getElementById(__COMPOSITION_APP_ID__ || 'app')

    if (targetElement) {
      const originalHTML = targetElement.innerHTML

      try {
        ReactDOM.render(
          <ReactRouterDOM.BrowserRouter>
            <App {...props} />
          </ReactRouterDOM.BrowserRouter>,
          targetElement
        )
      } catch (e) {
        targetElement.innerHTML = originalHTML
      }
    }
  }
}

window.document.addEventListener('DOMContentLoaded', render)

export default render

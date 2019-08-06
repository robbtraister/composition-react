'use strict'

/* global __COMPOSITION_APP_ID__ */

import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import * as ReactRouterDOM from 'react-router-dom'

window.PropTypes = PropTypes
window.React = React
window.ReactDOM = ReactDOM
window.ReactRouterDOM = ReactRouterDOM

let user
window.setUser = function setUser (u) {
  user = u
}

function renderer (Component, appId = 'app') {
  function render () {
    const targetElement = document.getElementById(__COMPOSITION_APP_ID__ || appId)

    if (targetElement) {
      const originalHTML = targetElement.innerHTML

      try {
        const props = {
          user
        }

        ReactDOM.render(
          <ReactRouterDOM.BrowserRouter>
            <Component {...props} />
          </ReactRouterDOM.BrowserRouter>,
          targetElement
        )
      } catch (e) {
        targetElement.innerHTML = originalHTML
        console.error(e)
      }
    }
  }

  window.document.addEventListener('DOMContentLoaded', render)
}

export default renderer

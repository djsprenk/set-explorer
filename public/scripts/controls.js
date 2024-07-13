/* Functions for page controls */

import { getCookie, setCookie } from './cookie'

const controlMenuId = 'controls'
const settingsMenuCookie = 'settingsMenu'

/**
 * Get display settings from query params
 * @returns {Object} sortOrder, graphType, scale
 */
function getDisplaySettingsFromQuery () {
  const urlParams = new URLSearchParams(window.location.search)
  const sortOrder = urlParams.get('order')
  const graphType = urlParams.get('graph')
  const scaleType = urlParams.get('scale')

  return {
    sortOrder,
    graphType,
    scale: scaleType
  }
}

/**
 * Sets up handlers for graph control menu items.
 * @param {*} document document object
 */
function setupGraphControlsMenu (document) {
  const controlMenu = document.getElementById(controlMenuId)
  const controls = controlMenu.getElementsByTagName('span')

  // Handle settings menu open / close
  function handleSettingsMenuToggleClick (event) {
    controlMenu.classList.toggle('hidden')
    const isHidden = controlMenu.classList.contains('hidden')

    if (isHidden) {
      setCookie(settingsMenuCookie, 'closed')
    } else {
      setCookie(settingsMenuCookie, 'open')
    }
  }

  for (let i = 0; i < controls.length; i++) {
    controls[i].addEventListener('click', controlClick)
  }

  const settingsMenuToggle = document.getElementById('settings')
  settingsMenuToggle.addEventListener('click', handleSettingsMenuToggleClick)

  if (getCookie(settingsMenuCookie) === 'open') {
    controlMenu.classList.toggle('hidden', false)
  }
}

/**
 * Updates window location query params based on display selections
 * @param {*} param Query param to add / edit
 * @param {*} value Value to add / edit
 */
function updatePath (param, value) {
  const urlParams = new URLSearchParams(window.location.search)
  if (value !== '') { urlParams.set(param, value) } else { urlParams.delete(value) }
  window.location.search = urlParams.toString()
}

/**
 * Handles control of clicking
 * @param {*} event click event
 */
function controlClick (event) {
  const param = event.target.dataset.control
  const value = event.target.dataset.value
  updatePath(param, value)
}

export { setupGraphControlsMenu, getDisplaySettingsFromQuery }

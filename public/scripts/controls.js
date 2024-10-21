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
 * Get the min and max BPM of all input sets
 * @param {*} setArray - songData
 * @returns {minBpm, maxBpm}
 */
function findMinMaxBpm (setArray) {
  if (setArray.length === 0) return null

  return setArray.reduce((acc, obj) => {
    return {
      minBpm: Math.min(acc.minBpm, obj.bpmMin),
      maxBpm: Math.max(acc.maxBpm, obj.bpmMax)
    }
  }, { minBpm: setArray[0].bpmMin, maxBpm: setArray[0].bpmMax })
}

/**
 * Sets up handlers for graph control menu items.
 * @param {*} document document object
 */
function setupGraphControlsMenu (document, songData) {
  const controlMenu = document.getElementById(controlMenuId)

  // Handle settings menu open / close
  function handleSettingsMenuToggleClick (event) {
    event.preventDefault()
    controlMenu.classList.toggle('hidden')
    const isHidden = controlMenu.classList.contains('hidden')

    if (isHidden) {
      setCookie(settingsMenuCookie, 'closed')
    } else {
      setCookie(settingsMenuCookie, 'open')
    }
  }

  const settingsMenuToggle = document.getElementById('settings')
  settingsMenuToggle.addEventListener('click', handleSettingsMenuToggleClick)

  if (getCookie(settingsMenuCookie) === 'open') {
    controlMenu.classList.toggle('hidden', false)
  }

  // Set up view controls
  const sortControls = document.getElementById('sort').getElementsByTagName('span')
  const scaleControls = document.getElementById('scale').getElementsByTagName('span')
  const graphTypeControls = document.getElementById('graph-type').getElementsByTagName('span')

  const viewControls = [...sortControls, ...scaleControls, ...graphTypeControls]

  // Add click handlers
  for (let i = 0; i < viewControls.length; i++) {
    viewControls[i].addEventListener('click', controlClick)
  }

  // Set up BPM menu
  const bpmControls = document.getElementById('bpm').getElementsByTagName('input')
  const { minBpm, maxBpm } = findMinMaxBpm(songData)
  document.getElementById('min-bpm').value = parseInt(minBpm)
  document.getElementById('max-bpm').value = parseInt(maxBpm)

  // Add BPM change handlers
  for (let i = 0; i < bpmControls.length; i++) {
    bpmControls[i].addEventListener('change', handleBpmFilterChange)
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

function handleBpmFilterChange (event) {
  event.preventDefault()

  // Get set min/max BPM
  const minBpm = parseInt(document.getElementById('min-bpm').value)
  const maxBpm = parseInt(document.getElementById('max-bpm').value)

  // Get all set containers
  const setContainers = document.getElementsByClassName('set-container')

  // Hide those outside the BPM bounds
  for (let i = 0; i < setContainers.length; i++) {
    const setContainer = setContainers[i]

    const minSetBpm = parseInt(setContainer.dataset.minbpm)
    const maxSetBpm = parseInt(setContainer.dataset.maxbpm)
    if (minSetBpm < minBpm || maxSetBpm > maxBpm) {
      setContainer.classList.add('hidden')
    } else {
      setContainer.classList.remove('hidden')
    }
  }

  const searchResults = document.getElementById('search-results')
  const searchResultsNumber = document.getElementById('search-results-number')
  const setsVisible = document.querySelectorAll('.set-container:not(.hidden)').length

  // Show no sets found message if all sets are filtered out
  if (setsVisible !== setContainers.length) {
    searchResults.classList.remove('hidden')
    searchResultsNumber.textContent = setsVisible
  } else {
    searchResults.classList.add('hidden')
  }
}

export { setupGraphControlsMenu, getDisplaySettingsFromQuery }

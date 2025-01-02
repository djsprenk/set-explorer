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
  const minBpm = urlParams.get('min-bpm')
  const maxBpm = urlParams.get('max-bpm')

  return {
    sortOrder,
    graphType,
    scale: scaleType,
    minBpm,
    maxBpm
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
 * Determine light/dark mode and set styling
 * @param {*} document
 */
function setUpTheming (document) {
  const body = document.body
  const logo = document.getElementById('logo')
  // const toggleButton = document.getElementById('toggle-mode')

  // Check initial preference
  let prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  body.classList.add(prefersDark ? 'dark' : 'light')

  // Toggle mode manually
  // toggleButton.addEventListener('click', () => {
  //   if (body.classList.contains('dark')) {
  //     body.classList.replace('dark', 'light')
  //   } else {
  //     body.classList.replace('light', 'dark')
  //   }
  // })

  // Listen for changes in preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    body.classList.replace(e.matches ? 'light' : 'dark', e.matches ? 'dark' : 'light')
  })
}

/**
 * Sets up handlers for graph control menu items.
 * @param {*} document document object
 */
function setupGraphControlsMenu (document, songData) {
  const controlMenu = document.getElementById(controlMenuId)
  const settingsFromQuery = getDisplaySettingsFromQuery()

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

  document.getElementById('min-bpm').value = parseInt(settingsFromQuery.minBpm) || parseInt(minBpm)
  document.getElementById('max-bpm').value = parseInt(settingsFromQuery.maxBpm) || parseInt(maxBpm)

  // Add BPM change handlers
  for (let i = 0; i < bpmControls.length; i++) {
    bpmControls[i].addEventListener('change', handleBpmFilterChange)
  }
}

/**
 * Updates window location query params based on display selections
 * @param {*} param Query param to add / edit
 * @param {*} value Value to add / edit
 * @param {Boolean} reload Whether or not to trigger a page reload or just push history
 */
function updatePath (param, value, reload = true) {
  const urlParams = new URLSearchParams(window.location.search)
  if (value !== '') { urlParams.set(param, value) } else { urlParams.delete(value) }

  // Clicking controls should reload page, JS controls should just update the path
  if (reload) {
    window.location.search = urlParams.toString()
  } else {
    // eslint-disable-next-line no-undef
    history.pushState({}, '', `?${urlParams.toString()}`)
  }
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

  // Set the path
  if (event.target.id === 'max-bpm') {
    updatePath('max-bpm', maxBpm, false)
  } else if (event.target.id === 'min-bpm') {
    updatePath('min-bpm', minBpm, false)
  }

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

export { setUpTheming, setupGraphControlsMenu, getDisplaySettingsFromQuery }

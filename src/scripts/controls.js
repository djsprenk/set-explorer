/* Functions for page controls */

import { getCookie, setCookie } from './cookie'

// Selectors
const controlMenuId = 'controls'
const settingsMenuCookie = 'settingsMenu'

// Constants
const visualizationTypes = {
  TIMELINE: 'timelines',
  BPM: 'bpm',
  ENERGY: 'energy',
  FAMILIARITY: 'familiarity',
  PLAYLIST: 'playlists'
}
const scaleTypes = ['relative', 'stretch']
const sortOrders = ['newest', 'oldest']
const layoutTypes = ['list', 'card']

// Default display settings for first visit
const defaultDisplaySettings = {
  sortOrder: sortOrders[0],
  show: [
    visualizationTypes.ENERGY,
    visualizationTypes.BPM,
    visualizationTypes.FAMILIARITY
  ],
  scale: scaleTypes[0],
  layout: layoutTypes[1]
}

/**
 * Get display settings using the order (1) query, or (2) default
 * @returns {Object} sortOrder, show, scale, minBpm, maxBpm
 */
function getDisplaySettings () {
  const querySettings = getDisplaySettingsFromQuery()
  const calculatedSettings = { ...defaultDisplaySettings, ...querySettings }

  return calculatedSettings
}

/**
 * Get display settings from query params
 * @returns {Object} sortOrder, show, scale, minBpm, maxBpm
 */
function getDisplaySettingsFromQuery () {
  const urlParams = new URLSearchParams(window.location.search)

  const querySettings = {
    sortOrder: urlParams.get('order'),
    show: urlParams.get('show'),
    scale: urlParams.get('scale'),
    layout: urlParams.get('layout'),
    minBpm: urlParams.get('min-bpm'),
    maxBpm: urlParams.get('max-bpm')
  }

  // Handle show param as a comma separated array, if set
  querySettings.show = querySettings.show ? String(querySettings.show).split(',') : null

  // Remove null values
  for (const key in querySettings) {
    if (querySettings[key] === null || querySettings[key] === '') {
      delete querySettings[key]
    }
  }

  return querySettings
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

function setDarkMode (document) {
  document.body.classList.replace('light', 'dark')
}

function setLightMode (document) {
  document.body.classList.replace('dark', 'light')
}

/**
 * Determine light/dark mode and set styling
 * @param {*} document
 */
function setUpTheming (document) {
  const body = document.body

  // Check initial preference
  let prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (prefersDark) {
    body.classList.add('dark')
  } else {
    body.classList.add('light')
  }

  // Theme control clicks (Light / Dark spans in the settings menu)
  document.getElementById('theme').addEventListener('click', (e) => {
    const control = e.target.closest('[data-control="theme"]')
    if (!control) return
    if (control.dataset.value === 'dark') {
      setDarkMode(document)
    } else {
      setLightMode(document)
    }
  })

  // Listen for changes in system preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) { setDarkMode(document) } else { setLightMode(document) }
  })
}

/**
 * Get the currently selected options from the UI
 */
function getSettingsSelections (document) {
  const displaySettings = getDisplaySettings()

  // Sort - Not yet a selector

  // Show
  displaySettings.show = []
  if (document.getElementById('timeline-control').checked) { displaySettings.show.push(visualizationTypes.TIMELINE) }
  if (document.getElementById('bpm-control').checked) { displaySettings.show.push(visualizationTypes.BPM) }
  if (document.getElementById('energy-control').checked) { displaySettings.show.push(visualizationTypes.ENERGY) }
  if (document.getElementById('familiarity-control').checked) { displaySettings.show.push(visualizationTypes.FAMILIARITY) }
  if (document.getElementById('playlist-control').checked) { displaySettings.show.push(visualizationTypes.PLAYLIST) }

  // Scale - Not yet a selector

  // BPM Range
  displaySettings.minBpm = parseInt(document.getElementById('min-bpm').value)
  displaySettings.maxBpm = parseInt(document.getElementById('max-bpm').value)

  return displaySettings
}

/**
 * Set the UI to the provided settings
 * @param {*} document
 * @param {*} settings
 */
function setSettingsSelections (document, settings) {
  // Sort - Not yet a selector

  // Show
  if (settings.show.includes(visualizationTypes.TIMELINE)) {
    document.getElementById('timeline-control').checked = true
  } else {
    document.getElementById('timeline-control').checked = false
  }
  if (settings.show.includes(visualizationTypes.BPM)) {
    document.getElementById('bpm-control').checked = true
  } else {
    document.getElementById('bpm-control').checked = false
  }
  if (settings.show.includes(visualizationTypes.ENERGY)) {
    document.getElementById('energy-control').checked = true
  } else {
    document.getElementById('energy-control').checked = false
  }
  if (settings.show.includes(visualizationTypes.FAMILIARITY)) {
    document.getElementById('familiarity-control').checked = true
  } else {
    document.getElementById('familiarity-control').checked = false
  }
  if (settings.show.includes('playlists')) {
    document.getElementById('playlist-control').checked = true
  } else {
    document.getElementById('playlist-control').checked = false
  }

  // Scale - Not yet a selector

  // BPM Range
  document.getElementById('min-bpm').value = parseInt(settings.minBpm)
  document.getElementById('max-bpm').value = parseInt(settings.maxBpm)
}

/**
 * Sets up handlers for graph control menu items.
 * @param {*} document document object
 */
function setupGraphControlsMenu (document, songData, displaySettings) {
  const controlMenu = document.getElementById(controlMenuId)

  const settingsMenuToggle = document.getElementById('settings')

  function openSettingsMenu () {
    controlMenu.classList.remove('hidden')
    settingsMenuToggle.setAttribute('aria-expanded', 'true')
    setCookie(settingsMenuCookie, 'open')
  }

  function closeSettingsMenu () {
    controlMenu.classList.add('hidden')
    settingsMenuToggle.setAttribute('aria-expanded', 'false')
    setCookie(settingsMenuCookie, 'closed')
  }

  settingsMenuToggle.addEventListener('click', () => {
    const isOpen = settingsMenuToggle.getAttribute('aria-expanded') === 'true'
    isOpen ? closeSettingsMenu() : openSettingsMenu()
  })

  if (getCookie(settingsMenuCookie) === 'open') {
    openSettingsMenu()
  }

  // Set up view controls
  const sortControls = document.getElementById('sort').getElementsByTagName('span')
  const scaleControls = document.getElementById('scale').getElementsByTagName('span')
  const layoutControls = document.getElementById('layout').getElementsByTagName('span')

  const viewControls = [...sortControls, ...scaleControls, ...layoutControls]

  // Add click handlers
  for (let i = 0; i < viewControls.length; i++) {
    viewControls[i].addEventListener('click', controlClick)
  }

  // Set up show visualizations menu
  const visualizationControls = document.getElementById('visualization-display').getElementsByTagName('input')
  for (let i = 0; i < visualizationControls.length; i++) {
    visualizationControls[i].addEventListener('click', (e) => {
      const settings = getSettingsSelections(document)
      const param = 'show'
      const value = settings.show
      updatePath(param, value)
    })
  }

  // Set up BPM menu
  const bpmControls = document.getElementById('bpm').getElementsByTagName('input')
  const { minBpm, maxBpm } = findMinMaxBpm(songData)
  if (!displaySettings.minBpm) displaySettings.minBpm = minBpm
  if (!displaySettings.maxBpm) displaySettings.maxBpm = maxBpm

  // Add BPM change handlers
  for (let i = 0; i < bpmControls.length; i++) {
    bpmControls[i].addEventListener('change', handleBpmFilterChange)
  }

  // Write settings to the UI
  setSettingsSelections(document, displaySettings)
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

export { setUpTheming, setupGraphControlsMenu, getDisplaySettings }

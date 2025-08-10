// Constants
export const visualizationTypes = {
  TIMELINE: 'timelines',
  BPM: 'bpm',
  ENERGY: 'energy',
  FAMILIARITY: 'familiarity',
  PLAYLIST: 'playlists'
}

export const scaleTypes = ['relative', 'stretch']
export const sortOrders = ['newest', 'oldest']

// Default display settings for first visit
export const defaultDisplaySettings = {
  sortOrder: sortOrders[0],
  show: [
    visualizationTypes.ENERGY,
    visualizationTypes.BPM,
    visualizationTypes.FAMILIARITY,
    visualizationTypes.PLAYLIST
  ],
  scale: scaleTypes[0]
}

/**
 * Get display settings using the order (1) query, or (2) default
 * @returns {Object} sortOrder, show, scale, minBpm, maxBpm
 */
export function getDisplaySettings () {
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
export function findMinMaxBpm (setArray) {
  if (setArray.length === 0) return null

  return setArray.reduce((acc, obj) => {
    return {
      minBpm: Math.min(acc.minBpm, obj.bpmMin),
      maxBpm: Math.max(acc.maxBpm, obj.bpmMax)
    }
  }, { minBpm: setArray[0].bpmMin, maxBpm: setArray[0].bpmMax })
}

/**
 * Updates window location query params based on display selections
 * @param {*} param Query param to add / edit
 * @param {*} value Value to add / edit
 * @param {Boolean} reload Whether or not to trigger a page reload or just push history
 */
export function updatePath (param, value, reload = false) {
  const urlParams = new URLSearchParams(window.location.search)

  if (value !== '') {
    urlParams.set(param, value)
  } else {
    urlParams.delete(param)
  }

  // For React, we usually don't want to reload, just update history
  if (reload) {
    window.location.search = urlParams.toString()
  } else {
    window.history.pushState({}, '', `?${urlParams.toString()}`)
  }
}

import * as d3 from 'd3'
import songData from '../data/song-data'

import { getDisplaySettingsFromQuery, setupGraphControlsMenu, setUpTheming } from './controls'
import { timelineGraph } from './timeline'
import { playlistView } from './playlist'
import { e3Graph } from './e3'

/**
 * Sort sets based on the requested order.
 * @param {*} sets List of sets
 * @param {*} sortOrder Sort order ('newest' or 'oldest')
 * @returns Sorted sets
 */
function sortSets (sets, sortOrder) {
  // Default to newest first
  if (sortOrder === null || sortOrder === 'newest') {
    return sets.sort((a, b) => Date.parse(b.uploadTimestamp) - Date.parse(a.uploadTimestamp))
  } else if (sortOrder === 'oldest') {
    return sets.sort((a, b) => Date.parse(a.uploadTimestamp) - Date.parse(b.uploadTimestamp))
  } else {
    console.error(`Bad sort order: ${sortOrder}`)
    return sortOrder
  }
}

function getSetTitleSubtitle (longformTitle) {
  const titleParts = longformTitle.split(' | ')

  if (titleParts.length >= 2) {
    return [titleParts[0], titleParts[1]]
  } else {
    return [longformTitle, '']
  }
}

function createThumbnail (container, setMetadata) {
  let thumbnail

  if (setMetadata.img) {
    thumbnail = container
      .append('a')
      .attr('class', 'set-thumbnail-link')
      .attr('href', setMetadata.url)
      .append('img')
      .attr('class', 'set-thumbnail')
      .attr('src', setMetadata.img)
      .attr('title', setMetadata.title)
  }

  return thumbnail
}

function createTitle (container, setMetadata) {
  const title = container
    .append('div')
    .attr('class', 'set-title')

  // Split title into name and subtitle
  const [setName, setSubtitle] = getSetTitleSubtitle(setMetadata.title)

  title.append('div')
    .attr('class', 'set-name')
    .text(setName)

  title.append('div')
    .attr('class', 'set-subtitle')
    .text(setSubtitle)

  if (setMetadata.url !== '') {
    title.attr('href', setMetadata.url)
  }

  return title
}

function createBpmLabel (container, setMetadata) {
  const bpm = container
    .append('span')
    .attr('class', 'bpm')

  if (setMetadata.bpmMin && setMetadata.bpmMax) {
    if (Math.round(setMetadata.bpmMin) === Math.round(setMetadata.bpmMax)) {
      bpm.text(`${Math.round(setMetadata.bpmMin)} BPM`)
    } else {
      bpm.text(`${Math.round(setMetadata.bpmMin)} - ${Math.round(setMetadata.bpmMax)} BPM`)
    }
  }

  return bpm
}

function createRuntimeLabel (container, setMetadata) {
  const runtimeLabel = container
    .append('span')
    .attr('class', 'runtime')

  if (setMetadata.length) {
    runtimeLabel.text(`${Math.round(setMetadata.length / 60)} minutes`)
  }

  return runtimeLabel
}

/**
 * Draw set visualizations to the container with the given display settings
 * @param {D3 Selection} container
 * @param {[SetMetadata]} sets
 * @param {Object} displaySettings
 */
function drawSetVisualizations (container, sets, displaySettings) {
  // Draw graphs
  for (const i in sets) {
    const songs = sets[i].data
    const pois = sets[i].pois
    const setMetadata = sets[i]
    delete setMetadata.data
    delete setMetadata.pois

    // Each set gets its own container
    const setContainer = container
      .append('div')
      .attr('class', 'set-container')
      .attr('data-minBpm', setMetadata.bpmMin)
      .attr('data-maxBpm', setMetadata.bpmMax)

    // Create thumbnail / link
    createThumbnail(setContainer, setMetadata)

    // Add set information
    const setInfoContainer = setContainer.append('div').attr('class', 'set-info-container')

    createTitle(setInfoContainer, setMetadata)
    const setDetails = setInfoContainer.append('div').attr('class', 'set-details')
    createBpmLabel(setDetails, setMetadata)
    createRuntimeLabel(setDetails, setMetadata)

    // Use playlist graph if specifically requested
    if (displaySettings.graphType === 'playlist') {
      playlistView(setInfoContainer, songs, setMetadata)
    } else if (displaySettings.graphType === 'type') {
      e3Graph(setInfoContainer, songs, pois, setMetadata, i, displaySettings.scale)
    } else {
      // Default to timeline graph...
      // Falling back to playlist graph if POIs are missing
      if (pois !== undefined) {
        timelineGraph(setInfoContainer, songs, pois, setMetadata, i, displaySettings.scale)
      } else {
        playlistView(setInfoContainer, songs, setMetadata)
      }
    }

    // Hide sets outside of filtered BPM range
    if ((displaySettings.minBpm && setMetadata.bpmMin < displaySettings.minBpm) ||
        (displaySettings.maxBpm && setMetadata.bpmMax > displaySettings.maxBpm)) {
      setContainer.classed('hidden', true)
    }
  }
}

// Wait until page is loaded
window.addEventListener('load', function () {
  // Set up Light / Dark mode
  setUpTheming(this.document)

  // Init controls
  setupGraphControlsMenu(this.document, songData)

  // Get display settings
  const displaySettings = getDisplaySettingsFromQuery()

  // Sort data
  const sortedSets = sortSets(songData, displaySettings.sortOrder)

  // Draw set visualizations
  const container = d3.select('#visualizations')
  drawSetVisualizations(container, sortedSets, displaySettings)
})

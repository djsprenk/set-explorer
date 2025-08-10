import React from 'react'
import SetThumbnail from './SetThumbnail'
import SetTitle from './SetTitle'
import SetDetails from './SetDetails'
import TimelineGraph from './visualizations/TimelineGraph'
import EnergyGraph from './visualizations/EnergyGraph'
import BpmGraph from './visualizations/BpmGraph'
import E3Graph from './visualizations/E3Graph'
import PlaylistView from './visualizations/PlaylistView'
import { visualizationTypes } from '../utils/controls'

function getSetTitleSubtitle (longformTitle) {
  const titleParts = longformTitle.split(' | ')

  if (titleParts.length >= 2) {
    return [titleParts[0], titleParts[1]]
  } else {
    return [longformTitle, '']
  }
}

function SetContainer ({ setData, index, displaySettings }) {
  const songs = setData.data
  const pois = setData.pois
  const setMetadata = { ...setData }
  delete setMetadata.data
  delete setMetadata.pois

  const [setName, setSubtitle] = getSetTitleSubtitle(setMetadata.title)

  return (
    <div
      className='set-container'
      data-minbpm={setMetadata.bpmMin}
      data-maxbpm={setMetadata.bpmMax}
    >
      <SetThumbnail setMetadata={setMetadata} />

      <div className='set-info-container'>
        <SetTitle setName={setName} setSubtitle={setSubtitle} url={setMetadata.url} />
        <SetDetails setMetadata={setMetadata} />

        {displaySettings.show.includes(visualizationTypes.TIMELINE) && (
          <TimelineGraph
            songs={songs}
            pois={pois}
            setMetadata={setMetadata}
            index={index}
            scale={displaySettings.scale}
          />
        )}

        {displaySettings.show.includes(visualizationTypes.ENERGY) && (
          <EnergyGraph
            songs={songs}
            pois={pois}
            setMetadata={setMetadata}
            index={index}
            scale={displaySettings.scale}
          />
        )}

        {displaySettings.show.includes(visualizationTypes.BPM) && (
          <BpmGraph
            songs={songs}
            pois={pois}
            setMetadata={setMetadata}
            index={index}
            scale={displaySettings.scale}
          />
        )}

        {displaySettings.show.includes(visualizationTypes.FAMILIARITY) && (
          <E3Graph
            songs={songs}
            pois={pois}
            setMetadata={setMetadata}
            index={index}
            scale={displaySettings.scale}
          />
        )}

        {displaySettings.show.includes(visualizationTypes.PLAYLIST) && (
          <PlaylistView songs={songs} />
        )}
      </div>
    </div>
  )
}

export default SetContainer

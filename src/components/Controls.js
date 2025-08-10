import React, { useState, useEffect } from 'react'
import { visualizationTypes, findMinMaxBpm, updatePath } from '../utils/controls'

function Controls ({ visible, displaySettings, songData, onSettingsChange }) {
  const [settings, setSettings] = useState(displaySettings)

  useEffect(() => {
    setSettings(displaySettings)
  }, [displaySettings])

  const handleSortChange = (sortOrder) => {
    updatePath('order', sortOrder)
    onSettingsChange({ sortOrder })
  }

  const handleScaleChange = (scale) => {
    updatePath('scale', scale)
    onSettingsChange({ scale })
  }

  const handleVisualizationChange = (type, checked) => {
    const newShow = checked
      ? [...settings.show, type]
      : settings.show.filter(item => item !== type)

    setSettings(prev => ({ ...prev, show: newShow }))
    updatePath('show', newShow.join(','))
    onSettingsChange({ show: newShow })
  }

  const handleBpmChange = (param, value) => {
    const newSettings = { ...settings, [param]: value }
    setSettings(newSettings)
    updatePath(param, value)
    onSettingsChange({ [param]: value })
  }

  const { minBpm: dataMinBpm, maxBpm: dataMaxBpm } = findMinMaxBpm(songData)

  if (!visible) return null

  return (
    <aside id='controls'>
      <div id='sort'>
        <strong>Sort:</strong>
        <span
          className={`control ${settings.sortOrder === 'newest' ? 'active' : ''}`}
          onClick={() => handleSortChange('newest')}
          title='Show newest first'
          style={{ cursor: 'pointer' }}
        >
          Newest
        </span>
        ,{' '}
        <span
          className={`control ${settings.sortOrder === 'oldest' ? 'active' : ''}`}
          onClick={() => handleSortChange('oldest')}
          title='Show oldest first'
          style={{ cursor: 'pointer' }}
        >
          Oldest
        </span>
      </div>

      <div id='visualization-display'>
        <strong>Show:</strong>
        <input
          type='checkbox'
          id='timeline-control'
          className='control'
          checked={settings.show.includes(visualizationTypes.TIMELINE)}
          onChange={(e) => handleVisualizationChange(visualizationTypes.TIMELINE, e.target.checked)}
          title='Show timelines'
        />
        <label htmlFor='timeline-control'>Combined BPM & Energy</label>

        <input
          type='checkbox'
          id='bpm-control'
          className='control'
          checked={settings.show.includes(visualizationTypes.BPM)}
          onChange={(e) => handleVisualizationChange(visualizationTypes.BPM, e.target.checked)}
          title='Show BPM'
        />
        <label htmlFor='bpm-control'>BPM</label>

        <input
          type='checkbox'
          id='energy-control'
          className='control'
          checked={settings.show.includes(visualizationTypes.ENERGY)}
          onChange={(e) => handleVisualizationChange(visualizationTypes.ENERGY, e.target.checked)}
          title='Show energy'
        />
        <label htmlFor='energy-control'>Energy</label>

        <input
          type='checkbox'
          id='familiarity-control'
          className='control'
          checked={settings.show.includes(visualizationTypes.FAMILIARITY)}
          onChange={(e) => handleVisualizationChange(visualizationTypes.FAMILIARITY, e.target.checked)}
          title='Show familiarity'
        />
        <label htmlFor='familiarity-control'>Familiarity</label>

        <input
          type='checkbox'
          id='playlist-control'
          className='control'
          checked={settings.show.includes(visualizationTypes.PLAYLIST)}
          onChange={(e) => handleVisualizationChange(visualizationTypes.PLAYLIST, e.target.checked)}
          title='Show playlists'
        />
        <label htmlFor='playlist-control'>Playlists</label>
      </div>

      <div id='scale'>
        <strong>Scale:</strong>
        <span
          className={`control ${settings.scale === 'stretch' ? 'active' : ''}`}
          onClick={() => handleScaleChange('stretch')}
          title='Scale stretch'
          style={{ cursor: 'pointer' }}
        >
          Stretch
        </span>
        ,{' '}
        <span
          className={`control ${settings.scale === 'relative' ? 'active' : ''}`}
          onClick={() => handleScaleChange('relative')}
          title='Scale relative'
          style={{ cursor: 'pointer' }}
        >
          Relative
        </span>
      </div>

      <div id='bpm'>
        <strong>BPM Range:</strong>
        <input
          type='number'
          id='min-bpm'
          value={settings.minBpm || Math.round(dataMinBpm)}
          onChange={(e) => handleBpmChange('minBpm', parseInt(e.target.value))}
        />
        <span> - </span>
        <input
          type='number'
          id='max-bpm'
          value={settings.maxBpm || Math.round(dataMaxBpm)}
          onChange={(e) => handleBpmChange('maxBpm', parseInt(e.target.value))}
        />
        <span>BPM</span>
      </div>
    </aside>
  )
}

export default Controls

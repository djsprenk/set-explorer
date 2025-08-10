import React, { useState, useEffect } from 'react'
import Header from './Header'
import Controls from './Controls'
import Visualizations from './Visualizations'
import Footer from './Footer'
import songData from '../data/song-data'
import { getDisplaySettings } from '../utils/controls'
import { useTheme } from '../hooks/useTheme'
import { useCookie } from '../hooks/useCookie'

function sortSets (sets, sortOrder) {
  // Default to newest first
  if (sortOrder === null || sortOrder === 'newest') {
    return sets.sort((a, b) => Date.parse(b.uploadTimestamp) - Date.parse(a.uploadTimestamp))
  } else if (sortOrder === 'oldest') {
    return sets.sort((a, b) => Date.parse(a.uploadTimestamp) - Date.parse(b.uploadTimestamp))
  } else {
    console.error(`Bad sort order: ${sortOrder}`)
    return sets
  }
}

function App () {
  const [displaySettings, setDisplaySettings] = useState(getDisplaySettings())
  const [sortedSets, setSortedSets] = useState([])
  const [settingsMenuState, setSettingsMenuState] = useCookie('settingsMenu', 'closed')
  
  const { isDarkMode, toggleTheme } = useTheme()

  const controlsVisible = settingsMenuState === 'open'

  useEffect(() => {
    const sorted = sortSets([...songData], displaySettings.sortOrder)
    setSortedSets(sorted)
  }, [displaySettings.sortOrder])

  const handleSettingsChange = (newSettings) => {
    setDisplaySettings(prev => ({ ...prev, ...newSettings }))
  }

  const toggleControls = () => {
    const newState = controlsVisible ? 'closed' : 'open'
    setSettingsMenuState(newState)
  }

  return (
    <>
      <Header
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onToggleSettings={toggleControls}
      />
      <Controls
        visible={controlsVisible}
        displaySettings={displaySettings}
        songData={songData}
        onSettingsChange={handleSettingsChange}
      />
      <Visualizations
        sets={sortedSets}
        displaySettings={displaySettings}
      />
      <Footer />
    </>
  )
}

export default App

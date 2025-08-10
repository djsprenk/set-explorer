import React, { useState, useEffect } from 'react'
import SetContainer from './SetContainer'

function Visualizations ({ sets, displaySettings }) {
  const [filteredSets, setFilteredSets] = useState(sets)

  useEffect(() => {
    // Filter sets based on BPM range
    const filtered = sets.filter(set => {
      if (displaySettings.minBpm && set.bpmMin < displaySettings.minBpm) return false
      if (displaySettings.maxBpm && set.bpmMax > displaySettings.maxBpm) return false
      return true
    })
    setFilteredSets(filtered)
  }, [sets, displaySettings.minBpm, displaySettings.maxBpm])

  const visibleSetsCount = filteredSets.length
  const showSearchResults = visibleSetsCount !== sets.length

  return (
    <>
      <main id='visualizations'>
        {showSearchResults && (
          <div id='search-results'>
            <span id='search-results-number'>{visibleSetsCount}</span> sets found with current filter.
          </div>
        )}
        {filteredSets.map((set, index) => (
          <SetContainer
            key={`${set.title}-${set.uploadTimestamp}`}
            setData={set}
            index={index}
            displaySettings={displaySettings}
          />
        ))}
      </main>
    </>
  )
}

export default Visualizations

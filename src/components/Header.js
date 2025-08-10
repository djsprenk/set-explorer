import React from 'react'
import logoWhite from '../assets/sprenk-logo-gradient-white.png'
import logoBlack from '../assets/sprenk-logo-gradient-black.png'
import moonIcon from '../assets/moon-icon.svg'
import sunIcon from '../assets/sun-icon.svg'
import gearIcon from '../assets/gear-icon.svg'

function Header ({ isDarkMode, onToggleTheme, onToggleSettings }) {
  return (
    <header>
      <a href='https://djsprenk.com'>
        <img
          id='logo'
          src={isDarkMode ? logoWhite : logoBlack}
          alt='DJ Sprenk'
        />
      </a>
      <h1 id='title'>
        Set Explorer
      </h1>
      <img
        id='color-mode'
        src={isDarkMode ? sunIcon : moonIcon}
        title='Toggle light / dark mode'
        alt='Toggle light / dark mode'
        onClick={onToggleTheme}
        style={{ cursor: 'pointer' }}
      />
      <img
        id='settings'
        src={gearIcon}
        title='Toggle settings menu'
        alt='Toggle settings menu'
        onClick={onToggleSettings}
        style={{
          cursor: 'pointer',
          filter: isDarkMode ? 'invert(0)' : 'invert(1)'
        }}
      />
    </header>
  )
}

export default Header

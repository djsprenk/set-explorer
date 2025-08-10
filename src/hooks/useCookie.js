import { useState, useEffect } from 'react'

/**
 * React hook for managing cookies
 * @param {string} name - Cookie name
 * @param {*} defaultValue - Default value if cookie doesn't exist
 * @returns {[value, setValue]} - Current value and setter function
 */
export function useCookie (name, defaultValue = '') {
  const [value, setValue] = useState(() => {
    return getCookie(name) || defaultValue
  })

  useEffect(() => {
    setCookie(name, value)
  }, [name, value])

  return [value, setValue]
}

/**
 * Get cookie value by name
 * @param {string} cname - Cookie name
 * @returns {string} Cookie value or empty string
 */
export function getCookie (cname) {
  const name = cname + '='
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

/**
 * Set cookie value
 * @param {string} cname - Cookie name
 * @param {*} cvalue - Cookie value
 */
export function setCookie (cname, cvalue) {
  document.cookie = `${cname}=${cvalue};SameSite=Strict;path=/;`
}

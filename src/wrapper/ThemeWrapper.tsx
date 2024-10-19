import { Theme } from '@obr'
import clsx from 'clsx'
import React from 'react'
import { useEffect, useState } from 'react'

/* theme classes are set in styles/main.scss */
const ThemeWrapper = ({ children }: { children?: React.ReactNode }) => {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    Theme.getThemeState().then(themeState => {
      if (themeState?.isDarkMode) {
        setTheme('dark')
      } else {
        setTheme('light')
      }
    })

    Theme.setThemeStateListener(themeState => {
      if (themeState?.isDarkMode) {
        setTheme('dark')
      } else {
        setTheme('light')
      }
    })
  }, [])

  // Adds the theme class to the first child element, which must be a div
  return (
    <>
      {React.Children.map(children, (child, index) => {
        if (
          index === 0 &&
          React.isValidElement(child) &&
          child.type === 'div'
        ) {
          return React.cloneElement(child as React.ReactElement<any>, {
            className: clsx((child.props as any).className, theme),
          })
        }
        return child
      })}
    </>
  )
}

export default ThemeWrapper

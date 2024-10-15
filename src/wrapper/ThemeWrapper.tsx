import { Theme } from '@obr'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

/* theme classes are set in styles/main.scss */
const ThemeWrapper = ({
  className,
  children,
  style,
}: {
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
}) => {
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

  return (
    <div className={clsx(theme, className)} style={style}>
      {children}
    </div>
  )
}

export default ThemeWrapper

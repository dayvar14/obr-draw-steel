import { Theme } from '@obr'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

/* theme classes are set in styles/main.scss */
const ThemeWrapper = ({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
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

  return <div className={clsx(theme, className)}>{children}</div>
}

export default ThemeWrapper

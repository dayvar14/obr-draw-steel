import OBR, { Theme as OBRTheme } from '@owlbear-rodeo/sdk'
import ThemeApi from '@owlbear-rodeo/sdk/lib/api/ThemeApi'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Theme {
  /* Need to decouple this a bit more */
  export interface ThemeState {
    isDarkMode: boolean
  }

  type OnStageChange = (themeState: ThemeState) => void

  const createOnThemeStateChangeFunc = (onStateChange: OnStageChange) => {
    const onStateChangeFunc: Parameters<ThemeApi['onChange']>[0] = theme => {
      const themeState = generateThemeStateFromTheme(theme)
      onStateChange(themeState)
    }
    return onStateChangeFunc
  }

  export const setThemeStateListener = (onStateChange: OnStageChange) => {
    OBR.onReady(() => {
      OBR.theme.onChange(createOnThemeStateChangeFunc(onStateChange))
    })
  }

  export const getThemeState = (): Promise<ThemeState> => {
    return new Promise(resolve => {
      try {
        OBR.onReady(async () => {
          const theme = await OBR.theme.getTheme()
          const themeState = generateThemeStateFromTheme(theme)
          resolve(themeState)
        })
      } catch (error) {
        console.error('Error during getThemeState:', error)
        const playerState = {} as ThemeState
        resolve(playerState)
      }
    })
  }

  const generateThemeStateFromTheme = (theme: OBRTheme): ThemeState => {
    const isDarkMode = theme.mode === 'DARK'
    const themeState: ThemeState = {
      isDarkMode,
    }

    return themeState
  }
}

import OBR, { Theme } from '@owlbear-rodeo/sdk'
import ThemeApi from '@owlbear-rodeo/sdk/lib/api/ThemeApi'

export interface ThemeState {
  mode: Theme['mode']
  primary: Theme['primary']
  secondary: Theme['primary']
  background: Theme['background']
  text: Theme['text']
}

type OnStageChange = (themeState: ThemeState) => void

const createOnThemeStateChangeFunc = (onStateChange: OnStageChange) => {
  const onStateChangeFunc: Parameters<ThemeApi['onChange']>[0] = theme => {
    const themeState: ThemeState = theme
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
  return new Promise(async resolve => {
    try {
      OBR.onReady(async () => {
        const theme = await OBR.theme.getTheme()

        resolve(theme)
      })
    } catch (error) {
      console.error('Error during getThemeState:', error)
      const playerState = {} as ThemeState
      resolve(playerState)
    }
  })
}

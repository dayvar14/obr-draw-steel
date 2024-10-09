import GithubIcon from '@icons/github.svg?react'
import DiscordIcon from '@icons/discord.svg?react'
import { APP_VERSION } from 'config'
import { Modal, Token } from '@obr'
import { SceneContext } from 'context/SceneContext'
import { useContext, useState } from 'react'
import clsx from 'clsx'

const SettingsList = () => {
  const sceneContext = useContext(SceneContext)

  if (!sceneContext) {
    return null
  }

  const [unsavedSettings, setUnsavedSettings] = useState(sceneContext.settings)

  const handleInputChange = (
    section: 'playerAccess' | 'grouping' | 'misc',
    field: string,
    value: boolean | string,
  ) => {
    setUnsavedSettings({
      ...unsavedSettings,
      [section]: {
        ...unsavedSettings[section],
        [field]: value,
      },
    })
  }

  const onSave = () => {
    sceneContext.setSettings(unsavedSettings)
    Modal.closeSettings()
  }

  return (
    <>
      <div className='settings-header'>
        <div>
          <h1>
            Draw Steel Initiative Tracker <small>v{APP_VERSION}</small>
          </h1>
        </div>

        <div className='settings-header-icons'>
          <a
            className='rounded-square-icon-button large'
            href='https://github.com/dayvar14/obr-draw-steel/'
            title='View on GitHub'
            target='_blank'
            rel='noopener noreferrer'
          >
            <GithubIcon className='filled colored large primary' />
          </a>
          <a
            className='rounded-square-icon-button large'
            href='https://discord.gg/8UhZHpjT88'
            title='Contact me on Discord'
            target='_blank'
            rel='noopener noreferrer'
          >
            <DiscordIcon className='filled colored large primary' />
          </a>
        </div>
      </div>
      <hr />
      <div className='settings-body'>
        <h3>Player Access</h3>
        <hr />
        <div>
          <div className='settings-item'>
            <p>Allow players to modify any turn.</p>
            <div className='settings-item-input'>
              <label className='switch'>
                <input
                  type='checkbox'
                  checked={unsavedSettings.playerAccess.canModifyAllTurns}
                  onChange={e =>
                    handleInputChange(
                      'playerAccess',
                      'canModifyAllTurns',
                      e.target.checked,
                    )
                  }
                />
                <span className='slider round'></span>
              </label>
            </div>
          </div>
          <div className={clsx('settings-item', {'settings-item-disabled': unsavedSettings.playerAccess.canModifyAllTurns})}
            title="Only applies if the player permission 'Owner Only' is enabled.">
            <p>Allow players to set their turns if player owned.</p>
            <div className='settings-item-input'>
              <label className={clsx('switch', {'disabled': unsavedSettings.playerAccess.canModifyAllTurns})}>
                <input
                  type='checkbox'
                  checked={unsavedSettings.playerAccess.canSetTurnIfPlayerOwned}
                  disabled={unsavedSettings.playerAccess.canModifyAllTurns}
                  onChange={e =>
                    handleInputChange(
                      'playerAccess',
                      'canSetTurnIfPlayerOwned',
                      e.target.checked,
                    )
                  }
                />
                <span className='slider round'></span>
              </label>
            </div>
          </div>
          <div className='settings-item'>
            <p>Let players see a tokens turn count</p>
            <div className='settings-item-input'>
              <label className='switch'>
                <input
                  type='checkbox'
                  checked={unsavedSettings.playerAccess.canseeTurnCount}
                  onChange={e =>
                    handleInputChange(
                      'playerAccess',
                      'canseeTurnCount',
                      e.target.checked,
                    )
                  }
                />
                <span className='slider round'></span>
              </label>
            </div>
          </div>
        </div>
        <h3>Grouping</h3>
        <hr />
        <div>
          <div className='settings-item'>
            <p>Enable grouping</p>
            <div className='settings-item-input'>
              <label className='switch'>
                <input
                  type='checkbox'
                  checked={unsavedSettings.grouping.isEnabled}
                  onChange={e =>
                    handleInputChange('grouping', 'isEnabled', e.target.checked)
                  }
                />
                <span className='slider round'></span>
              </label>
            </div>
          </div>
        </div>
        <div>
          <div className={clsx('settings-item', {'settings-item-disabled': !unsavedSettings.grouping.isEnabled})}>
            <p>Group tokens created by different users</p>
            <div className='settings-item-input'>
              <label className={clsx('switch', {'disabled': !unsavedSettings.grouping.isEnabled})}>
                <input
                  type='checkbox'
                  disabled={!unsavedSettings.grouping.isEnabled}
                  checked={unsavedSettings.grouping.groupTokensFromAllUsers}
                  onChange={e =>
                    handleInputChange(
                      'grouping',
                      'groupTokensFromAllUsers',
                      e.target.checked,
                    )
                  }
                />
                <span className='slider round'></span>
              </label>
            </div>
          </div>
        </div>
        <div>
          <div className={clsx('settings-item', {'settings-item-disabled': !unsavedSettings.grouping.isEnabled})}>
            <p>Grouping splitting mode</p>
            <div className='settings-item-input'>
              <select
                id='dropdown'
                className={clsx({'disabled': !unsavedSettings.grouping.isEnabled})}
                disabled={!unsavedSettings.grouping.isEnabled}
                value={unsavedSettings.grouping.groupSplittingMode}
                onChange={e =>
                  handleInputChange(
                    'grouping',
                    'groupSplittingMode',
                    e.target.value,
                  )
                }
              >
                <option value={Token.GroupSplittingMode.CLOSEST}>
                  Closest
                </option>
                <option value={Token.GroupSplittingMode.RANDOM}>Random</option>
                <option value={Token.GroupSplittingMode.STANDARD}>
                  Standard
                </option>
              </select>
            </div>
          </div>
        </div>
        <h3>Misc.</h3>
        <hr />
        <div>
          <div className='settings-item'>
            <p>Set flags color to player owner's color</p>
            <div className='settings-item-input'>
              <label className='switch'>
                <input
                  type='checkbox'
                  checked={unsavedSettings.misc.flagColorIsPlayerOwnerColor}
                  onChange={e =>
                    handleInputChange(
                      'misc',
                      'flagColorIsPlayerOwnerColor',
                      e.target.checked,
                    )
                  }
                />
                <span className='slider round'></span>
              </label>
            </div>
          </div>
        </div>
        <hr />
        <div className='settings-body-footnote'>
          <p>
            <small>
              If you happen upon any bugs, or would like a new feature,{' '}
              <a
                className='rounded-square-icon-button large'
                href='https://github.com/dayvar14/obr-draw-steel/issues/new/choose'
                title='Create an Issue'
                target='_blank'
                rel='noopener noreferrer'
              >
                create an issue in Github
              </a>{' '}
              and/or @StinkyPapaya on the{' '}
              <a
                className='rounded-square-icon-button large'
                href='https://discord.com/channels/795808973743194152/1082460044731371591'
                title='Create an Issue'
                target='_blank'
                rel='noopener noreferrer'
              >
                Owlbear Rodeo Discord
              </a>
            </small>
          </p>
        </div>
      </div>
      <div className='settings-footer'>
        <button onClick={onSave}>SAVE</button>
      </div>
    </>
  )
}

export default SettingsList

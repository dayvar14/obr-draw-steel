import GithubIcon from '@icons/github.svg?react'
import DiscordIcon from '@icons/discord.svg?react'
import { APP_VERSION } from 'config'
import { Group, Modal } from '@obr'
import { SettingsContext } from 'context/SettingsContext'
import { useContext, useState } from 'react'
import clsx from 'clsx'

const SettingsList = () => {
  const settingsContext = useContext(SettingsContext)

  if (!settingsContext) {
    return null
  }

  const [unsavedSettings, setUnsavedSettings] = useState(
    settingsContext.settings,
  )

  const handleInputChange = (
    section: 'main' | 'playerAccess' | 'grouping' | 'misc',
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
    settingsContext.setSettings(unsavedSettings)
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
        <h2>Main</h2>
        <hr />
        <div>
          <div className='settings-item'>
            <p>Enable Reactions</p>
            <div className='settings-item-input'>
              <label className='switch'>
                <input
                  type='checkbox'
                  checked={unsavedSettings.main.reactionsEnabled}
                  onChange={e =>
                    handleInputChange(
                      'main',
                      'reactionsEnabled',
                      e.target.checked,
                    )
                  }
                />
                <span className='slider round'></span>
              </label>
            </div>
          </div>
        </div>
        <h2>Player Access</h2>
        <hr />
        <div>
          <div className='settings-item'>
            <p>Allow players to adjust flags and open options.</p>
            <div className='settings-item-input'>
              <label className='switch'>
                <input
                  type='checkbox'
                  checked={unsavedSettings.playerAccess.canOpenAllOptions}
                  onChange={e =>
                    handleInputChange(
                      'playerAccess',
                      'canOpenAllOptions',
                      e.target.checked,
                    )
                  }
                />
                <span className='slider round'></span>
              </label>
            </div>
          </div>
          <div
            className={clsx('settings-item', {
              'settings-item-disabled':
                unsavedSettings.playerAccess.canOpenAllOptions,
            })}
            title="Only applies if the player permission 'Owner Only' is enabled."
          >
            <p>
              Allow players to adjust flags and open options if player owned.
            </p>
            <div className='settings-item-input'>
              <label
                className={clsx('switch', {
                  disabled: unsavedSettings.playerAccess.canOpenAllOptions,
                })}
              >
                <input
                  type='checkbox'
                  checked={
                    unsavedSettings.playerAccess.canOpenOptionsIfPlayerOwned
                  }
                  disabled={unsavedSettings.playerAccess.canOpenAllOptions}
                  onChange={e =>
                    handleInputChange(
                      'playerAccess',
                      'canOpenOptionsIfPlayerOwned',
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
                  checked={unsavedSettings?.playerAccess?.canSeeTurnCount}
                  onChange={e =>
                    handleInputChange(
                      'playerAccess',
                      'canSeeTurnCount',
                      e.target.checked,
                    )
                  }
                />
                <span className='slider round'></span>
              </label>
            </div>
          </div>
        </div>
        <h2>Grouping</h2>
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
          <div
            className={clsx('settings-item', {
              'settings-item-disabled': !unsavedSettings.grouping.isEnabled,
            })}
          >
            <p>Grouping splitting mode</p>
            <div className='settings-item-input'>
              <select
                id='dropdown'
                className={clsx({
                  disabled: !unsavedSettings.grouping.isEnabled,
                })}
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
                {Object.keys(Group.GroupSplittingMode).map(key => (
                  <option
                    key={key}
                    value={
                      Group.GroupSplittingMode[
                        key as keyof typeof Group.GroupSplittingMode
                      ]
                    }
                  >
                    {Group.getGroupSplittingName(
                      Group.GroupSplittingMode[
                        key as keyof typeof Group.GroupSplittingMode
                      ],
                    )}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* <h2>Misc.</h2>
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
        </div> */}
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
              and/or @StinkyPaps on the{' '}
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

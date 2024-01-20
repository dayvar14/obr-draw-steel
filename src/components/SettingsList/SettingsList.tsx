import GithubIcon from '@icons/github.svg?react'
import DiscordIcon from '@icons/discord.svg?react'
import { APP_VERSION } from 'config'
import { Modal } from '@obr'

const SettingsList = () => {
  return (
    <>
      <div className='settings-header'>
        <div>
          <h1>
            Draw Steel <small>v{APP_VERSION}</small>
          </h1>
          <p>
            <small>A MCDM RPG Initiative Tracker</small>
          </p>
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
                <input type='checkbox' />
                <span className='slider round'></span>
              </label>
            </div>
          </div>
          <div className='settings-item'>
            <p>Allow players to set their turns if player owned.</p>
            <div className='settings-item-input'>
              <label className='switch'>
                <input type='checkbox' />
                <span className='slider round'></span>
              </label>
            </div>
          </div>
          <div className='settings-item'>
            <p>Let players see a tokens turn count</p>
            <div className='settings-item-input'>
              <label className='switch'>
                <input type='checkbox' />
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
                <input type='checkbox' />
                <span className='slider round'></span>
              </label>
            </div>
          </div>
        </div>
        <div>
          <div className='settings-item'>
            <p>Group tokens created by different users</p>
            <div className='settings-item-input'>
              <label className='switch'>
                <input type='checkbox' />
                <span className='slider round'></span>
              </label>
            </div>
          </div>
        </div>
        <div>
          <div className='settings-item'>
            <p>Grouping splitting mode</p>
            <div className='settings-item-input'>
              <select id='dropdown'>
                <option value='option2'>Closest</option>
                <option value='option3'>Random</option>
                <option value='option1'>Standard</option>
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
                <input type='checkbox' />
                <span className='slider round'></span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className='settings-footer'>
        <button
          onClick={() => {
            Modal.closeSettings()
          }}
        >
          SAVE
        </button>
      </div>
    </>
  )
}

export default SettingsList

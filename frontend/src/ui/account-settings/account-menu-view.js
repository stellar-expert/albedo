import React from 'react'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'
import accountManager from '../../state/account-manager'
import Avatar from './avatar-view'
import './account-menu.scss'

@observer
class AccountMenuView extends React.Component {
    constructor(props) {
        super(props)
        this.clickOutsideHandler = this.hide.bind(this)
    }

    onAccountClick(account, header) {
        //select the account
        accountManager.setActiveAccount(account)
        this.hide()
    }

    componentDidMount() {
        window.addEventListener('click', this.clickOutsideHandler, true)
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.clickOutsideHandler, true)
    }

    show() {
        if (!accountManager.selectorVisible) {
            accountManager.selectorVisible = true
        }
    }

    hide() {
        if (accountManager.selectorVisible) {
            accountManager.selectorVisible = false
        }
    }

    toggle() {
        accountManager.selectorVisible = !accountManager.selectorVisible
    }

    renderAccountOption(account) {
        return <a href="#" style={{display: 'block'}} className="nowrap"
                  onClick={e => this.onAccountClick(account)}>
            <Avatar account={account}/><span title={account.id}>{account.displayName}</span>
        </a>
    }

    renderSelected() {
        const {activeAccount} = accountManager
        if (activeAccount) {
            return <div>
                <a href="#" style={{display: 'block'}} onClick={e => this.toggle()} className="nowrap">
                    <Avatar account={activeAccount}/><span className="id" title={activeAccount.id}>{activeAccount.displayName}</span>
                </a>
            </div>
        } else {
            return <div><a href="#" onClick={e => __history.push('/login')}>Log in</a></div>
        }
    }

    renderSelectedAccountMenu() {
        const {activeAccount} = accountManager
        if (activeAccount) {
            return <div className="active-account-actions">
                <div style={{float: 'left'}}>
                    <Avatar account={activeAccount} size={58} className="large"/>
                </div>
                <div title={activeAccount.displayName}><span className="id">{activeAccount.displayName}</span></div>
                <a href="/account" className="button">Settings</a>
                <div style={{clear: 'both'}}/>
            </div>
        }
        if (accountManager.accounts.length) {
            return <div className="dimmed">
                Please select account from the list or login/create another account.
            </div>
        }
    }

    render() {
        const {activeAccount} = accountManager
        const accounts = accountManager.accounts.filter(a => a !== activeAccount)

        return <div className="account-menu">
            <div>
                {this.renderSelected()}
            </div>
            <div className={`options ${accountManager.selectorVisible && 'visible'}`}>
                <div className="active-block">
                    {this.renderSelectedAccountMenu()}
                </div>
                {accounts.length > 0 && <ul>
                    {accounts.map(account => activeAccount !== account &&
                        <li className="account-option" key={account.id}>{this.renderAccountOption(account)}</li>)}

                </ul>}
                <div className="active-block active-account-actions"
                     style={accounts.length ? undefined : {marginTop: '-1.2em'}}>
                    <a className="button button-outline" href="/login">
                        Another Account
                    </a>
                    <a href="#" title="Sign out" className="dimmed" style={{marginLeft: '1em'}}
                       onClick={e => accountManager.signOut(activeAccount)}>
                        Sign Out
                    </a>
                </div>
            </div>
        </div>
    }
}

export default AccountMenuView

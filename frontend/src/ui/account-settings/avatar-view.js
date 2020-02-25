import React from 'react'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import {generateIdenticon} from '../../util/identicon-generator'
import './avatar.scss'

function AvatarView({account, size = 36, className}) {
    if (account.avatar) return <div>img with avatar {account.avatar}</div>
    const dataUrl = 'data:image/svg+xml;base64,' + generateIdenticon(account.id, size)
    return <span className={cn('avatar', {decrypted: !!account.keypairs}, className)}
                 style={{backgroundImage: `url(${dataUrl})`, width: size + 'px', height: size + 'px'}}/>
}

AvatarView.propTypes = {
    account: PropTypes.object.isRequired,
    className: PropTypes.string,
    size: PropTypes.number
}

export default observer(AvatarView)

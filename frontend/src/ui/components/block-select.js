import React from 'react'
import PropTypes from 'prop-types'

function select(target) {
    const range = document.createRange()
    range.selectNodeContents(target)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
}

function BlockSelect({children, title, maxWidth, wrap}) {
    const props = {
        className: 'block-select',
        onFocus: e => select(e.target),
        tabIndex: '-1'
    }
    if (title) {
        props.title = title
    }
    if (maxWidth) {
        props.style = {maxWidth}
    }
    if (wrap) {
        props.style = Object.assign(props.style || {}, {whiteSpace: 'normal', overflow: 'visible'})
    }
    return <span {...props}>{children}</span>
}

BlockSelect.propTypes = {
    children: PropTypes.any.isRequired,
    title: PropTypes.string,
    maxWidth: PropTypes.string,
    wrap: PropTypes.bool
}

export default BlockSelect
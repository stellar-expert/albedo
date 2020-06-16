import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import './dropdown.scss'

class Dropdown extends React.Component {
    constructor(props) {
        super(props)
        this.state = {listOpen: false}
        this.collapseDropdown = this.collapseDropdown.bind(this)
    }

    static propTypes = {
        options: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            id: PropTypes.string,
            title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
            hidden: PropTypes.bool
        }), PropTypes.string])).isRequired,
        onChange: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        hideToggle: PropTypes.bool,
        hideSelected: PropTypes.bool,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }

    componentDidMount() {
        document.addEventListener('click', this.collapseDropdown)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.collapseDropdown)
    }

    collapseDropdown() {
        this.setState({listOpen: false})
    }

    toggleList(e) {
        e && e.nativeEvent.stopImmediatePropagation()
        if (this.props.disabled) return
        this.setState(prevState => ({listOpen: !prevState.listOpen}))
    }

    select(e, option) {
        e.preventDefault()
        this.collapseDropdown()
        const {onChange} = this.props
        onChange && onChange(option.value || option, this)
    }

    isSelected(item) {
        const {value} = this.props
        return (typeof item === 'string') ? item === value : item.value === value
    }

    getSelectedItem() {
        const {options} = this.props
        return options.find(item => this.isSelected(item)) || options[0]
    }

    renderOption(option, selected) {
        if (option.hidden) return
        if (this.props.hideSelected && this.isSelected(option)) return null
        const {id, value, title} = option
        if (value === '') return <li key="space">
            <hr/>
        </li>
        return <li className="dd-list-item" key={id || value || option} onClick={e => this.select(e, option)}>
            <a href="#" className={selected ? 'selected' : ''}>{title || value || option}</a>
        </li>
    }

    render() {
        const {options, disabled, hideToggle} = this.props,
            {listOpen} = this.state,
            selectedItem = this.getSelectedItem()
        return <div className={cn('dd-wrapper', {disabled})}>
            <a href="#" className="dd-header" onClick={e => this.toggleList(e)}>
                {selectedItem.title || selectedItem.value || selectedItem}
                {!hideToggle && <span className={cn('dd-toggle', {visible: listOpen})}/>}
            </a>
            {!disabled && <ul className={cn('dd-list', {visible: listOpen})}>
                {options.map(option => this.renderOption(option, option === selectedItem))}
            </ul>}
        </div>
    }
}

export default Dropdown
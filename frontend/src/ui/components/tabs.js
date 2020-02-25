import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import './tabs.scss'

class Tabs extends React.Component {
    constructor(props) {
        super(props)
        this.state = {selected: props.selectedTab === undefined && this.getSelectedTabFromProps(props)}
    }

    static propTypes = {
        tabs: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.isRequired,
            render: PropTypes.func.isRequired,
            title: PropTypes.string,
            isDefault: PropTypes.bool
        })).isRequired,
        className: PropTypes.string,
        onChange: PropTypes.func,
        selectedTab: PropTypes.string
    }

    findTabByName(tabName) {
        return this.props.tabs.find(t => t.name === tabName)
    }

    getSelectedTabFromProps({tabs, selectedTab}) {
        //try to retrieve from props
        if (selectedTab) {
            if (this.findTabByName(selectedTab)) return selectedTab
        }
        //try to retrieve from state
        if (this.state && this.state.selected) return this.state.selected
        //return first tab
        let firstTab = tabs[0]
        if (!firstTab) return null
        return firstTab.name
    }

    selectTab(tabName) {
        const tab = this.findTabByName(tabName)
        if (tab) {
            const {queryParam, onChange, selectedTab} = this.props
            if (onChange) {
                onChange(tabName, this)
            }
            if (selectedTab === undefined) {
                this.setState({selected: tabName})
            }
        }
    }

    render() {
        const {className, tabs, selectedTab, children} = this.props,
            {selected} = this.state,
            s = selectedTab || selected,
            tabToRender = tabs.find(({name}) => name === s)

        return <div className={`tabs${className ? ' ' + className : ''}`}>
            <div className="tabs-header">
                <div>
                    {tabs.map(({name, title}) => <a href="#" key={name} onClick={() => this.selectTab(name)}
                                                    className={cn('tabs-item', {selected: s === name})}>
                        {title || name}</a>)}
                </div>
                {children}
            </div>
            <div className="tabs-body">
                {tabToRender.render()}
            </div>
        </div>
    }
}

export default Tabs
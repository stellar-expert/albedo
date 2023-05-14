import React, {useRef, useState} from 'react'
import {observer} from 'mobx-react'
import {Dropdown, AssetLink, useAssetList} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import './asset-selector.scss'

function AssetSelectorView({value, predefinedAssets, onChange, restricted, title}) {
    const [search, setSearch] = useState(''),
        searchRef = useRef(),
        options = []
    if (predefinedAssets) {
        for (let asset of predefinedAssets) {
            options.push({
                value: asset,
                title: <AssetLink link={false} asset={asset}/>,
                hidden: search && !asset.split('-')[0].toLowerCase().includes(search.toLowerCase())
            })
        }
    }
    let loadNextPage
    if (!restricted) {
        const {assets, loadPage, loading} = useAssetList({search: search?.trim() || undefined})
        for (let {asset} of assets) {
            if (!predefinedAssets || !predefinedAssets.includes(asset)) {
                options.push({value: asset, title: <AssetLink link={false} asset={asset}/>})
            }
        }
        if (!options.filter(opt => !opt.hidden).length) {
            if (loading) {
                options.push({value: '...', disabled: true, title: <div className="loader" style={{fontSize: '0.72em', margin: '0 auto'}}/>})
            } else {
                options.push({
                    value: 'no',
                    disabled: true,
                    title: <div className="dimmed text-center text-small" style={{lineHeight: '23px', minHeight: '23px'}}>(not found)</div>
                })
            }
        }
        loadNextPage = loadPage
    }
    if (!accountLedgerData.loaded) return <>{title} </> || null

    function focusSearch() {
        setTimeout(() => searchRef.current?.focus(), 200)
    }

    return <Dropdown solo className="asset-selector" options={options} value={value} onOpen={focusSearch} title={title}
                     showToggle={!title} onChange={onChange} onScroll={e => e.rel === 'bottom' && loadNextPage?.call(this)} header={<>
        <h3>Select an asset</h3>
        <div className="relative">
            <input type="text" value={search} ref={searchRef} onChange={e => setSearch(e.target.value)} placeholder="Search by asset code or website"/>
            <i className="icon-search dimmed"/>
        </div>
    </>}/>
}

export default observer(AssetSelectorView)
import React, {useRef, useState} from 'react'
import {observer} from 'mobx-react'
import {Dropdown, AssetLink, useAssetList} from '@stellar-expert/ui-framework'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import './asset-selector.scss'

function AssetSelectorItem({asset}) {
    return <span>
        <AssetLink link={false} asset={asset}/>
    </span>
}

function AssetSelectorView({value, predefinedAssets, onChange, restricted}) {
    const [search, setSearch] = useState(''),
        searchRef = useRef(),
        options = []
    if (!predefinedAssets.length) {
        predefinedAssets = ['XLM']
    }
    for (let asset of predefinedAssets) {
        options.push({
            value: asset,
            title: <AssetSelectorItem asset={asset}
                                      hidden={search && !asset.split('-')[0].toLowerCase().includes(search.toLowerCase())}/>
        })
    }
    let loadNextPage
    if (!restricted) {
        const {assets, loadPage, loading} = useAssetList({search: search?.trim() || undefined})
        for (let {asset} of assets) {
            if (!predefinedAssets.includes(asset)) {
                options.push({value: asset, title: <AssetSelectorItem asset={asset}/>})
            }
        }
        if (!options.length) {
            if (loading) {
                options.push({value: '...', disabled: true, title: <div className="loader"/>})
            } else {
                options.push({
                    value: 'no',
                    disabled: true,
                    title: <span className="dimmed text-center text-small">(not found)</span>
                })
            }
        }
        loadNextPage = loadPage
    }
    if (!accountLedgerData.loaded) return null

    function focusSearch() {
        setTimeout(() => searchRef.current?.focus(), 200)
    }

    const header = <>
        <h3>Select an asset</h3>
        <div className="relative">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                   placeholder="Search by code or domain" ref={searchRef}/>
            <i className="icon-search dimmed"/>
        </div>
    </>
    return <Dropdown options={options} value={value} className="asset-selector" header={header} solo
                     onChange={v => onChange(v)} onOpen={focusSearch}
                     onScroll={e => e.rel === 'bottom' && loadNextPage?.call(this)}/>
}

export default observer(AssetSelectorView)
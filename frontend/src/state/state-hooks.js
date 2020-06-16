import {useState, useEffect, useRef} from 'react'
import isEqual from 'react-fast-compare'

function ensureDependencies(dependencies){
    if (!(dependencies instanceof Array))
        throw new Error('Parameter dependencies is required for useDependantState hook')
}

/**
 * React hook that automatically re-inits state when one of the dependencies changed
 * @param {Function|any} stateInitializer
 * @param {Array} dependencies
 * @param {Function} [finalizer]
 * @returns {[Object, Function]}
 */
function useDependantState(stateInitializer, dependencies, finalizer) {
    //ensureDependencies(dependencies)
    const [state, updateState] = useState(function () {
        return typeof stateInitializer === 'function' ? stateInitializer(dependencies) : stateInitializer
    })
    //re-initialize state when any of the dependencies changed
    useDeepEffect(function () {
        updateState(typeof stateInitializer === 'function' ? stateInitializer(dependencies) : stateInitializer)
        return finalizer || undefined
    }, dependencies)
    return [state, updateState]
}

/**
 * UseEffect hooks that uses a deep comparison instead of shallow comparison available in Rect useEffect.
 * @param {Function} effect
 * @param {Array} dependencies
 */
function useDeepEffect(effect, dependencies) {
    ensureDependencies(dependencies)
    //pin dependencies object to invoke effect update only if dependencies changed
    const pinnedDeps = useRef([])
    //check that dependencies really changed
    if (!isEqual(dependencies, pinnedDeps.current)){
        pinnedDeps.current = dependencies
    }
    //effect invokes the initializer each time dependencies changed
    useEffect(effect, pinnedDeps.current)
}

export {useDependantState, useDeepEffect}
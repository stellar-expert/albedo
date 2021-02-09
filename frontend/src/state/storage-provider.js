class LocalStorageProvider {
    /**
     * Load an item from the storage by its key
     * @param {String} key
     * @return {Promise<String>}
     */
    async getItem(key) {
        return localStorage.getItem(key)
    }

    /**
     * Save and item to the storage
     * @param {String} key
     * @param {String} value
     * @return {Promise<void>}
     */
    async setItem(key, value) {
        localStorage.setItem(key, value)
    }

    /**
     * Remove an item from the storage by its key
     * @param {String} key
     * @return {Promise<void>}
     */
    async removeItem(key) {
        localStorage.removeItem(key)
    }

    /**
     * List all storage keys
     * @return {Promise<Array<String>>}
     */
    async enumerateKeys() {
        return Object.keys(localStorage)
    }
}

//try to find the local interface override
let storageProvider = new LocalStorageProvider()

const alternativeProvider = window.albedoStorageProvider

//check if we have the override and check for required interface methods using duck-typing
if (typeof alternativeProvider !== 'undefined' && alternativeProvider.getItem && alternativeProvider.setItem) {
    storageProvider = alternativeProvider
}

export default storageProvider
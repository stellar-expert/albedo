class Navigation {
    constructor(history, container) {
        this.history = window.__history = history
        this.bindNavigation(container)
    }

    history

    bindNavigation(topContainer) {
        topContainer.addEventListener('click', e => {
            //ignore ctrl+click
            if (e.ctrlKey) return
            let link = e.target
            while (link && link.tagName.toLowerCase() !== 'a') {
                link = link.parentElement
            }
            if (link) {
                const href = link.getAttribute('href')
                // Skip empty links
                if (href === '#') return e.preventDefault()
                // Sometimes links don't have href (null received)
                if (!href) return
                //Skip external links
                if (link.target === '_blank') return
                if (link.classList.contains('external-link')) return
                if (/^(mailto:|tel:|(https?):\/\/)/.test(href)) return

                let currentLocation = window.location

                e.preventDefault()
                // When history works, internal links sometimes should not trigger page refresh
                if ((currentLocation.pathname + currentLocation.search) === href) return
                this.history.push(href)
                setTimeout(() => {
                    document.body.scrollIntoView({behavior: 'smooth'})
                }, 200)

            }
        })
    }
}

export default Navigation
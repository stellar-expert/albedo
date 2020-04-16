import React from 'react'
import PropTypes from 'prop-types'
import hljs from 'highlight.js/lib/highlight'
import jsLang from 'highlight.js/lib/languages/javascript'
import jsonLang from 'highlight.js/lib/languages/json'
import htmlLang from 'highlight.js/lib/languages/xml'
import plaintextLang from 'highlight.js/lib/languages/plaintext'
import './highlight.scss'
import cn from 'classnames'

hljs.registerLanguage('js', jsLang)
hljs.registerLanguage('json', jsonLang)
hljs.registerLanguage('html', htmlLang)
hljs.registerLanguage('plain', plaintextLang)

hljs.getLanguage('js').keywords.built_in += ' albedo'

function Highlight({children, className, lang}) {
    if (lang) {
        lang = lang.split(',')
    }
    const languageFilter = lang || ['js', 'json'],
        highlighted = hljs.highlightAuto(children, languageFilter)
    return <pre dangerouslySetInnerHTML={{__html: highlighted.value}} className={cn('hljs', className)}/>
}

Highlight.propTypes = {
    children: PropTypes.string.isRequired,
    className: PropTypes.string,
    lang: PropTypes.oneOf(['js', 'json', 'html', 'plain'])
}

export default Highlight
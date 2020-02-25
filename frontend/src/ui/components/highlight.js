import React from 'react'
import PropTypes from 'prop-types'
import hljs from 'highlight.js/lib/highlight'
import jsLang from 'highlight.js/lib/languages/javascript'
import jsonLang from 'highlight.js/lib/languages/json'
import './highlight.scss'
import cn from 'classnames'

hljs.registerLanguage('js', jsLang)
hljs.registerLanguage('json', jsonLang)
hljs.getLanguage('js').keywords.built_in += ' albedo'

function Highlight({children, className}) {
    const highlighted = hljs.highlightAuto(children)
    return <pre dangerouslySetInnerHTML={{__html: highlighted.value}} className={cn('hljs', className)}/>
}

Highlight.propTypes = {
    children: PropTypes.string.isRequired,
    className: PropTypes.string
}

export default Highlight
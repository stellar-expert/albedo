import React, {useRef, useState} from 'react'

export default function DemoHtmlPreviewView({script, selectedTab}) {
    const previewContainer = useRef(null),
        [visible, setVisible] = useState(false)

    function generateCode() {
        switch (selectedTab) {
            case 'script':
                return `<button id="intent_button">Test</button>
<script>
document.getElementById('intent_button').addEventListener('click', function(e){ 
    ${script}  
}, false)
</script>`
            case 'button':
            case 'link':
                return script
        }
    }

    function injectPreview(container) {
        previewContainer.current = container
        updatePreviewContainer()
    }

    function updatePreviewContainer() {
        const container = previewContainer.current
        if (container) {
            container.innerHTML = `<div style="text-align: center;padding-top:2em">${generateCode()}</div>`
            const scriptTags = Array.from(container.querySelectorAll('script'))
            for (const oldScript of scriptTags) {
                const newScript = document.createElement('script')
                Array.from(oldScript.attributes)
                    .forEach(attr => newScript.setAttribute(attr.name, attr.value))
                if (oldScript.innerHTML) {
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML))
                }
                oldScript.parentNode.replaceChild(newScript, oldScript)
            }
        }
    }

    updatePreviewContainer()

    if (!visible) return <a href="#" className="dimmed text-small" onClick={() => setVisible(true)}>
        <i className="fa fa-angle-double-down"/> Show {selectedTab} preview
    </a>
    return <>
        <a href="#" className="dimmed text-small" onClick={() => setVisible(false)}>
            <i className="fa fa-angle-double-up"/> Hide {selectedTab} preview
        </a>
        <iframe src="/button-preview.html" frameBorder="0" style={{border: '1px solid #ddd', width: '100%'}}
                onLoad={e => injectPreview(e.target.contentDocument.body)}/>
    </>
}
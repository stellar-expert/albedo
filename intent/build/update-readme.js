const fs = require('fs'),
    path = require('path'),
    {generateIntentsSection} = require('./generate-intents-description')

const startMarker = '### Intents'

const readmePath = path.join(path.dirname(process.argv[1]), '../README.MD')

let contents = fs.readFileSync(readmePath, 'utf8'),
    startFrom = contents.indexOf(startMarker)

if (startFrom < 0) throw new Error(`Intents section not found`)

startFrom += startMarker.length + 1

const prevSection = contents.substr(0, startFrom)

contents = contents.substr(startFrom)

const nextSectionStart = contents.search(/\n#{1,3} /)

const nextSection = nextSectionStart < 0 ? '' : contents.substr(nextSectionStart)

//rewrite the contents
contents = prevSection + '\n' + generateIntentsSection() + nextSection
fs.writeFileSync(readmePath, contents)

console.log(`Updated ${readmePath}`)
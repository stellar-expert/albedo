const fs = require('fs'),
    path = require('path'),
    archiver = require('archiver')

console.log('Building extension deploy package...')

const extensionDistrPath = path.join(__dirname, '../distr/extension'),
    outputPath = path.join(__dirname, '../distr/extension.zip'),
    archive = archiver('zip', {zlib: {level: 7}})

archive.on('warning', function (err) {
    if (err.code !== 'ENOENT') throw err
    console.warn(err)
})

const output = fs.createWriteStream(outputPath)
output.on('close', function () {
    console.log(`Extension package ${outputPath} created – ${Math.ceil(archive.pointer() / 1024)}KB`)
})
archive.pipe(output)

archive.directory(extensionDistrPath, false)
archive.finalize()
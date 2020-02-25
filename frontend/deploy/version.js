const fs = require('fs'),
    path = require('path'),
    {version} = require('../package')

/**
 * Process the contents of file using regex-based search-replace.
 * @param {String} filePath - File to process.
 * @param {RegExp} search - Regex search pattern.
 * @param {String} replace - Replacement string.
 */
function replaceInFile(filePath, search, replace) {
    filePath = path.join(__dirname, filePath)
    const tmp = filePath + `.tmp`,
        //read and replace file contents
        content = fs.readFileSync(filePath, 'utf8').replace(search, replace)
    //write temp file contents
    fs.writeFileSync(tmp, content, 'utf8')
    //replace the original file with temp file
    fs.renameSync(tmp, filePath)
}
//update version in index.html
replaceInFile('../src/public/index.html', /\?v=[\d.]+/gi, '?v=' + version)
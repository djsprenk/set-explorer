const fs = require('fs')
const parser = require('xml2json')

const inputFileLocation = './vdj-export/database.xml'
const outputFileLocation = './processed-files/database.json'

fs.readFile(inputFileLocation, function (err, data) {
  if (err) {
    console.error(err)
    return
  }
  const json = parser.toJson(data)
  fs.writeFile(outputFileLocation, json, {}, function (err) {
    console.error(err)
  })
})

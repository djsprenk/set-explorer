const fs = require('fs')

const rootFolder = './processed-files'
const jsonDatabase = `${rootFolder}/database.json`
const outputFileLocation = `${rootFolder}/zouk-sets.json`

const database = JSON.parse(fs.readFileSync(jsonDatabase, 'utf8'))

if (!database) {
  console.error('Database not found')
}

const songList = database.VirtualDJ_Database.Song
const zoukSets = []

for (const i in songList) {
  const song = songList[i]
  const tags = song.Tags
  if (Object.hasOwnProperty.call(tags, 'Genre') && Object.hasOwnProperty.call(tags, 'Author')) {
    const genre = tags.Genre
    const author = tags.Author

    if (genre.trim().toLowerCase() === 'zouk set' && author.trim().toLowerCase() === 'dj sprenk') {
      zoukSets.push(song)
    }
  }
}

fs.writeFile(outputFileLocation, JSON.stringify(zoukSets), {}, function (err) {
  console.error(err)
})

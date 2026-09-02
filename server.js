const http = require( 'http' ),
      fs   = require( 'fs' ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you're testing this on your local machine.
      // On Render, make sure `npm install` is your build command.
      path = require( 'path' ),
      mime = require( 'mime' ),
      dir  = path.join(__dirname, 'public'),
      port = 3000

let nextId = 4

// const appdata = [
//   { 'model': 'toyota', 'year': 1999, 'mpg': 23 },
//   { 'model': 'honda', 'year': 2004, 'mpg': 30 },
//   { 'model': 'ford', 'year': 1987, 'mpg': 14} 
// ]

const appdata = [
  {
    id: 1,
    name: 'John Doe',
    class: 'Paladin',
    species: 'Human',
    level: 5,
    currHp: 40,
    maxHp: 40,
    status: 'Alive'
  },

  {
    id: 2,
    name: 'Jane Smith',
    class: 'Wizard',
    species: 'Elf',
    level: 3,
    currHp: 10,
    maxHp: 20,
    status: 'Bloodied'
  },

  {
    id: 3,
    name: 'Max',
    class: 'Rogue',
    species: 'Halfling',
    level: 2,
    currHp: 0,
    maxHp: 15,
    status: 'Dead'
  }
]

function getStatus( currHp, maxHp ) {
  if ( currHp <= 0 ) {
    return 'Dead'
  } 
  
  else if ( currHp <= maxHp / 2 ) {
    return 'Bloodied'
  }

  return 'Alive'
}

function sendJson( response, status, data ) {
  response.writeHead( status, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end( JSON.stringify( data ) )
}

function parseCharacter(data, existingId = null) {
  const name = String(data.name || '').trim()
  const characterClass = String(data.class || '').trim()
  const species = String(data.species || '').trim()
  const level = Number(data.level)
  const currHp = Number(data.currHp)
  const maxHp = Number(data.maxHp)

  if (!name || !characterClass || !species) {
    throw new Error('Name, class, and species are required.')
  }

  if (!Number.isInteger(level) || level < 1 || level > 20) {
    throw new Error('Level must be an int from 1 to 20.')
  }

  if (!Number.isFinite(currHp) || !Number.isFinite(maxHp) || maxHp < 1) {
    throw new Error('Current HP and max HP must be valid numbers.')
  }

  if (currHp < 0 || currHp > maxHp) {
    throw new Error('Current HP must be between 0 and max HP.')
  }

  return {
      id: existingId,
      name,
      class: characterClass,
      species,
      level,
      currHp,
      maxHp,
      status: getStatus(currHp, maxHp)
  }
}

const server = http.createServer( function( request,response ) {
  if( request.method === 'GET' ) {
    handleGet( request, response )    
  }else if( request.method === 'POST' ){
    handlePost( request, response ) 
  }
})

const handleGet = function( request, response ) {
  if (request.url === '/data') {
    sendJson( response, 200, appdata )
    return
  }

  const requestedPath = request.url === '/' ? '/index.html' : request.url
  const filename = path.normalize(path.join(dir, requestedPath))

  if (!filename.startsWith(dir)) {
    response.writeHead(403)
    response.end('403 Forbidden')
    return
  }

  sendFile(response, filename)
}

const handlePost = function(request, response) {
    let dataString = ''

    request.on('data', function(data) {
        dataString += data
    })

    request.on('end', function() {
        let data

        try {
          data = JSON.parse(dataString)
        } catch (error) {
          sendJson(response, 400, { error: 'Invalid JSON.' })
          return
        }

        if (request.url === '/add') {
          try {
            const character = parseCharacter(data)
            character.id = nextId++
            appdata.push(character)
            sendJson(response, 200, appdata)
          } catch (error) {
            sendJson(response, 400, { error: error.message })
          }
          return
        }

        else if (request.url === '/update') {
          const id = Number(data.id)
          const index = appdata.findIndex(character => character.id === id)

          if (index === -1) {
            sendJson(response, 404, { error: 'Character not found.' })
            return
          }

          try {
            const updatedCharacter = parseCharacter(data, id)
            appdata[index] = updatedCharacter
            sendJson(response, 200, appdata)
          } catch (error) {
            sendJson(response, 400, { error: error.message })
          }

          return
        }

        else if (request.url === '/delete') {
          const id = Number(data.id)
          const index = appdata.findIndex(character => character.id === id)

          if (index === -1) {
            sendJson(response, 404, { error: 'Character not found.' })
            return
          }

          appdata.splice(index, 1)
          sendJson(response, 200, appdata)
          return
        }

        else if (request.url === '/hp') {
          const id = Number(data.id)
          const amount = Number(data.amount)

          const character = appdata.find(function(character) {
            return character.id === id
          })

          if (!character) {
            sendJson(response, 404, { error: 'Character not found.' })
            return
          }

          if (!Number.isFinite(amount)) {
            sendJson(response, 400, { error: 'HP amount must be a number.' })
            return
          }

          character.currHp = Math.max(
            0,
            Math.min(character.maxHp, character.currHp + amount)
          )

          character.status = getStatus(character.currHp, character.maxHp)

          sendJson(response, 200, appdata)
          return
        }

        sendJson(response, 404, { error: 'API endpoint not found.' })
    })
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we've loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { 'Content-Type': type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })
}

server.listen( process.env.PORT || port )

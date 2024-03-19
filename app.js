const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000')
    })
  } catch (err) {
    console.log(`Database Error: ${err.message}`)
    process.exit(1)
  }
}
initializeDatabaseAndServer()

const dbObjToResponseObj = dbObj => {
  const responseObj = {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  }
  return responseObj
}

//API 1 ---> Returns a list of all players in the team
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
        SELECT
            *
        FROM
            cricket_team
        
    `
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => {
      return dbObjToResponseObj(eachPlayer)
    }),
  )
  return playersArray
})

// API 2 ---> Creates a new player in the team(database)
app.post('/players/', async (request, response) => {
  const playerDetails = request.body

  const {playerName, jerseyNumber, role} = playerDetails

  const addPlayerQuery = `
    INSERT INTO
      cricket_team(player_name, jersey_number, role)
    VALUES
      (
        '${playerName}',
        '${jerseyNumber}',
        '${role}'
      )
      
  `
  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//API 3 ---> Returns a player based on a player ID
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerIdQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};
  `
  const player = await db.get(getPlayerIdQuery)
  const playerObj = dbObjToResponseObj(player)
  response.send(playerObj)
  
})

//API 4 ---> Updates the details of a player in the team (database) based on the player ID
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  console.log(playerDetails)
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
      player_name = '${playerName}',
      jersey_number = '${jerseyNumber}',
      role = '${role}'
    WHERE
      player_id = ${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params

  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId}
  `
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app

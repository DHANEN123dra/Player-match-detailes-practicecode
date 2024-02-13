const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
const app = express()
app.use(express.json())

let db = null
const intiliazeDbAndServer = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('Server running sucessfully')
    })
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}

intiliazeDbAndServer()

const convertPlayerDbObjectToResponseObject = newObject => {
  return {
    playerId: newObject.player_id,
    playerName: newObject.player_name,
  }
}

const convertMatchDbObjectToResponseObject = newObject => {
  return {
    matchId: newObject.match_id,
    match: newObject.match,
    year: newObject.year,
  }
}

const convertplayerMatchDbObjectToResponseObject = newObject => {
  return {
    playerMatchId: newObject.player_match_id,
    playerId: newObject.player_id,
    matchId: newObject.match_id,
    score: newObject.score,
    fours: newObject.fours,
    sixes: newObject.sixes,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
     player_details ;`

  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => {
      convertPlayerDbObjectToResponseObject(playersArray)
    }),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `SELECT
       *
     From
      player_details
     WHERE
      playerId = ${player_id};`
  const player = await db.get(getPlayerQuery)
  response.send(convertPlayerDbObjectToResponseObject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const UpdateQuery = `
    UPDATE 
     player_details
    SET
    player_name ='${playerName}'
    WHERE
     player_id = ${playerId};`

  await db.run(UpdateQuery)
  response.send('Player Details Updated')
})

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getmatchQuery = `
    SELECT
      *
    FROM
     match_details
    WHERE
     match_id=${matchId} ;`

  const matchArray = await db.get(getmatchQuery)
  response.send(convertMatchDbObjectToResponseObject(matchArray))
})

app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getplayerMatchDetailesQuery = `
  SELECT
    *
  FROM
    player_match_score NATURAL JOIN match_details 
  WHERE
   player_id = ${playerId} ;`
  const playerDetailesArray = await db.all(getplayerMatchDetailesQuery)
  response.send(
    playerDetailesArray.map(eachPlayer =>
      convertMatchDbObjectToResponseObject(eachPlayer),
    ),
  )
})

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getPlayerMatchQuery = `
  SELECT
    *
  FROM
   player_match_score NATURAL JOIN player_details 
  WHERE
  player_id = ${playerId};`

  const PlayerMatchArray = await db.all(getplayerMatchDetailesQuery)
  response.send(
    PlayerMatchArray.map(eachplayerdetailes =>
      convertPlayerDbObjectToResponseObject(eachplayerdetailes),
    ),
  )
})

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getplayerstats = `
 SELECT
  player_id as playerID,
  player_name as playerName,
  SUM(score) as totalScore
  SUM (fours) as totalFours,
  SUM(sixes) as totalSixes
 FROM 
  player_match_score NATURAL JOIN player_details
 WHERE
  player_id = ${playerId};
 `
 const arrayofDetailes = await db.get(getplayerstats)
 response.send(arrayofDetailes)
})

module.exports = app

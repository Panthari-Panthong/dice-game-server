const { Router } = require('express')
const Room = require('./model')
const auth = require('../server/auth/middleware')
const router = new Router()
const Sse = require('json-sse')
const stream = new Sse()
//const gameStream = new Sse()

const getData = async () => {
  const limit = 2000
  const offset = 0
  const rooms = await Room.findAll({ limit, offset })
  //.then(result => res.json(result))
  //.catch(error => next(error))
  //console.log(rooms.dataValues)
  const data = JSON.stringify(rooms)
  return data
  //console.log('rooms in db', data)
  //you can include names of players
}

const updateStream = async () => {
  const data = await getData()
  stream.send(data)
}

router.post('/room', auth, (req, res, next) => {
  console.log('req user id!:', req.user.dataValues.id)
  // use req.user: to get player 1 id <-- works!
  // patch: req.user: to get player 2
  // patch: req.user: to know who's turn it is

  console.log('req body: ', req.body)
  Room.create({
    room_name: req.body.room_name,
    player1_id: req.user.dataValues.id
  })
    .then(result => {
      console.log(result.id)
      res.send({ id: result.id })
      updateStream()
    })
    .catch(next)
})


router.get('/room', async (req, res, next) => {
  const data = await getData()
  // const limit = req.query.limit || 2000
  // const offset = req.query.offset || 0
  // const rooms = await Room.findAll({ limit, offset })
  // //.then(result => res.json(result))
  // //.catch(error => next(error))
  // //console.log(rooms.dataValues)
  // const data = JSON.stringify(rooms)
  // //console.log('rooms in db', data)
  stream.updateInit(data) // put the data in the stream
  stream.init(req, res) // starts the stream
})


// router.get('/room/:id', (req, res, next) =>
//   Room.findByPk(req.params.id)
//    .then(room => { res.json(room)
//       const data = JSON.stringify(room)
//       gameStream.updateInit(data) // put the data in the stream
//       gameStream.init(req, res) // starts the stream
//     })
//     .catch(next)
// )

router.patch('/room/:id', auth, async (req, res, next) => {
  room = await Room.findByPk(req.params.id)
  //const data = JSON.stringify(room)


  // Insert logic to see which user is doing things.
  //console.log("Room data:", room)

  const data = {}
  switch (req.body.action) {
    case "roll":
      data.current_dice1 = Math.floor(Math.random() * 6) + 1
      data.current_dice2 = Math.floor(Math.random() * 6) + 1
      data.turn_player = room.player1_id

      if (data.current_dice1 === 1 || data.current_dice2 === 1) {
        data.currenthand_player1 = 0
        data.currenthand_player2 = 0
        if (room.turn_player === 1) {
          data.turn_player = 2
        } else {
          data.turn_player = 1
        }
      } else {
        if (room.turn_player === room.player1_id) {
          // data.currenthand_player1 += data.current_dice1 + data.current_dice2
          data.currenthand_player1 = 110
        } else {
          // data.currenthand_player2 += data.current_dice1 + data.current_dice2
          data.currenthand_player2 = 220
        }
      }
      console.log("We should be updating now!", data)
      await room.update(data)
      res.send({ message: "done" })
      updateStream()

      return


    case "hold":
      console.log("Here we do hold stuff")
      if (room.turn_player === room.player1_id) {
        data.player1_totalscore = room.player1_totalscore + room.currenthand_player1
        data.currenthand_player1 = 0
        data.turn_player = room.player2_id
      } else {
        data.player2_totalscore = room.player2_totalscore + room.currenthand_player2
        data.currenthand_player2 = 0
        data.turn_player = room.player1_id
      }

      if (room.player1_totalscore > 100) {
        data.winner_player = room.player1_id
      } else {
        data.winner_player = room.player2_id
      }

      await room.update(data)
      res.send({ message: "done" })
      updateStream()
      return


    case "updatePlayer":
      data.player2_id = req.user.dataValues.id
      data.room_status = 'Full'
      await room.update(data)
      res.send({ message: "done" })
      updateStream()
      return
    default:
      console.log(`Unknown action ${req.body.action}`)
  }
  // .then(room => room.update(req.body))
  // .then(room => res.send(room))
})

router.delete('/room/:id', (req, res, next) =>
  Room
    .destroy({ where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "Room deleted succesfully" }))
    .catch(next)
)

module.exports = router
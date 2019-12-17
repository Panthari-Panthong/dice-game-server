const { Router } = require('express')
const Room = require('./model')
const auth = require('../server/auth/middleware')
const router = new Router()
const Sse = require('json-sse')
const stream = new Sse()

const getData = async () => {
  const limit = 2000
  const offset = 0
  const rooms = await Room.findAll({ limit, offset })
  const data = JSON.stringify(rooms)
  return data
}

const updateStream = async () => {
  const data = await getData()
  stream.send(data)
}

router.post('/room', auth, (req, res, next) => {

  Room.create({
    room_name: req.body.room_name,
    player1_id: req.user.dataValues.id,
    player1_totalscore: 0,
    currenthand_player1: 0,
    turn_player: req.user.dataValues.id,
    room_status: 'WAITING',
    player2_totalscore: 0,
    currenthand_player2: 0,
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
  stream.updateInit(data) // put the data in the stream
  stream.init(req, res) // starts the stream
})

router.patch('/room/:id', auth, async (req, res, next) => {
  room = await Room.findByPk(req.params.id)

  const data = {}
  switch (req.body.action) {
    case "roll":
      data.current_dice1 = Math.floor(Math.random() * 6) + 1
      data.current_dice2 = Math.floor(Math.random() * 6) + 1

      if (data.current_dice1 === 1 || data.current_dice2 === 1) {
        data.currenthand_player1 = 0
        data.currenthand_player2 = 0
        if (room.turn_player === room.player1_id) {
          data.turn_player = room.player2_id
        } else {
          data.turn_player = room.player1_id
        }
      } else {
        if (room.turn_player === room.player1_id) {
          data.currenthand_player1 = room.currenthand_player1 + data.current_dice1 + data.current_dice2
        } else {
          data.currenthand_player2 = room.currenthand_player2 + data.current_dice1 + data.current_dice2
        }
      }

      await room.update(data)
      res.send({ message: "done" })
      updateStream()

      return


    case "hold":
      if (room.turn_player === room.player1_id) {
        data.player1_totalscore = room.player1_totalscore + room.currenthand_player1
        data.currenthand_player1 = 0
        data.turn_player = room.player2_id
        data.current_dice1 = null
        data.current_dice2 = null

        if (data.player1_totalscore >= 50) {
          data.winner_player = room.player1_id
        }

      } else {
        data.player2_totalscore = room.player2_totalscore + room.currenthand_player2
        data.currenthand_player2 = 0
        data.turn_player = room.player1_id
        data.current_dice1 = null
        data.current_dice2 = null

        if (data.player2_totalscore >= 50) {
          data.winner_player = room.player2_id
        }
      }

      await room.update(data)
      res.send({ message: "done" })
      updateStream()
      return


    case "updatePlayer":
      data.player2_id = req.user.dataValues.id
      data.room_status = 'FULL'

      await room.update(data)
      res.send({ message: "done" })
      updateStream()
      return
    default:
      console.log(`Unknown action ${req.body.action}`)
  }
})

router.delete('/room/:id', (req, res, next) =>
  Room
    .destroy({ where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "Room deleted succesfully" }))
    .catch(next)
)

module.exports = router
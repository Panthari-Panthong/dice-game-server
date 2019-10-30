const { Router } = require('express')
const Room = require('./model')
const auth = require('../server/auth/middleware')
const router = new Router()
const Sse = require('json-sse')
const stream = new Sse()

router.post('/room', auth,(req, res, next) => {
  Room.create(req.body)
    .then(result => {
      res.json(result)
      Room.findAll()
      .then(rooms =>{
        const data = JSON.stringify(rooms)
        console.log("stream updated")
        stream.send(data) //update the stream


      })
      
    
    })
    .catch(next)
})


router.get('/room', async (req, res, next) => {
  const limit = req.query.limit || 25
  const offset = req.query.offset || 0

  const rooms = await Room.findAll({limit, offset})
    //.then(result => res.json(result))
    //.catch(error => next(error))
  console.log(rooms.dataValues)
  const data = JSON.stringify(rooms)
  console.log('rooms in db', data)

  stream.updateInit(data) // put the data in the stream
  stream.init(req, res) // starts the stream

})



router.get('/room/:id', (req, res, next) =>
  Room.findByPk(req.params.id)
    .then(room => res.json(room))
    .catch(next)
)



router.patch('/room/:id', async (req, res, next) => {
  console.log("ROOM", req.body);
  console.log("paramsid", req.params.id)

  room = await Room.findByPk(req.params.id)
    .catch(next)

  // Insert logic to see which user is doing things.

  console.log("Room data:", room)

  switch (req.body.action) {

    case "roll":
      const data = {}
      data.current_dice1 = Math.floor(Math.random() * 6) + 1
      data.current_dice2 = Math.floor(Math.random() * 6) + 1

      if (data.current_dice1 === 1 || data.current_dice2 === 1) {
        data.currenthand_player1 = 0
        data.currenthand_player2 = 0

        if (room.turn_player === 1) {
          data.turn_player = 2
        } else {
          data.turn_player = 1
        }

      } else {
        if (room.turn_player === 1) {
          // data.currenthand_player1 += data.current_dice1 + data.current_dice2
          data.currenthand_player1 = 1
        } else {
          // data.currenthand_player2 += data.current_dice1 + data.current_dice2
          data.currenthand_player1 = 2
        }
      }
      console.log("We should be updating now!", data)

      room.update(data)

      res.send({ message: "done" })

      return

    case "hold":
      console.log("Here we do hold stuff")
      return

    case "updatePlayer":
      const player = {}
      player.player2_id = 2

      room.update(player)
      res.send({ message: "done" })

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
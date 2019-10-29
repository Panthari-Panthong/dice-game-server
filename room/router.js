const { Router } = require('express')
const Room = require('./model')
const router = new Router()

router.post('/room', (req, res, next) =>
  Room.create(req.body)
    .then(result => res.json(result))
    .catch(next)
)


router.get('/room', (req, res, next) => {
  const limit = req.query.limit || 25
  const offset = req.query.offset || 0

  Room
    .findAll({
      limit, offset
    })
    .then(result => res.json(result))
    .catch(error => next(error))
})



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
          data.currenthand_player1 += data.current_dice1 + data.current_dice2
        } else {
          data.currenthand_player2 += data.current_dice1 + data.current_dice2
        }
      }
      console.log("We should be updating now!", data)

      room.update(data)

      res.send({ message: "done" })

      return

    case "hold":
      console.log("Here we do hold stuff")
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
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



router.patch('/room/:id', (req, res, next) =>
  Room
    .findByPk(req.params.id)
    .then(room => room.update(req.body))
    .then(room => res.send(room))
    .catch(next)
)

router.delete('/room/:id', (req, res, next) =>
  Room
    .destroy({ where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "Room deleted succesfully" }))
    .catch(next)

)

module.exports = router
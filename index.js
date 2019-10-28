const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 4000
const db = require('./db')


const userRouter = require('./user/router')
const auth = require('./server/auth/router')
const roomRouter = require('./room/router')

const corsMiddleware = cors()
app.use(corsMiddleware)


const jsonParser = bodyParser.json()
app.use(jsonParser)

app.use(auth)
app.use(userRouter)
app.use(roomRouter)

app.listen(port, () => console.log(`Listening on ${port}`))




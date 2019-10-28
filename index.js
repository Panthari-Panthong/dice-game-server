const express = require('express')
const bodyParser = require('body-parser')


const app = express()
const port = 4000
const db = require('./db')


const userRouter = require('./user/router')

const jsonParser = bodyParser.json()
app.use(jsonParser)


app.use(userRouter)

app.listen(port, () => console.log(`Listening on ${port}`))




const express = require('express')
const app = express()
const port = 4000
const db = require('./db')

app.listen(port, () => console.log(`Listening on ${port}`))
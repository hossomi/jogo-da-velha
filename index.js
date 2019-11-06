const fs = require('fs')
const express = require('express')
const handlebars = require('handlebars')

const template = handlebars.compile(fs.readFileSync('index.html').toString())

const app = express()

app.get('/', (req, res) => {
    res.send(template({ message: 'Hello world' }))
})

app.listen(3000)
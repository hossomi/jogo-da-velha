const fs = require('fs')
const express = require('express')
const handlebars = require('handlebars')

const template = handlebars.compile(fs.readFileSync('index.html').toString())
const app = express()

let state = {
    board: [
        ['X', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' ']
    ]
}

app.get('/', (req, res) => {
    res.send(template(state))
})

app.listen(process.env.PORT || 3000)
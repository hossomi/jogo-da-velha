const fs = require('fs')
const express = require('express')
const formidable = require('express-formidable')
const handlebars = require('handlebars')

let state = {
    board: [
        ['X', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' ']
    ]
}

const template = handlebars.compile(fs.readFileSync('index.html').toString())
const app = express()
app.use(formidable())

app.get('/', (req, res) => {
    const context = {
        board: state.board
            .map((row, i) => row.map((value, j) => ({
                row: i, 
                col: j, 
                value
            })))
    }
    res.send(template(context))
})

app.post('/', (req, res) => {
    console.log(req.fields)
    const context = {
        board: state.board
            .map((row, i) => row.map((value, j) => ({
                row: i, 
                col: j, 
                value
            })))
    }
    res.send(template(context))
})

app.listen(process.env.PORT || 3000)
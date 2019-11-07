const fs = require('fs')
const express = require('express')
const formidable = require('express-formidable')
const handlebars = require('handlebars')
const template = handlebars.compile(fs.readFileSync('index.html').toString())

const PLAYER_NONE = ' '
const PLAYER_X = 'X'
const PLAYER_O = 'O'

const state = {
    board: [
        [PLAYER_NONE, PLAYER_NONE, PLAYER_NONE],
        [PLAYER_NONE, PLAYER_NONE, PLAYER_NONE],
        [PLAYER_NONE, PLAYER_NONE, PLAYER_NONE]
    ],
    currentPlayer: PLAYER_X
}

function stateToContext(message) {
    return {
        board: state.board.map((row, i) => row
            .map((value, j) => ({
                row: i,
                col: j,
                value
            }))),
        player: state.currentPlayer,
        finished: state.winner !== undefined,
        message
    }
}

function putPlayer(player, row, col, board) {
    if (board[row][col] !== PLAYER_NONE)
        return false

    board[row][col] = player
    return true
}

function nextPlayer(player) {
    return player === PLAYER_X ? PLAYER_O : PLAYER_X
}

function filter(value, condition) {
    if (condition(value)) return value
}

function getWinner(board) {
    // Check rows
    for (let r = 0; r < board.length; r++) {
        let p = filter(board[r][0], v => v !== PLAYER_NONE)
        for (let c = 1; c < board[r].length && p; c++) {
            p = filter(p, v => v === board[r][c])
        }
        if (p) return p
    }
    return undefined;
}

const app = express()
app.use(formidable())

app.get('/', (req, res) => {
    res.send(template(stateToContext()))
})

app.post('/', (req, res) => {
    const row = req.fields.row
    const col = req.fields.col

    if (putPlayer(state.currentPlayer, row, col, state.board)) {
        state.winner = getWinner(state.board)
        if (state.winner) {
            res.send(template(stateToContext()))
        }
        else {
            const previousPlayer = state.currentPlayer
            state.currentPlayer = nextPlayer(state.currentPlayer)
            res.send(template(stateToContext(
                `Player ${previousPlayer} played ${row},${col}`)))
        }
    }
    else {
        res.send(template(stateToContext(
            'You cannot play there')))
    }
})

app.listen(process.env.PORT || 3000)
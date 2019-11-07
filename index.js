const fs = require('fs')
const express = require('express')
const formidable = require('express-formidable')
const handlebars = require('handlebars')
const template = handlebars.compile(fs.readFileSync('index.html').toString())

const BOARD_SIZE = 3
const PLAYER_NONE = ' '
const PLAYER_X = 'X'
const PLAYER_O = 'O'

function not(x) {
    return v => v !== x
}

function is(x) {
    return v => v === x
}

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
    for (let r = 0; r < BOARD_SIZE; r++) {
        let p = filter(board[r][0], not(PLAYER_NONE))
        for (let c = 1; c < BOARD_SIZE && p; c++) {
            p = filter(p, is(board[r][c]))
        }
        if (p) return p
    }

    // Check columns
    for (let c = 0; c < BOARD_SIZE; c++) {
        let p = filter(board[0][c], not(PLAYER_NONE))
        for (let r = 1; r < BOARD_SIZE && p; r++) {
            p = filter(p, is(board[r][c]))
        }
        if (p) return p
    }

    // Check diagonal
    {
        let p = filter(board[0][0], not(PLAYER_NONE))
        for (let i = 1; i < BOARD_SIZE && p; i++) {
            p = filter(p, is(board[i][i]))
        }
        if (p) return p
    }

    // Check other diagonal
    {
        let p = filter(board[0][BOARD_SIZE - 1], not(PLAYER_NONE))
        for (let i = 1; i < BOARD_SIZE && p; i++) {
            p = filter(p, is(board[i][BOARD_SIZE - 1 - i]))
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
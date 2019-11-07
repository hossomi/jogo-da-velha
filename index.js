const fs = require('fs')
const express = require('express')
const formidable = require('express-formidable')
const handlebars = require('handlebars')
const template = handlebars.compile(fs.readFileSync('index.html').toString())

const BOARD_SIZE = 3
const PLAYER_NONE = ' '
const PLAYER_X = 'X'
const PLAYER_O = 'O'

function filter(value, condition) {
    if (condition(value)) return value
}

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

function getRenderContext(message) {
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

function isMoveValid(row, col) {
    return state.board[row][col] === PLAYER_NONE
}

function processMove(row, col) {
    state.board[row][col] = state.currentPlayer
    state.winner = getWinner(state.board)

    if (state.winner) {
        return template(getRenderContext())
    }
    else {
        const message = `Player ${state.currentPlayer} played ${row},${col}`
        state.currentPlayer = state.currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X
        return template(getRenderContext(message))
    }
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

function reset() {
    state.board = [
        [PLAYER_NONE, PLAYER_NONE, PLAYER_NONE],
        [PLAYER_NONE, PLAYER_NONE, PLAYER_NONE],
        [PLAYER_NONE, PLAYER_NONE, PLAYER_NONE]
    ]
    state.currentPlayer = PLAYER_X
    delete state.winner

    return template(getRenderContext(
        'Game reset!'))
}

const app = express()
app.use(formidable())

app.get('/', (req, res) => {
    res.send(template(getRenderContext()))
})

app.post('/', (req, res) => {

    if (req.fields.reset) {
        res.send(reset())
        return
    }

    const row = req.fields.row
    const col = req.fields.col

    if (state.winner) {
        res.send(template(getRenderContext(
            'Game has finished!')))
    }
    else if (isMoveValid(row, col)) {
        res.send(processMove(row, col))
    }
    else {
        res.send(template(getRenderContext(
            'You cannot play there')))
    }
})

app.listen(process.env.PORT || 3000)
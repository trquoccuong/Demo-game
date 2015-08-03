'use strict';

var express = require('express');
var bodyParse = require('body-parser');

var app = express();
var Sequelize = require('sequelize');
var db = new Sequelize("postgres://postgres:1@localhost:5432/game", {logging: false});
db.Board = db.import(__dirname + '/models/Board.js');
var util = require('./libs/utils');
var config = require('./config');
var game = require('./game');

var redis = require('redis');
var client = redis.createClient();

app.set('config', config);
var validator = require('./validator')(app);

app.use(bodyParse.urlencoded({extended: false}));
app.use(bodyParse.json());


app.post('/create', [validator.name, validator.rows, validator.columns], function (req, res) {
    var newGame = {
        p1Key: util.randomValueHex(25),
        p2Key: util.randomValueHex(25),
        p1Name: req.body.name,
        board: game.makeBoard(req.body.rows, req.body.columns),
        rows: req.body.rows || app.get('config').MIN_ROWS,
        columns: req.body.columns || app.get('config').MIN_COLUMNS,
        turn: 1,
        status: config.GameState.PENDING
    }

    db.Board.create(newGame).then(function (result) {
        result.p2Key = undefined;
        client.lpush('games', result.id, function (err, reply) {
            if (err) {
                return res.json(err);
            }
            res.json(result);
        });
    }).catch(function (err) {
        res.json(err)
    })
})

app.get('/board/:id', function (req, res) {
    db.Board.findById(req.params.id).then(function (result) {
        res.json(result);
    }).catch(function (err) {
        res.json(err)
    })
})

app.post('/join', validator.name, function (req, res) {
    client.rpop('games', function (err, boardID) {
        if (err) return res.json(err);
        if (!boardID) {
            return res.json({
                Error: 'No games to join!'
            });
        }
        db.Board.findById(boardID).then(function (board) {
            board.updateAttributes({
                p2Name : req.body.name,
                status : config.GameState.PLAYING
            }).then(function (result) {
                result.p1Key = undefined;
                res.json(result);
            })
        }).catch(function (err) {
            res.json(err);
        })
    })
})

app.put('/board/:id', [validator.move, validator.token], function (req, res) {
    var column = req.body.column;
    var row = req.body.row;
    db.Board.findById(req.params.id).then(function (board) {
        if (!board) {
            return res.json({
                'Error': 'Cannot find board!'
            })
        }
        var gameboard = board.board;

        if(column < 1 || column > board.columns) {
            return res.json({
                'Error': 'Bad move.'
            })
        }
        if(row < 1 || row > board.rows) {
            return res.json({
                'Error': 'Bad move.'
            })
        }
        if (board.status !== config.GameState.PLAYING) {
            return res.json({
                'Error': 'Game Over. Cannot move anymore!'
            })
        }
        if (req.headers['x-player-token'] !== board.p1Key &&
            req.headers['x-player-token'] !== board.p2Key) {
            return res.json({
                Error: 'Wrong X-Player-Token!'
            });
        }
        var currentPlayer = (board.turn % 2) === 0 ? 2 : 1;
        var currentPlayerKey = (currentPlayer === 1) ? board.p1Key :
            board.p2Key;
        if(currentPlayerKey !== req.headers['x-player-token']){
            return res.json({
                Error: 'It is not your turn!'
            });
        }
        var  position  = (req.body.row - 1) * board.rows + req.body.column - 1;
        if(gameboard[position] !== '') {
            return res.json({
                Error: 'Invalid move!'
            })
        }

        if(currentPlayer === 2) {
            gameboard[position] = 'o';
        } else {
            gameboard[position] = 'x';
        }
        var gameStatus = board.status;
        var winner = board.winner;
        if (board.turn === 2) {
            if(currentPlayer === 2) {
                winner = board.p2Name
            } else {
                winner = board.p1Name
            }
            gameStatus = config.GameState.END
        }

        board.updateAttributes({board : gameboard , turn : ++board.turn, status : gameStatus, winner: winner }).then(function (result) {
            result.p1Key = undefined;
            result.p2Key = undefined;
            return res.json(result);
        })

    })
})


module.exports = app;
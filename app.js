'use strict';

var express = require('express');
var bodyParse = require('body-parser');

var app = express();
var Sequelize = require('sequelize');
var db = new Sequelize("postgres://postgres:@localhost:5432/quoccuong",{ logging: false});
db.Board = db.import(__dirname + '/models/Board.js');
var util = require('./libs/utils');
var config = require('./config');
var game = require('./game');

var redis = require('redis');
var client = redis.createClient();

app.set('config', config);
var validator = require('./validator')(app);

app.use(bodyParse.urlencoded({ extended: false }));
app.use(bodyParse.json());


app.post('/create',[validator.name, validator.rows, validator.columns], function (req,res) {
    var newGame = {
        p1Key: util.randomValueHex(25),
        p2Key: util.randomValueHex(25),
        p1Name: req.body.name,
        board : game.makeBoard(req.body.rows, req.body.columns),
        rows: req.body.rows || app.get('config').MIN_ROWS,
        columns: req.body.columns || app.get('config').MIN_COLUMNS,
        turn: 1,
        status: config.GameState.PENDING
    }

    db.Board.create(newGame).then(function (result) {
        result.p2Key = undefined;
        client.lpush('games', result.id, function (err,reply) {
            if(err){
                return res.json(err);
            }
            res.json(result);
        });
    }).catch(function (err) {
        res.json(err)
    })
})

app.get('/board/:id', function (req,res) {
    db.Board.findById(req.params.id).then(function (result) {
        res.json(result);
    }).catch(function (err) {
        res.json(err)
    })
})

app.post('/join',validator.name, function (req, res){
    client.rpop('games', function (err,boardID) {
        if(err) return res.json(err);
        if(!boardID) {
            return res.json({
                Error: 'No games to join!'
            });
        }
        db.Board.findById(boardID).then(function (board) {
            board.p2Name = req.body.name;
            board.update(board).then(function (result) {
                result.p1Key = undefined;
                res.json(result);
            })
        }).catch(function (err) {
            res.json(err);
        })
    })
})


module.exports = app;
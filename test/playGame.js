"use strict";

var expect = require("chai").expect,
    request = require('supertest'),
    redis = require('redis'),
    client = redis.createClient();
var config = require('../config')

var app = require("../app");
var p1Key, p2Key, boardID;

describe('Make move |', function () {
    before(function (done) {
        client.flushall(function (err, res) {
            if (err) return done(err);
            done();
        })
    });
    it('create a game', function (done) {
        request(app).post('/create')
            .send({name: 'Cuong'})
            .expect(200)
            .end(function (err, res) {
                p1Key = res.body.p1Key;
                boardID = res.body.id;
                done();
            })
    });

    it('join a game', function (done) {
        request(app).post('/join')
            .send({name: 'Huy'})
            .expect(200)
            .end(function (err, res) {
                p2Key = res.body.p2Key;
                done();
            })
    });

    it('Cannot move without X-Player-Token', function (done) {
        request(app).put('/board/' + boardID)
            .send({column: 1, row : 1})
            .expect(200)
            .end(function (err, res) {
                expect(res.body.Error).to.equal('Missing X-Player-Token!');
                done();
            })
    });
    it('Cannot move on unknown board', function (done) {
        request(app).put('/board/3213')
            .set('X-Player-Token', p1Key)
            .send({column: 1, row : 1})
            .expect(404)
            .end(function (err, res) {
                expect(res.body.Error).to.equal('Cannot find board!');
                done();
            });
    });

    it('Cannot move without a column and row', function (done) {
        request(app).put('/board/' + boardID)
            .set('X-Player-Token', p2Key)
            .expect(400)
            .end(function (err, res) {
                expect(res.body.Error).to.equal('Move where? Missing column and row');
                done();
            });

    });

    it('Cannot move outside of the board', function (done) {
        request(app).put('/board/' + boardID)
            .set('X-Player-Token', p1Key)
            .send({column: 18 , row: 1})
            .expect(200)
            .end(function (err, res) {
                expect(res.body.Error).to.equal('Bad move.');
                done();
            });
    });

    it('Player 2 should not be able to move!', function (done) {
        request(app).put('/board/' + boardID)
            .set('X-Player-Token', p2Key)
            .send({column: 1, row: 1})
            .expect(400)
            .end(function (err, res) {
                expect(res.body.Error).to.equal('It is not your turn!');
                done();
            });
    });

    it('Player 1 can move', function (done) {
        request(app).put('/board/' + boardID)
            .set('X-Player-Token', p1Key)
            .send({column: 1, row: 1})
            .expect(200)
            .end(function (err, res) {
                var b = res.body;
                expect(b.p1Key).to.be.undefined;
                expect(b.p2Key).to.be.undefined;
                expect(b.turn).to.equal(2);
                expect(b.board[0]).to.equal('x');
                done();
            });
    });

    it('Player 1 should not be able to move!', function (done) {
        request(app).put('/board/' + boardID)
            .set('X-Player-Token', p1Key)
            .send({column: 1, row: 1})
            .expect(400)
            .end(function (err, res) {
                expect(res.body.Error).to.equal('It is not your turn!');
                done();
            });
    });

    it('Player 2 can move same player 1', function (done) {
        request(app).put('/board/' + boardID)
            .set('X-Player-Token', p2Key)
            .send({column: 1, row: 1})
            .expect(400)
            .end(function (err, res) {
                expect(res.body.Error).to.equal('Invalid move!');
                done();
            });
    });

    it('Player 2 can move', function (done) {
        request(app).put('/board/' + boardID)
            .set('X-Player-Token', p2Key)
            .send({column: 1, row: 2})
            .expect(200)
            .end(function (err, res) {
                var b = res.body;
                expect(b.p1Key).to.be.undefined;
                expect(b.p2Key).to.be.undefined;
                expect(b.turn).to.equal(3);
                expect(b.board[6]).to.equal('o');
                done();
            });
    });

    it('Player 1 can double-check victory', function (done) {
        request(app).get('/board/' + boardID)
            .set('X-Player-Token', p1Key)
            .expect(200)
            .end(function (err, res) {
                var b = res.body;
                expect(b.winner).to.equal('Huy');
                expect(b.status).to.equal(config.GameState.END);
                done();
            });
    });

    it('Player 2 is a loser, to be sure', function (done) {
        request(app).get('/board/' + boardID)
            .set('X-Player-Token', p2Key)
            .expect(200)
            .end(function (err, res) {
                var b = res.body;
                expect(b.winner).to.equal('Huy');
                expect(b.status).to.equal(config.GameState.END);
                done();
            });
    });

    it('Player 1 cannot move anymore', function (done) {
        request(app).put('/board/' + boardID)
            .set('X-Player-Token', p1Key)
            .send({column: 3,row: 1})
            .expect(400)
            .end(function (err, res) {
                expect(res.body.Error).to.equal('Game Over. Cannot move anymore!');
                done();
            });
    });
})
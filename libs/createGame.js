'use strict';

var expect = require('chai').expect,
    request = require('supertest'),
    config = require('../config');

var app = require('../app');
describe('Create new game ', function () {
    var boardID;
    it('should return a game object with key for player 1', function (done) {
           request(app).post ('/create')
               .send({name : 'Cuong'})
               .expect(200)
               .end(function (err,res) {
                   var b = res.body;
                   expect(b.id).to.be.a('number');
                   expect(b.p1Key).to.be.a('string');
                   expect(b.p1Name).to.be.a('string').and.equal('Cuong');
                   expect(b.turn).to.be.a('number').and.equal(1);
                   expect(b.rows).to.be.a('number');
                   expect(b.columns).to.be.a('number');
                   expect(b.board).to.be.a('array');
                   expect(b.board.length).equal(b.rows * b.columns);

                   boardID = b.id;
                   done();
               })
        });

    it('not accept invalid  column number', function (done) {
        request(app).post ('/create')
            .send({
                name : 'Cuong',
                rows: 10,
                columns: 2
            })
            .expect(200)
            .end(function (err,res) {
                var b = res.body;
                expect(b.Error).to.equal("Number column must be greater than " + config.MIN_COLUMNS );
                done();
            })
    });
    it('not accept invalid  row number', function (done) {
        request(app).post ('/create')
            .send({
                name : 'Cuong',
                rows: 2,
                columns: 10
            })
            .expect(200)
            .end(function (err,res) {
                var b = res.body;
                expect(b.Error).to.equal("Number row must be greater than " + config.MIN_ROWS );
                done();
            })
    });

    it('should be able to fetch the  board', function (done) {
        request(app).get("/board/" + boardID)
            .expect(200)
            .end(function (err,res) {
                var b = res.body;
                expect(b.id).to.be.a('number').and.equal(boardID);
                expect(b.turn).to.be.a('number').and.equal(1);
                expect(b.rows).to.be.a('number');
                expect(b.columns).to.be.a('number');
                expect(b.board).to.be.a('array');
                expect(b.board.length).to.equal(b.rows * b.columns);
                done();
            })
    })
})
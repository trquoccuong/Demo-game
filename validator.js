'use strict';

module.exports = function (app) {
    var MIN_COLUMNS = app.get('config').MIN_COLUMNS,
        MIN_ROWS = app.get('config').MIN_ROWS;

    var sendError = function (res, message) {
        return res.json({
            "Error": message
        });
    }
    return {
        name: function (req, res, next) {
            if (!req.body.name) {
                return sendError(res, "Must provide name field!");
            }
            next()
        },
        rows: function (req, res, next) {
            if (req.body.rows && req.body.rows < MIN_ROWS) {
                return sendError(res, "Number row must be greater than " + MIN_ROWS);
            }
            next()
        },
        columns: function (req, res, next) {
            if (req.body.columns && req.body.columns < MIN_COLUMNS) {
                return sendError(res, "Number column must be greater than " + MIN_COLUMNS);
            }
            next()
        },
        move: function (req, res, next) {
            if (!req.body.column || !req.body.row) {
                return sendError(res, 'Move where? Missing column and row');
            }
            if (( req.body.column < 1 && req.body.column > MIN_COLUMNS) || (req.body.row < 1 && req.body.row > MIN_ROWS)) {
                return sendError(res, 'Bad move.');
            }
            next();
        },
        token: function (req, res, next) {
            if (!req.headers['x-player-token']) {
                return sendError(res, 'Missing X-Player-Token!');
            }
            next();
        }
    }
}
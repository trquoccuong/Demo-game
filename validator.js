'use strict';

module.exports = function (app) {
    var MIN_COLUMNS = app.get('config').MIN_COLUMNS,
        MIN_ROWS = app.get('config').MIN_ROWS;

    var sendError = function (res,message) {
        return res.json({
            "Error" : message
        });
    }
    return {
        name : function (req,res,next) {
            if(!req.body.name) {
                return sendError(res,"Must provide name field!");
            }
            next()
        },
        rows : function (req,res,next) {
            if(req.body.rows && req.body.rows < MIN_ROWS){
                return sendError(res,"Number row must be greater than " + MIN_ROWS);
            }
            next()
        },
        columns : function (req,res,next) {
            if(req.body.columns && req.body.columns < MIN_COLUMNS){
                return sendError(res,"Number column must be greater than " + MIN_COLUMNS);
            }
            next()
        }
    }
}
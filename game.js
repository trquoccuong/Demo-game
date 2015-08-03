'use strict';
var config = require('./config');

module.exports.makeBoard = function (columns,rows) {
    var board =[];
    var numcolumn = columns || config.MIN_COLUMNS;
    var numRow = rows || config.MIN_ROWS;
    for(var i = 0; i < numcolumn * numRow; i++){
        board.push("");
    }
    return board;
}
module.exports.checkWinner = function (board) {
    return true
}
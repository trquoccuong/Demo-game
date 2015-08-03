/**
 * boardId:
 * p1Key:
 * p1Name:
 * P2Key:
 * p2Name:
 * columns:
 * rows:
 * status:
 * winner:
 * turn:
 * board:
 *
**/

var Sequelize = require('sequelize');

module.exports = function (sequelize,DataTypes) {
    var Board = sequelize.define("board",{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        p1Key: {
            type: DataTypes.STRING
        },
        p1Name: {
            type: DataTypes.STRING
        },
        p2Key: {
            type: DataTypes.STRING
        },
        p2Name: {
            type: DataTypes.STRING
        },
        columns: {
            type: DataTypes.INTEGER
        },
        rows: {
            type: DataTypes.INTEGER
        },
        status: {
            type: DataTypes.INTEGER
        },
        winner: {
            type: DataTypes.STRING
        },
        turn: {
            type: DataTypes.INTEGER
        },
        board: {
            type: DataTypes.ARRAY(Sequelize.TEXT)
        }

    },{
        freezeTableName : true
    })

    Board.sync();

    return Board
}
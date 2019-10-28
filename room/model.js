const Sequelize = require('sequelize')
const db = require('../db')

const Room = db.define(
  'room',
  {
    room_name: Sequelize.STRING,
    player1_id: Sequelize.INTEGER,
    player2_id: Sequelize.INTEGER,
    player1_totalscore: Sequelize.INTEGER,
    player2_totalscore: Sequelize.INTEGER,
    currenthand_player1: Sequelize.INTEGER,
    currenthand_player2: Sequelize.INTEGER,
    current_dice1: Sequelize.INTEGER,
    current_dice2: Sequelize.INTEGER,
    winner_player: Sequelize.INTEGER,
    turn_player: Sequelize.INTEGER
  },
  {
    timestamps: false
  }
)

module.exports = Room
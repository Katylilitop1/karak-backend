const mongoose = require('mongoose');

//schémas d'un sous document tile
const tileSchema = mongoose.Schema({
	tile: { type: mongoose.Schema.Types.ObjectId, ref: 'tiles' },
	rotation: Number,
	isRotate: Boolean,
	meetings: { type: mongoose.Schema.Types.ObjectId, ref: 'meetings' },
	issue: Boolean,
	loot: { type: mongoose.Schema.Types.ObjectId, ref: 'meetings' },
	players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'heroes' }],
});

//schémas d'un sous document player
const playerSchema = mongoose.Schema({
	player: { type: mongoose.Schema.Types.ObjectId, ref: 'heroes' },
	turn: Number,
	life: Number,
	weapons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'meetings' }],
	key: { type: mongoose.Schema.Types.ObjectId, ref: 'meetings' },
	magic: [{ type: mongoose.Schema.Types.ObjectId, ref: 'meetings' }],
	treasure: Number,
	malediction: Boolean,
});

//schémas d'un document game
const gameSchema = mongoose.Schema({
	tiles: [tileSchema],
	players: [playerSchema],
});

const Game = mongoose.model('games', gameSchema);

module.exports = Game;
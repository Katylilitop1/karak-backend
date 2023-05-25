const mongoose = require('mongoose');

//schémas d'un sous document tile
const tileSchema = mongoose.Schema({
	tile: { type: mongoose.Schema.Types.ObjectId, ref: 'tiles' },
	rotation: Number,
	data: [Number],
	isPlayed: String,
	meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'meetings' },
	issue: Boolean,
	players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'heroes' }],
});

//schémas d'un sous document player
const playerSchema = mongoose.Schema({
	player: { type: mongoose.Schema.Types.ObjectId, ref: 'heroes' },
	type: String,
	username: String,
	turn: Boolean,
	life: Number,
	// weapons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'meetings' }],
	// key: { type: mongoose.Schema.Types.ObjectId, ref: 'meetings' },
	// scroll: [{ type: mongoose.Schema.Types.ObjectId, ref: 'meetings' }],
	weapons: [],
	key: String,
	scroll: [],
	treasure: Number,
	malediction: Boolean,
	coords: String,
	prevCoords: String,
});

//schémas d'un document game
const gameSchema = mongoose.Schema({
	gameStarted: Boolean,
	creationDate: Date,
	tiles: [tileSchema],
	players: [playerSchema],
});

const Game = mongoose.model('games', gameSchema);

module.exports = Game;
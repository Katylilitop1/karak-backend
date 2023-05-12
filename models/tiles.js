const mongoose = require('mongoose');

//schémas d'un document tile
const tileSchema = mongoose.Schema({
	type: String,
	specificity: String,
    data: [Number]
});

const Tile = mongoose.model('tiles', tileSchema);

module.exports = Tile;
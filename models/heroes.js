const mongoose = require('mongoose');

//schémas d'un document heroe
const heroeSchema = mongoose.Schema({
	name: String,
	power: [String]
});

const Heroe = mongoose.model('heroes', heroeSchema);

module.exports = Heroe;
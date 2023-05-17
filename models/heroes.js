const mongoose = require('mongoose');

//schémas d'un document heroe
const heroeSchema = mongoose.Schema({
	name: String,
	powers: [String]
});

const Heroe = mongoose.model('heroes', heroeSchema);

module.exports = Heroe;
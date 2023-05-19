const mongoose = require('mongoose');

//schémas d'un document meeting
const meetingSchema = mongoose.Schema({
	mob: String,
	strength: Number,
    loot: String,
    value: Number
});

const Meeting = mongoose.model('meetings', meetingSchema);

module.exports = Meeting;
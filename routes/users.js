var express = require('express');
var router = express.Router();
require('../models/connection');
const { checkBody } = require('../modules/checkBody');
const Heroe = require('../models/heroes');
const Meeting = require('../models/meetings')
const Tile = require('../models/tiles')
const Game = require('../models/games')
const uid2 = require('uid2');


/* GET / + /newGame, got ident of a new game */
router.get('/newGame', async function (req, res) {
  console.log('route get / + /newGame');

  // build of the players and shuffle them
  let data_heroes = await Heroe.find()
  data_heroes.sort(() => Math.random() - 0.5)
  console.log('heroes random: ', data_heroes)
  const players = []
  for (const hero of data_heroes) {
    players.push({
      player: hero._id,
      username: '',
      turn: 0,
      life: 5,
      weapons: [],
      key: null,
      magic: [],
      treasure: 0,
      malediction: false,
    })
  }

  // read the meetings and shuffle them
  let data_meetings = await Meeting.find()
  data_meetings.sort(() => Math.random() - 0.5)
  let idx_meetings = 0

  // build of the tiles
  let data_tiles = await Tile.find()
  const start_tile = data_tiles.shift()
  data_tiles.sort(() => Math.random() - 0.5)
  data_tiles.unshift(start_tile)
  const tiles = []
  for (const tile of data_tiles) {
    tiles.push({
      tile: tile._id,
      rotation: 0,
      isRotate: false,
      meetings: (tile.specificity === "salle") ? data_meetings[idx_meetings]._id : null,
      issue: data_meetings.issue,
      loot: (tile.specificity === "salle") ? data_meetings[idx_meetings]._id : null,
      players: [],
    })
    if (tile.specificity === "salle") idx_meetings++
  }

  // build the game
  const token = uid2(32);
  const newGame = Game({
    token: token,
    tiles: tiles,
	  players: players,
  })
  const data_game = await newGame.save()
  res.json({ result: true, game: { id: data_game._id, token: token } });
});

/* POST / + /joinGame, check the ident of game */
router.post('/joinGame', function (req, res) {
  console.log('route post / + /newGame with req.body: ', req.body);
  if (!checkBody(req.body, ['id', 'token'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  Game.find({_id: req.body.id, token: req.body.token}).then(data => {
    if (data) {
      res.json({ result: true})
    } else {
      res.json({ result: false})
    }
	});

 City.deleteOne({
    cityName: { $regex: new RegExp(req.params.cityName, "i") },
  }).then(deletedDoc => {
    if (deletedDoc.deletedCount



  res.json({ result: true, data: { info: req.body.id + ' is known' } })
});

/* POST /users + /karak/:db, return a collection */
router.post('/karak/:db', function (req, res) {
  console.log('route post /users + /karak with req.params: ', req.params);
  if (!checkBody(req.body, ['for'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  if (req.body.for !== 'AdMiNkArAk') {
    res.status(404).end()
    return
  }
  let base
  switch (req.params.db.toLowerCase()) {
    case 'heroes':
      base = Heroe
      break;
    case 'meetings':
      base = Meeting
      break;
    case 'tiles':
      base = Tile
      break;
    case 'games':
      base = Game
      break;
    default:
      res.status(404).end()
      return
  }

  base.find().then(data => {
    res.json({ result: true, data: data });
    return
  })
    .catch(error => {
      console.log('so bad trip');
      res.status(404).end()
    });
});

/* POST /users + /fullGame, check the ident of game */
router.post('/fullgame', function (req, res) {
  console.log('route post /users + /fullgame with req.body: ', req.body);
  if (!checkBody(req.body, ['id'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  Game.find({_id: req.body.id})
    .populate(['tiles.tile', 'tiles.meetings', 'tiles.loot', 'players.player'])
    .then(data => {
      res.json({ result: true, data: data })
  })
});

module.exports = router;

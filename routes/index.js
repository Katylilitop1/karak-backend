let express = require('express');
let router = express.Router();
require('../models/connection');
const { checkBody } = require('../modules/checkBody');
const Heroe = require('../models/heroes');
const Meeting = require('../models/meetings')
const Tile = require('../models/tiles')
const Game = require('../models/games')

/* GET / + /newGame, got ident of a new game */
router.get('/newGame', async function (req, res) {
  console.log('route get / + /newGame');

  // build of the players and shuffle them
  let data_heroes = await Heroe.find()
  data_heroes.sort(() => Math.random() - 0.5)
  data_heroes.pop(); // remove the last one to keep only five heroes
  console.log('heroes random: ', data_heroes)
  const players = []
  for (const hero of data_heroes) {
    players.push({
      player: hero._id,
      username: '',
      turn: false,
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
      meeting: (tile.specificity === "salle") ? data_meetings[idx_meetings]._id : null,
      issue: false,
      players: [],
    })
    if (tile.specificity === "salle") idx_meetings++
  }
  // start tile is already rotate
  tiles[0].isRotate = true;

  // build the game
  const newGame = Game({
    tiles: tiles,
    players: players,
    gameStarted: false,
    creationDate: Date.now(),
  })
  const data_game = await newGame.save()
  res.json({ result: true, id: data_game._id })
});

/* POST / + /joinGame, check the ident of game */
router.post('/joinGame', function (req, res) {
  console.log('route post / + /joinGame with req.body: ', req.body);
  if (!checkBody(req.body, ['id'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  Game.findOne({ _id: req.body.id }).then(data => {
    if (data && !data.gameStarted) {
      console.log('gamestarted: ', data.gameStarted)
      res.json({ result: true })
    } else {
      res.json({ result: false, gameStarted: data.gameStarted })
    }
  })
    .catch(error => { console.log('Error: ', error); res.json({ result: false }) })
});

/* POST / + /karak/:db, return a collection verbatim */
router.post('/karak/:db', function (req, res) {
  console.log('route post / + /karak with req.params: ', req.params);
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

  base.find()
    .then(data => {
      res.json({ result: true, collection: data });
      return
    })
    .catch(error => {
      console.log('so bad trip');
      res.status(404).end()
    });
});

/* POST / + /startGame, check the ident of game and return it */
router.post('/startGame', function (req, res) {
  console.log('route post / + /startGame with req.body: ', req.body);
  if (!checkBody(req.body, ['id'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  Game.findOne({ _id: req.body.id })
    .populate(['tiles.tile', 'tiles.meeting', 'players.player'])
    .then(data_game => {
      if (data_game) {
        const players_to_keep = data_game.players.filter((a_player) => a_player.username !== '')
        Game.updateOne({ _id: req.body.id }, { gameStarted: true, players: players_to_keep })
          .then(data_updateOne => {
            console.log('data_updateOne on startGame: ', data_updateOne)
            res.json({ result: true, game: data_game })
          })
      } else {
        res.json({ result: false })
      }
    })
    .catch(error => { console.log('Error: ', error); res.json({ result: false }) })
});

/* POST / + /getGame, check the ident of game and return it */
router.post('/getGame', function (req, res) {
  console.log('route post / + /getGame with req.body: ', req.body);
  if (!checkBody(req.body, ['id'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  Game.findOne({ _id: req.body.id })
    .populate(['tiles.tile', 'tiles.meeting', 'players.player'])
    .then(data_game => {
      res.json({ result: true, game: data_game })
    })
    .catch(error => { console.log('Error: ', error); res.json({ result: false }) })
});

// POST / + /addPlayers, assign players to the game
router.post('/addPlayers', async function (req, res) {
  console.log('route post / + /addPlayers with req.body: ', req.body);
  if (!checkBody(req.body, ['id', 'players'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  // count the number of free place and if game not started
  const data_players = await Game.findOne({ _id: req.body.id }, { gameStarted: 1, "players.username": 1 })
  // console.log(('data_players: ', data_players));
  if (data_players.gameStarted) {
    res.json({ result: false, gameStarted: data_players.gameStarted })
    return
  }
  const nb_free_place = data_players.players.reduce((accu, elt) => {
    if (elt.username === '') return ++accu; else return accu
  }, 0)
  console.log('Number of free places: :', nb_free_place);

  // check if enough places
  if (req.body.players.length > nb_free_place) {
    console.log('Not enough place for players');
    res.json({ result: false, error: 'Too much player for the game' });
    return;
  }

  const zzz = await req.body.players.map(async (username) => {
    const data = await Game.updateOne(
      { _id: req.body.id, "players.username": '' },
      { $set: { "players.$.username": username } })
    console.log('updateOne returns: ', data);
    // if (!data || data.modifiedCount === 0) {
    //   res.json({ result: false });
    //   return
    // }
  })
  console.log('zzz: ', zzz);
  Promise.all(zzz)
    .then((x) => {
      console.log('Return result ok!');
      console.log('zzz: ', zzz);
      // we want to return couple of all the names and heroe
      // Game.find({ _id: req.body.id }, { "players.player": 1 })
      Game.findOne({ _id: req.body.id }, { "players.player": 1, "players.username": 1 })
        .populate('players.player')
        .then(data => {
          console.log(data.players)
          res.json({
            result: true,
            infos: data.players.filter(player => player.username !== '')
              .map(player => { return { username: player.username, heroe: player.player.name } })
          })
        })
    })
    .catch(reason => res.json({ result: false }))
})


router.post('/getPlayerHeroe', function (req, res) {
  console.log('route post / + /getPlayerHeroe with req.body: ', req.body);
  if (!checkBody(req.body, ['id'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  Game.findOne({ _id: req.body.id }, { gameStarted: 1, "players.player": 1, "players.username": 1 })
    .populate('players.player')
    .then(data => {
      // console.log(data.players)
      res.json({
        result: true,
        gameStarted: data.gameStarted,
        infos: data.players.filter(player => player.username !== '')
          .map(player => { return { username: player.username, heroe: player.player.name } })
      })
    })
    .catch(reason => res.json({ result: false }))
})

// POST / + /nbrFreePlayer, return the number of free places for player
router.post('/nbrFreePlayer', async function (req, res) {
  console.log('route post / + /nbrFreePlayer with req.body: ', req.body);
  if (!checkBody(req.body, ['id'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // count the number of free place
  const data_players = await Game.findOne({ _id: req.body.id }, { "players.username": 1 })
  // console.log(('data_players: ', data_players));
  const nb_free_place = data_players.players.reduce((accu, elt) => {
    if (elt.username === '') return ++accu; else return accu
  }, 0)
  console.log('Number of free places: :', nb_free_place);

  res.json({ result: false, nb_free_place: nb_free_place });
  return;

})

module.exports = router;


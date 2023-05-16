var express = require('express');
var router = express.Router();
require('../models/connection');
const { checkBody } = require('../modules/checkBody');
const Heroe = require('../models/heroes');
const Meeting = require('../models/meetings')
const Tile = require('../models/tiles')
const Game = require('../models/games')

/* GET /users + /newGame, got ident of a new game */
router.get('/newGame', function (req, res) {
  console.log('route get /users + /newGame');
  res.json({ result: true, data: { _id: "id_karak_one" } });
});

/* POST /users + /newGame, check the ident of game */
router.post('/joinGame', function (req, res) {
  console.log('route post /users + /newGame with req.body: ', req.body);
  if (!checkBody(req.body, ['id'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
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

module.exports = router;

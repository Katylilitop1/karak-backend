var express = require('express');
var router = express.Router();
require('../models/connection');
const { checkBody } = require('../modules/checkBody');

/* GET users ident of a new game */
router.get('/newGame', function(req, res, next) {
  console.log('route get /users + /newGame');
  res.json({ result: true, data : { _id: "id_karak_one"} });
});

/* POST users, check the ident of game */
router.post('/joinGame', function(req, res, next) {
  console.log('route post /users + /newGame with req.body: ', req.body);
  res.json({ result: true, data: { info: req.body.id + ' is known' }})
});

module.exports = router;

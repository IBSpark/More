var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.json({ message: 'API is working', title: 'Express' });
});

module.exports = router;

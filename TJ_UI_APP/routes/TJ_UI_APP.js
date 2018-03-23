var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("route found");
    res.render('IBOT_P1_v2', { title: 'Express' });
});

module.exports = router;
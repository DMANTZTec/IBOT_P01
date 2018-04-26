var express = require('express');
var router = express.Router();

/* GET home page. */
router.all('/', function(req, res, next) {
    var response={status:"success"};
    res.send(response);
});

module.exports = router;

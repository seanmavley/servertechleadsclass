let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json({
        'state': true,
        'msg': 'MenPha Server'
    });
});

module.exports = router;
let fs = require('fs');

module.exports = {
    loginRequired: function(req, res, next) {
        if (req.user) {
            next();
        } else {
            return res.status(401).json({
                state: false,
                msg: 'This request requires authorization.'
            });
        }
    },
    readHTMLFile: function(path, callback) {
        fs.readFile(path, { encoding: 'utf-8' }, function(err, html) {
            if (err) {
                throw err;
                callback(err);
            } else {
                callback(null, html);
            }
        });
    },
}
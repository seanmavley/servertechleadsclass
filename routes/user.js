let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let User = mongoose.model('User');
let Types = mongoose.Types;
let Code = mongoose.model('Code');
let utils = require('../utils/utils');
let bcrypt = require('bcrypt');

router.get('/', function(req, res) {
    res.json({ 'title': 'Welcome to protected page' });
})

router.get('/delete/user', function(req, res) {
    res.json({
        'state': true,
        'msg': 'Endpoing to delete user account'
    })
})

router.post('/delete/user', utils.loginRequired, function(req, res) {
    const username = req.user.username;
    const old_password = req.body.old_password;

    const user_id = req.user._id;

    User.findById(Types.ObjectId(user_id), function(err, user) {
        if (err) {
            return res.json({
                'state': false,
                'msg': err
            })
        }
        if (!user.comparePassword(old_password)) {
            return res.json({
                'state': false,
                'msg': 'Incorrect. Try again.'
            });
        } else {
            User.deleteOne({ '_id': user_id }, function(err, obj) {
                if (err) {
                    return res.json({
                        'state': false,
                        'msg': err
                    })
                };

                res.json({
                    'state': true,
                    'msg': 'User account deleted'
                })
            })

        }
    })
})

router.get('/user', utils.loginRequired, function(req, res) {
    User.findById(Types.ObjectId(req.user._id), function(err, user) {
        if (err) console.log(err);
        // remove these fields
        user.hash_password, user.verification_token = undefined;

        res.json({
            'state': true,
            'msg': 'User details',
            'data': user
        })
    })
})


router.post('/user-profile', utils.loginRequired, function(req, res) {
    const user_id = req.user._id;

    if (!user_id) {
        return res.json({
            'state': false,
            'msg': 'Login first to proceed. Or Send Token along with your request.'
        })
    };

    User.findById(Types.ObjectId(user_id), function(err, user) {
        if (err) {
            return res.json({
                'state': false,
                'msg': err
            })
        }

        if (!user) {
            return res.json({
                'state': false,
                'msg': 'No User exists'
            })
        } else {
            user.hash_password, user.verification_token = undefined;
            res.json({
                'state': true,
                'msg': username + ' found.',
                'user': user
            })
        }

    })
})

router.post('/update-user-profile', utils.loginRequired, function(req, res) {

    let update_details = {
        location: req.body.location,
        fullName: req.body.fullName,
        website: req.body.website,
        bio: req.body.bio,
        interest: req.body.interest
    };

    let user = req.user;

    User.findOneAndUpdate({ '_id': user._id }, update_details, {
        new: true
    }, function(err, success) {
        if (err) {
            return res.json({
                'state': false,
                'msg': 'Failed to update User profile. Please try again'
            })
        }
        res.json({
            'state': true,
            'msg': 'Successfuly updated',
            'user': success
        })
    });
});

module.exports = router;
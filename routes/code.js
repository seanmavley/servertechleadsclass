let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let Code = mongoose.model('Code');
let slug = require('slug');
let Types = mongoose.Types;
let utils = require('../utils/utils');
let uuid = require('uuid');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json({ 'title': 'Welcome to protected page' });
});

/* Retrieve codes created by specific user */
router.get('/user-codes', utils.loginRequired, function(req, res) {
    const user_id = req.user._id;

    Code.find({ 'createdById': user_id }).sort({ 'createdAt': -1 })
        .exec(function(err, codes) {
            if (err) {
                console.log(err);
                return res.json({
                    'state': false,
                    'msg': err
                })
            }

            if (!codes) {
                return res.json({
                    'state': false,
                    'msg': 'You have not added any codes yet.'
                })
            } else {
                res.json({
                    'state': true,
                    'msg': 'Cards found',
                    'codes': codes
                })
            }
        })
})

router.get('/create', function(req, res, next) {
    res.json({
        state: true,
        msg: 'Create new card'
    })
})

router.post('/create', utils.loginRequired, function(req, res, next) {

    let code = req.body;

    if (!code.title) {
        return res.json({
            'state': false,
            'msg': 'Title is missing. Please add a title.'
        })
    };

    let slug_url = slug(code.title);
    let unique_code = uuid();
    //append unique string at the end the slug
    code.slug = slug_url + '-' + unique_code.split('-')[0];

    code.createdBy = req.user.username;
    code.createdById = req.user._id;

    Code.create(code, function(err, codeObj) {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                msg: 'Could not create your card post',
                error: err
            })
        };

        res.json({
          'state': true,
          'msg': 'New product enlisted.',
          'slug': codeObj.slug
        })
    })
})

router.post('/read', function(req, res, next) {
    let slug = req.body.slug;
    console.log(slug);
    Code.findOne({ 'slug': slug }, function(err, deck) {
        if (deck === null) {
            return res.json({
                'state': false,
                'msg': 'Card does not exist.'
            })
        }

        Card.findOne({ deck: deck._id }, function(err, card) {
            res.json({
                state: true,
                msg: 'Card item available',
                deck: deck,
                codes: card.codes
            })
        })
    })
})

router.post('/update-stolen', utils.loginRequired, function(req, res, next) {
  const code_id = req.body.code_id;
  const is_stolen = req.body.is_stolen;


  Code.updateOne({'_id':Types.ObjectId(code_id)}, {$set: { is_stolen: is_stolen } }, function(err, obj) {
    if(err) {
      return res.json({
        'state': false,
        'msg': err
      })
    };
    res.json({
      'state': true,
      'msg': 'Update successful'
    })
  }) 
})

router.post('/delete', utils.loginRequired, function(req, res, next) {

    const to_delete_id = req.body.code._id
    const user_id = req.user._id;
    const created_by_id = req.body.code.createdById;

    // check if card belongs to user
    // before delete
    if (user_id === created_by_id) {
        Code.deleteOne({ _id: to_delete_id }, function(err) {
            console.log(err);
            if (!err) {
                res.json({
                    state: true,
                    msg: 'Deleted your thoughts. You can always share more.'
                })
            } else {
                res.json({
                    state: false,
                    msg: 'Something wrong happened'
                })
            }
        })
    } else {
        res.json({
            state: false,
            msg: 'You are attempting to delete a card you did not create. Seriously?'
        })
    }

});

router.get('/search', function(req, res) {
  const term = req.query.search;

  Code.findOne({ code: term, is_stolen: true }, function(err, obj) {
    if(err) {
      return res.json({
        'state': false,
        'msg': err
      })
    }

    if(!obj) {
      return res.json({
        'state': true,
        'msg': 'No Item/Product/Gadget with the Unique ID Found',
        'empty': true
      })
    }

    res.json({
      'state': true,
      'msg': 'Product Found',
      'code': obj
    })
  })
})

module.exports = router;
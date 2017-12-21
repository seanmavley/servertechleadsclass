let express = require('express');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let cors = require('cors');
let mongoose = require('mongoose');
let config = require('./.config');
let jsonwebtoken = require('jsonwebtoken');
let utils = require('./utils/utils');
let helmet = require('helmet')
// Models
let Code = require('./models/codeModel');
let User = require('./models/userModel');

let app = express();

mongoose.Promise = global.Promise; // so that we can use Promises with Mongoose

if (app.get('env') === 'test') {
    console.log('Using testDB')
    mongoose.connect(config.test, { useMongoClient: true });
} else {
    console.log('Using Dev/Prod DB');
    mongoose.connect(config.database, { useMongoClient: true });
}

// mongoose.set('debug', true);


// TODO: Rate limit application. 
// A typical client can't make 100 requests per 5 minute window frame.
// If a client does that, we beg the client, CHILL!
// Look into this: https://www.npmjs.com/package/strict-rate-limiter
app.use(helmet())
app.use(cors());
app.options('*', cors())

let index = require('./routes/index');
let auth = require('./routes/auth');
let user = require('./routes/user');
let code = require('./routes/code');

app.use(logger('dev'));
app.use(bodyParser.json({ limit: '2mb' })); // maximum json body allowed
app.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// AUTHORIZATION HEADERS MIDDLEWARE
// capture and decode authorization headers if any,
// and pass decoded to next req
app.use(function(req, res, next) { 
  if (req.header && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jsonwebtoken.verify(req.headers.authorization.split(' ')[1], config.secret, function(err, decode) {
        if (err) req.user = undefined;
        req.user = decode;
        next();
    })
  } else {
    req.user = undefined;
    next();
  }
});

// for pre-flight tasks

// at v1. Should make upgrades easier in future
// if new api version endpoints
const API_V1 = '/api/v1';

app.use(API_V1 + '/', index);
app.use(API_V1 + '/auth', auth);
// authorization required for this entire endpoint
app.use(API_V1 + '/user', user);
app.use(API_V1 + '/code', code);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    console.log(err);
    
    res.json({
        'status': err.status || 500,
        'msg': 'Not found or Server Error. See error code'
    });
});

module.exports = app;
/** 
// MAKE CHANGES & SAVE THIS FILE AS 
// 
// .config.js
//
// Make sure to ignore this file in Git. 
// Production server uses different settings
*/
module.exports = {
    'database': 'mongodb://localhost/khophiserver',
    'test': 'mongodb://localhost/khophiservertest',
    'secret': 'secret',
    'emailConfig': {
        'host': 'Use your own. Production uses Zoho though.',
        'port': 465,
        'secure': true,
        'auth': {
            'user': 'noreply@somethingofyours.com',
            'pass': 'password'
        }
    },
    'server_url': 'http://localhost:3011/', // maintain this
    'frontend_url': 'http://localhost:8100/#/', // maintain this
    'site_name': 'KhoPhi'
}
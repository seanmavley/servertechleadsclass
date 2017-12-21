process.env.NODE_ENV = 'test';

let mongoose = require('mongoose');
let User = require('../models/userModel.js');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../bin/www');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

let login_details = {
  'email_or_username': 'email@email.com',
  'password': '123@abc'
}

let register_details = {
  'fullName': 'Rexford',
  'email': 'email@email.com',
  'username': 'username',
  'password': '123@abc'
};


/**
* Test the following in on scoop:
* - Create an account, login with details, and check if token comes
*/

describe('Create Account, Login and Check Token', () => {
  beforeEach((done) => {
    User.remove({}, (err) => {
      console.log(err);
      done();
    })
  });

  describe('/POST Register', () => {
    it('it should Register, Login, and check token', (done) => {
      chai.request(server)
        .post('/api/v1/auth/register')
        .send(register_details)
        .end((err, res) => {
          res.should.have.status(201);
          expect(res.body.state).to.be.true;

          // follow up with login
          chai.request(server)
            .post('/api/v1/auth/login')
            .send(login_details)
            .end((err, res) => {
              console.log('this was run the login part');
              res.should.have.status(200);
              expect(res.body.state).to.be.true;
              res.body.should.have.property('token'); 
              
              let token = res.body.token;

              chai.request(server)
                .get('/api/v1/account/user')
                .set('Authorization', token)
                .end((err, res) => {

                  res.should.have.status(200);
                  expect(res.body.state).to.be.true;
                  res.body.data.should.be.an('object');

                  done();
                })
                
            })

        })
    })
  })
})

/**
* Test the following:
* - Login /GET
* - Login /POST, success and fail
* - Register /GET
* - Register /POST, success and fail
*/
describe('User Auth Approaches', () => {
  beforeEach((done) => {
    User.remove({}, (err) => {
      console.log(err);
      done();
    });
  });

  describe('/GET auth login', () => {
    it('it should display login page', (done) => {
      chai.request(server)
        .get('/api/v1/auth/login')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('msg')
          done();
        })
    })
  });

  describe('/POST auth login', () => {
    it('it should throw error with invalid credentials', (done) => {
      let login = {
        email: 'email@email.com',
        password: '0123456'
      }

       chai.request(server)
        .post('/api/v1/auth/login')
        .send(login)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.be.an('object');
          res.body.should.have.property('msg');
          res.body.should.have.property('state');
          expect(res.body.state).to.be.false;
          done();
        })
    })
  });

  describe('/GET auth register', () => {
    it('it should get register endpoint', (done) => {
      chai.request(server)
        .get('/api/v1/auth/register')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('msg')
          done();
        })
    })
  });

  describe('/POST auth register successfully', () => {
    it('it should register new user', (done) => {
      chai.request(server)
        .post('/api/v1/auth/register')
        .send(register_details)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.state.should.be.true;
          done();
        })
    })
  });

  describe('/POST auth register fail', () => {
    it('it should fail to register a new user', (done) => {
      // make register object wrong
      register_details.email = undefined;

      chai.request(server)
        .post('/api/v1/auth/register')
        .send(register_details)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.state.should.be.false;
          done();
        })
    })
  })
})
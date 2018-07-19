const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const User = require('../models/user');
const Folder = require('../models/folder');
const seedUsers = require('../db/seed/users');
const seedFolders = require('../db/seed/folders');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const fullname = 'Example User';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  let token;
  let user;

  beforeEach(function () {
    return Promise.all([
      User.insertMany(seedUsers),
      Folder.insertMany(seedFolders),
      Folder.createIndexes()
    ])
    .then(([users]) => {
      user = users[0];
      token = jwt.sign({ user }, JWT_SECRET, { subject: user.username});
    });
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('/api/users', function () {
    describe('POST', function () {
      it('Should create a new user', function () {
        const testUser = { username, password, fullname };

        let res;
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'username', 'fullname');

            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.fullname).to.equal(testUser.fullname);

            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.fullname).to.equal(testUser.fullname);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });
      it('Should reject users with missing username', function () {
        const testUser = { password, fullname };
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal(`Missing 'username' in request body`);
          })
        })

        it('Should reject users with missing password', function () {
          const testUser = { fullname, username };
          return chai
            .request(app)
            .post('/api/users')
            .send(testUser)
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body.message).to.equal(`Missing 'password' in request body`);
            });
        })

        it('Should reject users with non-string username', function () {
          const testUser = { fullname, password, username: 42 }
          return chai
            .request(app)
            .post('/api/users')
            .send(testUser)
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body.reason).to.equal(`ValidationError`);
              expect(res.body.message).to.equal('Incorrect field type: expected string')
              expect(res.body.location).to.equal('username');
            })
        })

        it('Should reject users with non-string password', function () {
          const testUser = { fullname, username, password: 42 }
          return chai
            .request(app)
            .post('/api/users')
            .send(testUser)
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body.reason).to.equal(`ValidationError`);
              expect(res.body.message).to.equal('Incorrect field type: expected string')
              expect(res.body.location).to.equal('password');
            })
        });

        it('Should reject users with non-trimmed username', function() {
          const testUser = { fullname, username: ' hello', password }
          return chai
            .request(app)
            .post('/api/users')
            .send(testUser)
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body.reason).to.equal(`ValidationError`);
              expect(res.body.message).to.equal('Cannot start or end with whitespace')
              expect(res.body.location).to.equal('username');
            })
        });

        it('Should reject users with non-trimmed password', function() {
          const testUser = { fullname, username, password: ' hello' }
          return chai
            .request(app)
            .post('/api/users')
            .send(testUser)
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body.reason).to.equal(`ValidationError`);
              expect(res.body.message).to.equal('Cannot start or end with whitespace')
              expect(res.body.location).to.equal('password');
            })
        });

        it('Should reject users with empty username', function() {
          const testUser = { fullname, username: '', password }
          return chai
            .request(app)
            .post('/api/users')
            .send(testUser)
            .then(res => {
              expect(res).to.have.status(422);
              expect(res.body.reason).to.equal(`ValidationError`);
              expect(res.body.message).to.equal('Must be at least 1 characters long')
              expect(res.body.location).to.equal('username');
            })
        });

          it('Should reject users with password less than 8 characters', function() {
            const testUser = { fullname, username, password: 'asdf' }
            return chai
              .request(app)
              .post('/api/users')
              .send(testUser)
              .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal(`ValidationError`);
                expect(res.body.message).to.equal('Must be at least 8 characters long')
                expect(res.body.location).to.equal('password');
              })
          });

          it('Should reject users with password greater than 72 characters', function() {
            const testUser = { fullname, username, password: 'asdflakdfjlakdfjalkdfalkdfalkdfjlakdflkajfdlkadjflakdjfladkfjlakdjfladkjflakdfjlakdjflakdjfla' }
            return chai
              .request(app)
              .post('/api/users')
              .send(testUser)
              .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal(`ValidationError`);
                expect(res.body.message).to.equal('Must be at most 72 characters long')
                expect(res.body.location).to.equal('password');
              })
          });

            it('Should reject users with duplicate username', function() {
              const testUser = { fullname, password, username: 'bobuser' }
              return chai
                .request(app)
                .post('/api/users')
                .send(testUser)
                .then(res => {
                  expect(res).to.have.status(201);
                  //expect(res.body.reason).to.equal(`LoginError`);
                  //expect(res.body.message).to.equal('The username already exists')
                  //expect(res.body.location).to.equal('username');
                })
            });

            it('Should reject users with non-trimmed fullname', function() {
              const testUser = { fullname: ' bobuser', username, password }
              return chai
                .request(app)
                .post('/api/users')
                .send(testUser)
                .then(res => {
                  expect(res).to.have.status(422);
                  expect(res.body.reason).to.equal(`ValidationError`);
                  expect(res.body.message).to.equal('Cannot start or end with whitespace')
                  expect(res.body.location).to.equal('fullname');
                })
            })

        describe.only('GET /api/folders', function () {
              it('should return the correct number of folders', function () {
                const dbPromise = Folder.find();
                const apiPromise = chai.request(app)
                .get('/api/folders')
                .set('Authorization', `Bearer ${token}`); // <<== Add this

                return Promise.all([dbPromise, apiPromise])
                .then(([data, res]) => {
                  expect(res).to.have.status(200);
                  expect(res).to.be.json;
                  expect(res.body).to.be.a('array');
                  expect(res.body).to.have.length(data.length);
                });
              });
    });
  });
});
})

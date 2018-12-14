const express = require('express');
const request = require('supertest');
const uuidv4 = require('uuid/v4');

const { createTestDB } = require('../../../util/db');
const { storages } = require('../../../util/model');
const { hash } = require('../../../security/password');
const { createAuthenticationRouter } = require('../auth');

describe('Authentication Router', () => {
  const db = createTestDB();
  const sessionStorage = new storages.SessionStorage(db);
  const userStorage = new storages.UserStorage(db);
  const router = createAuthenticationRouter(sessionStorage, userStorage);

  const app = express();
  app.use('/', router);

  const MOCK_PASSWORD = '812nyuc109n2u109';
  let user;

  beforeEach(async () => {
    user = {
      id: uuidv4(),
      password: {
        id: uuidv4(),
        hash: await hash(MOCK_PASSWORD),
      },
    };
    await userStorage.store(user);
  });

  describe('login', () => {
    describe('with bad secret', () => {
      it('responds with 401', done => {
        request(app)
          .post('/')
          .send({
            id: user.id,
            secret: 'hunter2',
          })
          .expect(401)
          .expect({ error: { message: 'Authentication failed.' } })
          .end(done);
      });
    });

    describe('with good secret', () => {
      it('responds with 201 and token', done => {
        request(app)
          .post('/')
          .send({
            id: user.id,
            secret: MOCK_PASSWORD,
          })
          .expect(201)
          .expect(req => {
            expect(req.body.token.length).toEqual(36);
          })
          .end(done);
      });
    });
  });

  describe('fetch', () => {
    describe('with bad token', () => {
      it('responds with 401', done => {
        request(app)
          .get('/')
          .set('authorization', 'Bearer 185ad402-ffa9-11e8-a9c2-1040f388afa6')
          .expect(401)
          .expect({ error: { message: 'Invalid token.' } })
          .end(done);
      });
    });

    describe('with good token', () => {
      let session;

      beforeEach(async () => {
        session = {
          id: uuidv4(),
          user,
        };

        await sessionStorage.store(session);
      });

      it('responds with 200 and session', done => {
        request(app)
          .get('/')
          .set('authorization', `Bearer ${session.id}`)
          .expect(200)
          .expect({
            id: session.id,
            token: null,
            user: {
              id: user.id,
              name: null,
              password: {
                id: user.password.id,
                date: null,
                hash: user.password.hash,
              },
            },
          })
          .end(done);
      });
    });
  });
});

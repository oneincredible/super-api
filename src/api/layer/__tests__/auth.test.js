const express = require('express');
const request = require('supertest');

const { createTestDB } = require('../../../util/db');
const { storages } = require('../../../util/model');
const { createAuthorizationLayer } = require('../auth');

describe('Authorization Layer', () => {
  const db = createTestDB();
  const sessionStorage = new storages.SessionStorage(db);
  const requireAuth = createAuthorizationLayer(sessionStorage);

  let app;

  beforeEach(() => {
    app = express();
    app.use('/auth', requireAuth);
  });

  it('denies all access without Auth header', done => {
    request(app)
      .get('/auth/foo')
      .expect(401)
      .expect({ error: { message: 'Authorization required.' } })
      .end(done);
  });

  it('denies access with invalid Auth header', done => {
    request(app)
      .get('/auth/foo')
      .set('Authorization', 'foo bar')
      .expect(400)
      .expect({ error: { message: 'Unknown authorization type: foo.' } })
      .end(done);
  });

  it('denies access with unknown Auth token', done => {
    request(app)
      .get('/auth/foo')
      .set('Authorization', 'Bearer c591990c-ff28-11e8-b9e1-00090ffe0001')
      .expect(401)
      .expect({ error: { message: 'Invalid token.' } })
      .end(done);
  });

  it('grants access with known Auth token and adds session', async done => {
    await sessionStorage.store({
      id: 'f8052136-ff2a-11e8-9055-00090ffe0001',
      user: {
        id: '016ef850-ff2b-11e8-b4a0-00090ffe0001',
        password: {
          id: '0f3385a0-ff2b-11e8-84c1-00090ffe0001',
          hash: 'apa',
        },
      },
    });

    app.use((req, res) => {
      res.send(req.session);
      res.end();
    });

    request(app)
      .get('/auth/foo')
      .set('Authorization', 'Bearer f8052136-ff2a-11e8-9055-00090ffe0001')
      .expect(200)
      .expect({
        id: 'f8052136-ff2a-11e8-9055-00090ffe0001',
        token: null,
        user: {
          id: '016ef850-ff2b-11e8-b4a0-00090ffe0001',
          name: null,
          password: {
            id: '0f3385a0-ff2b-11e8-84c1-00090ffe0001',
            date: null,
            hash: 'apa',
          },
        },
      })
      .end(done);
  });
});

require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('POST test - creates user todos', async() => {

      const expectation = [
        {
          'id': 6,
          'todo': 'call car insurance',
          'completed': false,
          'owner_id': 2
        },
        {
          'id': 7,
          'todo': 'trim hedges',
          'completed': false,
          'owner_id': 2
        },
        {
          'id': 8,
          'todo': 'buy ice cream',
          'completed': false,
          'owner_id': 2
        }
      ];

      for(let todo of expectation) {
        await fakeRequest(app)
          .post('/api/todo')
          .send(todo)
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200);
      }

      const data = await fakeRequest(app)
        .get('/api/todo')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(data.body).toEqual(expectation);
    });
    
    test('GET test - gets user todos', async() => {

      const expectation = [
        {
          'id': 6,
          'todo': 'call car insurance',
          'completed': false,
          'owner_id': 2
        },
        {
          'id': 7,
          'todo': 'trim hedges',
          'completed': false,
          'owner_id': 2
        },
        {
          'id': 8,
          'todo': 'buy ice cream',
          'completed': false,
          'owner_id': 2
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todo')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(data.body).toEqual(expectation);
    });

    test('PUT test - changes user todos completed property to true', async() => {

      const expectation = [
        {
          'id': 6,
          'todo': 'call car insurance',
          'completed': false,
          'owner_id': 2
        },
        {
          'id': 7,
          'todo': 'trim hedges',
          'completed': false,
          'owner_id': 2
        },
        {
          'id': 8,
          'todo': 'buy ice cream',
          'completed': true,
          'owner_id': 2
        }
      ];

      await fakeRequest(app)
        .put('/api/todo/8')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/api/todo')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
        
      expect(data.body).toEqual(expectation);
    });
  });
});


let request = require('supertest');
let app = require('../index.js');
const Redis = require('ioredis');
let redis = new Redis();

// TODO: Add delete user test. 
// TODO: Add two users, visit other's dashboard.

afterAll(() => {
    redis.disconnect();
});

describe("user signup process", () => {
    afterAll(() => {
        redis.del('users:sean');
        redis.del('auth:sean@cl.com')
    });

    test("POST /create", async (done) => {
        let response = await request(app)
            .post('/api/user/create')
            .send('userName=sean')
            .send('userEmail=sean@cl.com')
            .send('userPassword=sean');
        expect(response.statusCode).toBe(302);

        redis.hlen('users:sean', (err, result) => {
            expect(result).toBeGreaterThan(0);
            done();
        });
    });
});

describe("user login process", () => {
    beforeAll(() => {
        redis.del('users:sean');
        redis.del('auth:sean@cl.com');
        redis.hset('users:sean', 'email', 'sean@cl.com');
        redis.hset('auth:sean@cl.com', 'password', 'password', 'namekey', 'users:sean');
    });

    afterAll(() => {
        redis.del('users:sean');
        redis.del('auth:sean@cl.com');
    });

    test("POST /login", async (done) => {
        let response = await request(app)
            .post('/api/user/login')
            .send('userEmail=sean@cl.com')
            .send('userPassword=password');
        expect(response.statusCode).toBe(302);
        expect(response.headers['set-cookie'][0]).toMatch(/checklistingSession/);
        done();
    });
});

let agent = request.agent(app);
describe("user basic full auth process", () => {
    beforeAll(() => {
        redis.del('users:sean');
        redis.del('auth:sean@cl.com');
    });

    afterAll(() => {
        redis.del('users:sean');
        redis.del('auth:sean@cl.com');
    });

    test("GET /u/sean (visitor)", async (done) => {
        let response = await agent.get('/u/sean');
        expect(response.statusCode).toBe(200);
        expect(response.text).not.toMatch(/Your Account/);
        done();
    });

    test("POST /signup", async (done) => {
        let response = await agent.post('/api/user/create')
            .send('userName=sean')
            .send('userEmail=sean@cl.com')
            .send('userPassword=sean');
        expect(response.statusCode).toBe(302);
        expect(response.headers['set-cookie'][0]).toMatch(/checklistingSession/);

        redis.hlen('users:sean', (err, result) => {
            expect(result).toBeGreaterThan(0);
            done();
        });
    });

    test("GET /u/sean (dashboard)", async (done) => {
        let response = await agent.get('/u/sean');
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(/Your Account/);
        done();
    });

    test("GET /logout", async (done) => {
        let response = await agent.get('/api/user/logout');
        expect(response.statusCode).toBe(302);
        done();
    });

    test("GET /u/sean (visitor)", async (done) => {
        let response = await agent.get('/u/sean');
        expect(response.statusCode).toBe(200);
        expect(response.text).not.toMatch(/Your Account/);
        done();
    });

    test("POST /login", async (done) => {
        let response = await agent.post('/api/user/login')
            .send('userEmail=sean@cl.com')
            .send('userPassword=sean');
        expect(response.statusCode).toBe(302);
        expect(response.headers['set-cookie'][0]).toMatch(/checklistingSession/);
        done();
    });

    test("GET /u/sean (dashboard)", async (done) => {
        let response = await agent.get('/u/sean');
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(/Your Account/);
        done();
    });
});
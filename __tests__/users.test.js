
let request = require('supertest');
let app = require('../index.js');
const Redis = require('ioredis');
let redis = new Redis();

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

// view dashboard (redirect), signup, dashboard, logout, dashboard, login, dashboard.
// describe("user basic full auth process", () => {
//     beforeAll(() => {
//         redis.del('list:sean:test');
//         redis.rpush('list:sean:test', "ITEM #1");
//         redis.rpush('list:sean:test', "ITEM #2");
//         redis.rpush('list:sean:test', "ITEM #3");
//     });

//     afterAll(() => {
//         redis.del('list:sean:test');
//     });

//     test("/", async (done) => {
//         let response = await request(app).get('/');
//         expect(response.statusCode).toBe(200);
//         done();
//     });
// });
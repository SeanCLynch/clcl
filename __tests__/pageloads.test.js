describe("jest is running", () => {
    test("two plus two is four", (done) => {
        expect(2 + 2).toBe(4);
        done();
    });
});


let request = require('supertest');
let app = require('../index.js');
const Redis = require('ioredis');
let redis = new Redis();

afterAll(() => {
    redis.disconnect();
});

describe("basic public routes", () => {
    beforeAll(() => {
        redis.del('list:sean:test');
        redis.rpush('list:sean:test', "ITEM #1");
        redis.rpush('list:sean:test', "ITEM #2");
        redis.rpush('list:sean:test', "ITEM #3");
    });

    afterAll(() => {
        redis.del('list:sean:test');
    });

    test("GET /", async (done) => {
        let response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        done();
    });

    test("GET /signup", async (done) => {
        let response = await request(app).get('/signup');
        expect(response.statusCode).toBe(200);
        done();
    });

    test("GET /login", async (done) => {
        let response = await request(app).get('/login');
        expect(response.statusCode).toBe(200);
        done();
    });

    test("GET /cl/:username/:listname", async (done) => {
        let response = await request(app).get('/cl/sean/test');
        expect(response.statusCode).toBe(200);
        done();
    });

    test("GET /random", async (done) => {
        let response = await request(app).get('/random');
        expect(response.statusCode).toBe(302);
        done();
    });

    test("GET /u", async (done) => {
        let response = await request(app).get('/u');
        expect(response.statusCode).toBe(302);
        done();
    });
});
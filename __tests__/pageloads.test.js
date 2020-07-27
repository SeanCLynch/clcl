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

describe("basic pageloads", () => {
    beforeAll(() => {
        redis.del('list:sean:test');
        redis.rpush('list:sean:test', "ITEM #1");
        redis.rpush('list:sean:test', "ITEM #2");
        redis.rpush('list:sean:test', "ITEM #3");
    });

    test("/", async (done) => {
        let response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        done();
    });

    test("/signup", async (done) => {
        let response = await request(app).get('/signup');
        expect(response.statusCode).toBe(200);
        done();
    });

    test("/login", async (done) => {
        let response = await request(app).get('/login');
        expect(response.statusCode).toBe(200);
        done();
    });

    test("/cl/:username/:listname", async (done) => {
        let response = await request(app).get('/cl/sean/test');
        expect(response.statusCode).toBe(200);
        done();
    });

    test("/random", async (done) => {
        let response = await request(app).get('/random');
        expect(response.statusCode).toBe(302);
        done();
    });

    test("/u", async (done) => {
        let response = await request(app).get('/u');
        expect(response.statusCode).toBe(302);
        done();
    });
});
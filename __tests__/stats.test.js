let request = require('supertest');
let app = require('../index.js');
const Redis = require('ioredis');
let redis = new Redis(process.env.REDIS_URL);

afterAll(() => {
    redis.disconnect();
});

describe("ping-pong route", () => {
    test("GET /api/stats/ping", async (done) => {
        let response = await request(app).get('/api/stats/ping');
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatch(/Pong!/);
        done();
    });
});

describe("basic stats route", () => {
    test("GET /api/stats/basic", async (done) => {
        let test_visit = await request(app).get('/');
        let response = await request(app).get('/api/stats/basic');
        expect(response.statusCode).toBe(200);
        expect(response.type).toBe("application/json");
        expect(response.body.dashboard_visit).toBeGreaterThan(0);
        done();
    });
});

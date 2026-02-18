const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createApp = require('../src/app');

let app;
let mongod;

jest.setTimeout(60000);

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    process.env.DATABASE_URI = uri;
    process.env.APP_ID = 'TEST_APP_ID';
    process.env.MASTER_KEY = 'TEST_MASTER_KEY';

    app = await createApp();
});

afterAll(async () => {
    if (mongod) {
        await mongod.stop();
    }
});

describe('Server Sanity Check', () => {

    it('should return 404 for unknown route', async () => {
        const res = await request(app).get('/route-she-lo-kayam');
        expect(res.statusCode).toEqual(404);
    });

    it('should return 200 OK for health check', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
    });
});

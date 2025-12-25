const request = require('supertest');
const createApp = require('../src/app'); // טוענים את ה-Factory

let app;

// איתחול לפני כל הבדיקות
beforeAll(async () => {
    app = await createApp();
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
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server'); // 1. ייבוא
const createApp = require('../src/app');

let app;
let mongod;

// הגדרת זמן ריצה ארוך לטסטים (לפעמים הורדת המונגו לוקחת רגע בפעם הראשונה)
jest.setTimeout(60000);

beforeAll(async () => {
    // 2. הרמת MongoDB בזיכרון
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // 3. דריסה של משתנה הסביבה כדי שהאפליקציה תתחבר ל-DB המדומה
    process.env.DATABASE_URI = uri;
    process.env.APP_ID = 'TEST_APP_ID';
    process.env.MASTER_KEY = 'TEST_MASTER_KEY';

    // 4. העלאת האפליקציה (עכשיו היא תתחבר ל-DB המהיר בזיכרון)
    app = await createApp();
});

afterAll(async () => {
    // 5. ניקוי וסגירת ה-DB בסוף
    if (mongod) {
        await mongod.stop();
    }
});

describe('Security Headers & Auth', () => {

    it('should block access without X-Parse-Application-Id', async () => {
        const res = await request(app)
            .get('/parse/classes/_User')
            .send();
        
        // ציפייה ל-401 Unauthorized או 403 Forbidden
        expect([401, 403]).toContain(res.statusCode);
    });

    it('should handle malicious input gracefully', async () => {
        const res = await request(app)
            .post('/parse/functions/testFunction')
            .set('X-Parse-Application-Id', 'TEST_APP_ID') // שימוש ב-ID שהגדרנו למעלה
            .send({
                evilInput: "<script>alert('hacked')</script>",
                mongoInjection: { "$ne": null }
            });

        // השרת לא אמור לקרוס (500)
        expect(res.statusCode).not.toEqual(500);
    });
});
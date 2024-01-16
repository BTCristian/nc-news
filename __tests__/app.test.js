const db = require("../db/connection");
const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("/api", () => {
  test("GET 200: should provide a list with all available endpoints (with description) as an object", () => {
    const endpoints = require("../endpoints.json");
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(endpoints);
      });
  });
});

describe("/api/topics", () => {
  test("GET 200: should return an array of topics objects ", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.topic).toBeInstanceOf(Array);
        expect(response.body.topic.length).toBeGreaterThan(0);

        response.body.topic.forEach((topics) => {
          expect(topics).toHaveProperty("description");
          expect(topics).toHaveProperty("slug");
          expect(typeof topics.slug).toBe("string");
          expect(typeof topics.description).toBe("string");
        });
      });
  });

  test("GET 404: should return status code 404 for invalid path for endpoint", () => {
    return request(app)
      .get("/api/nonsense")
      .expect(404)
      .then((response) => {
        expect(response.res.statusMessage).toBe("Not Found");
      });
  });
});

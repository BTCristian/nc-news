const db = require("../db/connection");
const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/");
const articles = require("../db/data/test-data/articles");

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
});

describe("/api/nonsense", () => {
  test("GET 404: should return status code 404 for invalid path for endpoint", () => {
    return request(app)
      .get("/api/nonsense")
      .expect(404)
      .then((response) => {
        expect(response.res.statusMessage).toBe("Not Found");
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("GET 200: should return an article object by given id with its own key properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        expect(response.body.article_id).toBe(1);
        expect(response.body.author).toBe("butter_bridge");
        expect(response.body.title).toBe("Living in the shadow of a great man");
        expect(response.body.votes).toBe(100);
        expect(typeof response.body.body).toBe("string");
        expect(typeof response.body.topic).toBe("string");
        expect(typeof response.body.created_at).toBe("string");
        expect(typeof response.body.article_img_url).toBe("string");
      });
  });

  test("GET 404: should return status code 404 and 'Id not found' when id is not found", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Id not found");
      });
  });

  test("GET 400: should return status code 400, bad request for an invalid id ", () => {
    return request(app)
      .get("/api/articles/nonsense")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request, invalid id/not a number");
      });
  });
});

describe("/api/articles", () => {
  test("GET 200: should return an articles array of article objects with their properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body).toBeInstanceOf(Array);
        response.body.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
          expect(article).not.toHaveProperty("body");
          expect(typeof article.votes).toBe("number");
        });
        expect(response.body[0].title).toBe(
          "Eight pug gifs that remind me of mitch"
        );
        expect(response.body[0].article_id).toBe(3);
      });
  });

  test("GET 404: should return status code 404, for invalid endpoint ", () => {
    return request(app)
      .get("/api/aticles")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Endpoint Invalid/Not Found");
      });
  });
});

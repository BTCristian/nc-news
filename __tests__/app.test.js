const db = require("../db/connection");
const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/");
const articles = require("../db/data/test-data/articles");
const sorted = require("jest-sorted");

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
        expect(response.body.endpoints).toEqual(endpoints);
      });
  });
});

describe("/api/nonsense", () => {
  test("GET 404: should return status code 404 for invalid path for endpoint", () => {
    return request(app)
      .get("/api/nonsense")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Endpoint Not Found");
      });
  });
});

describe("/api/topics", () => {
  test("GET 200: should return an array of topic objects with slug and description properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        expect(response.body.topics.length).toBe(3);
        response.body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });

  test("POST 201: should post new topic with slug and description ans return the posted topic", () => {
    const newTopic = {
      slug: "topic name",
      description: "description",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(201)
      .then((response) => {
        expect(response.body.topic).toMatchObject({
          slug: "topic name",
          description: "description",
        });
      });
  });

  test("POST 201: should post new topic with slug only and return the posted topic", () => {
    const newTopic = {
      slug: "topic name",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(201)
      .then((response) => {
        expect(response.body.topic).toMatchObject({
          slug: "topic name",
        });
      });
  });

  test("POST 400: should return 400 status code and error message when post request is missing required fields - slug", () => {
    const newTopic = {
      description: "description",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Missing Required Fields");
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("GET 200: should return a single article object based on article_id given", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        expect(response.body.article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          votes: 100,
          created_at: expect.any(String),
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });

  test("GET 200: should return a single article object based on article_id given - with comment_count", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        expect(response.body.article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          votes: 100,
          created_at: expect.any(String),
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: "11",
        });
      });
  });

  test("GET 404: should return 404 status code and error message when given a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/20")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Article Does Not Exist");
      });
  });

  test("GET 400: should return 400 status code and error message when given an invalid id", () => {
    return request(app)
      .get("/api/articles/nonsense")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad Request");
      });
  });

  test("PATCH 200: should increment votes property based on newVote object - increment", () => {
    const newVote = {
      inc_votes: 3,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(200)
      .then((response) => {
        expect(response.body.article).toMatchObject({
          article_id: 1,
          votes: 103,
        });
      });
  });

  test("PATCH 200: should return original article if inc_votes is missing", () => {
    const newVote = {};
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(200)
      .then((response) => {
        expect(response.body.article).toMatchObject({
          article_id: 1,
          votes: 100,
        });
      });
  });

  test("PATCH 200: should decrement votes property based on newVote object - decrement", () => {
    const newVote = {
      inc_votes: -10,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(200)
      .then((response) => {
        expect(response.body.article).toMatchObject({
          article_id: 1,
          votes: 90,
        });
      });
  });

  test("PATCH 404: should return 404 status code and error message when given a valid but non-existent article_id", () => {
    const newVote = {
      inc_votes: 3,
    };
    return request(app)
      .patch("/api/articles/20")
      .send(newVote)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Article Does Not Exist");
      });
  });

  test("PATCH 400: should return 400 status code and error message when given an invalid article_id", () => {
    const newVote = {
      inc_votes: 3,
    };
    return request(app)
      .patch("/api/articles/nonsense")
      .send(newVote)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad Request");
      });
  });

  test("PATCH 400: should return 400 status code and error message when patch request is missing required fields", () => {
    const newVote = {
      inc_votes: null,
    };
    return request(app)
      .patch("/api/articles/2")
      .send(newVote)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Invalid Patch Query");
      });
  });

  test("PATCH 400: should return 400 status code and error message when patch request contains data with the wrong data type", () => {
    const newVote = {
      inc_votes: "nonsense",
    };
    return request(app)
      .patch("/api/articles/2")
      .send(newVote)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad Request");
      });
  });

  test("DELETE 204: deletes specified article and sends no body back", () => {
    return request(app).delete("/api/articles/1").expect(204);
  });

  test("DELETE 404: should return 404 status code and error message when given a valid but non-existent article_id", () => {
    return request(app)
      .delete("/api/articles/999")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Article Does Not Exist");
      });
  });

  test("DELETE 400: should return 400 status code and error message when given an invalid article_id", () => {
    return request(app)
      .delete("/api/articles/nonsense")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad Request");
      });
  });
});

describe("/api/articles", () => {
  test("GET 200: should return an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.total_count).toBe(13);
        response.body.articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            author: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });

  test("GET 200: should return an array of article objects - sorted by date in descending order.", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
        expect(response.body.articles[0]).toMatchObject({
          article_id: 3,
          title: "Eight pug gifs that remind me of mitch",
          author: "icellusedkars",
          topic: "mitch",
          created_at: "2020-11-03T09:12:00.000Z",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: "2",
        });
      });
  });

  test("GET 200: should filter article objects based on topic query", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((response) => {
        expect(response.body.total_count).toBe(12);
        response.body.articles.forEach((article) => {
          expect(article).toMatchObject({
            topic: "mitch",
          });
        });
      });
  });

  test("GET 200: should return an empty array if topic with no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then((response) => {
        expect(response.body.total_count).toBe(0);
        response.body.articles.forEach((article) => {
          expect(article).toEqual([]);
        });
      });
  });

  test("GET 404: should return 404 status code and error message when given a valid but non-existent query", () => {
    return request(app)
      .get("/api/articles?topic=nonsense")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Topic Does Not Exist");
      });
  });

  test("GET 200: should return articles sorted by created_at descending by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.total_count).toBe(13);
        expect(response.body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });

  test("GET 200: should return articles sorted by valid column - descending by default", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then((response) => {
        expect(response.body.total_count).toBe(13);
        expect(response.body.articles).toBeSortedBy("article_id", {
          descending: true,
        });
      });
  });

  test("GET 404: should return 404 status code and error message when given a invalid sort query", () => {
    return request(app)
      .get("/api/articles?sort_by=nonsense")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Invalid sort_by Query");
      });
  });

  test("GET 200: should return articles sorted by given column descending by default", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then((response) => {
        expect(response.body.total_count).toBe(13);
        expect(response.body.articles).toBeSortedBy("article_id", {
          descending: true,
        });
      });
  });

  test("GET 200: should return articles sorted by given column descending by order specified", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=ASC")
      .expect(200)
      .then((response) => {
        expect(response.body.total_count).toBe(13);
        expect(response.body.articles).toBeSortedBy("article_id", {
          descending: false,
        });
      });
  });

  test("GET 200: should return articles sorted by created_at by default and in the order specified", () => {
    return request(app)
      .get("/api/articles?order=ASC")
      .expect(200)
      .then((response) => {
        expect(response.body.total_count).toBe(13);
        expect(response.body.articles).toBeSortedBy("created_at", {
          descending: false,
        });
      });
  });

  test("GET 404: should return 404 status code and error message when given a invalid order query", () => {
    return request(app)
      .get("/api/articles?order=nonsense")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Invalid order Query");
      });
  });

  test("POST 201: should post article with author, title, body, topic and article_img_url ans return the posted comment", () => {
    const newArticle = {
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then((response) => {
        expect(response.body.article).toMatchObject({
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          created_at: expect.any(String),
          votes: 0,
          article_id: expect.any(Number),
          comment_count: expect.any(String),
        });
      });
  });

  test("POST 201: should post article with author, title, body, topic and article_img_url ans return the posted comment - no article_url given", () => {
    const newArticle = {
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then((response) => {
        expect(response.body.article).toMatchObject({
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          article_img_url:
            "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
          created_at: expect.any(String),
          votes: 0,
          article_id: expect.any(Number),
          comment_count: expect.any(String),
        });
      });
  });

  test("POST 400: should return 400 status code and error message when given an invalid author", () => {
    const newArticle = {
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "nonsense",
      body: "I find this existence challenging",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Invalid Author");
      });
  });

  test("POST 400: should return 400 status code and error message when given an invalid topic", () => {
    const newArticle = {
      title: "Living in the shadow of a great man",
      topic: "nonsense",
      author: "butter_bridge",
      body: "I find this existence challenging",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Invalid Topic");
      });
  });

  test("POST 400: should return 400 status code and error message when post request is missing required fields - author", () => {
    const newArticle = {
      title: "Living in the shadow of a great man",
      topic: "mitch",
      body: "I find this existence challenging",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Missing Required Fields");
      });
  });

  test("POST 400: should return 400 status code and error message when post request is missing required fields - body", () => {
    const newArticle = {
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Missing Required Fields");
      });
  });

  test("POST 400: should return 400 status code and error message when post request is missing required fields - title", () => {
    const newArticle = {
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Missing Required Fields");
      });
  });

  test("POST 400: should return 400 status code and error message when post request is missing required fields - topic", () => {
    const newArticle = {
      title: "Living in the shadow of a great man",
      author: "butter_bridge",
      body: "I find this existence challenging",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Missing Required Fields");
      });
  });

  test("GET 200: should return an array of article objects - when given page and limit", () => {
    return request(app)
      .get("/api/articles?limit=5&page=2")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(5);
        response.body.articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            author: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });

  test("GET 200: should return an array of article objects - when given no page and no limit - limit should default to 10", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(10);
        response.body.articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            author: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });

  test("GET 200: should return an array of article objects - when given page only", () => {
    return request(app)
      .get("/api/articles?page=2")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(3);
        response.body.articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            author: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });

  test("GET 200: should return an array of article objects - when given limit only", () => {
    return request(app)
      .get("/api/articles?limit=6")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(6);
        response.body.articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            author: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("GET 200: should return an array of comments for a given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.total_count).toBe(11);
        response.body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });
  test("GET 200: should return an empty array when given an article with no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments).toEqual([]);
      });
  });

  test("GET 200: should return an array of comments for a given article_id - sorted by most recent first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments).toBeSortedBy("created_at", {
          descending: true,
        });
        expect(response.body.comments[0]).toMatchObject({
          comment_id: 5,
          body: "I hate streaming noses",
          article_id: 1,
          author: "icellusedkars",
          votes: 0,
          created_at: "2020-11-03T21:00:00.000Z",
        });
      });
  });

  test("GET 404: should return 404 status code and error message when given a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/20/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Article Does Not Exist");
      });
  });

  test("GET 400: should return 400 status code and error message when given an invalid id", () => {
    return request(app)
      .get("/api/articles/nonsense/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad Request");
      });
  });
  test("POST 201: should post comments with body and username and return the posted comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Charming",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(201)
      .then((response) => {
        expect(response.body.comment).toMatchObject({
          comment_id: expect.any(Number),
          body: "Charming",
          article_id: 2,
          author: "butter_bridge",
          votes: 0,
          created_at: expect.any(String),
        });
      });
  });

  test("POST 404: should return 404 status code and error message when given a valid but non-existent article_id ", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Charming",
    };
    return request(app)
      .post("/api/articles/20/comments")
      .send(newComment)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("article_id Does Not Exist");
      });
  });

  test("POST 400: should return 400 status code and error message when given an invalid username", () => {
    const newComment = {
      username: "nonsense",
      body: "Charming",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Invalid Username");
      });
  });

  test("POST 400: should return 400 status code and error message when post request is missing required fields - username", () => {
    const newComment = {
      body: "Charming",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Missing Required Fields");
      });
  });

  test("POST 400: should return 400 status code and error message when post request is missing required fields - body", () => {
    const newComment = {
      username: "butter_bridge",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Missing Required Fields");
      });
  });

  test("POST 400: should return 400 status code and error message when given invalid article_id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Charming",
    };
    return request(app)
      .post("/api/articles/nonsense/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad Request");
      });
  });

  test("GET 200: should return an array of comment objects - when given page and limit", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&page=2")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(5);
        response.body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });

  test("GET 200: should return an array of comment objects - when given no page and no limit - limit should default to 10", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(10);
        response.body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });

  test("GET 200: should return an array of comment objects - when given page only", () => {
    return request(app)
      .get("/api/articles/1/comments?page=2")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(1);
        response.body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });

  test("GET 200: should return an array of comment objects - when given limit only", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=6")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(6);
        response.body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });
});

describe("/api/comments/:comment_id", () => {
  test("DELETE 204: deletes specified comment and sends no body back", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });

  test("DELETE 404: should return 404 status code and error message when given a valid but non-existent comment_id", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Comment Does Not Exist");
      });
  });

  test("DELETE 400: should return 400 status code and error message when given an invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/nonsense")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad Request");
      });
  });

  test("PATCH 200: should increment votes property based on newVote object - increment", () => {
    const newVote = {
      inc_votes: 3,
    };
    return request(app)
      .patch("/api/comments/1")
      .send(newVote)
      .expect(200)
      .then((response) => {
        expect(response.body.comment).toMatchObject({
          comment_id: 1,
          votes: 19,
        });
      });
  });

  test("PATCH 200: should increment votes property based on newVote object - decrement", () => {
    const newVote = {
      inc_votes: -10,
    };
    return request(app)
      .patch("/api/comments/1")
      .send(newVote)
      .expect(200)
      .then((response) => {
        expect(response.body.comment).toMatchObject({
          comment_id: 1,
          votes: 6,
        });
      });
  });

  test("PATCH 200: should return original article if inc_votes is missing", () => {
    const newVote = {};
    return request(app)
      .patch("/api/comments/1")
      .send(newVote)
      .expect(200)
      .then((response) => {
        expect(response.body.comment).toMatchObject({
          comment_id: 1,
          votes: 16,
        });
      });
  });

  test("PATCH 404: should return 404 status code and error message when given a valid but non-existent comment_id", () => {
    const newVote = {
      inc_votes: 3,
    };
    return request(app)
      .patch("/api/comments/999")
      .send(newVote)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Comment Does Not Exist");
      });
  });

  test("PATCH 400: should return 400 status code and error message when given an invalid comment_id", () => {
    const newVote = {
      inc_votes: 3,
    };
    return request(app)
      .patch("/api/comments/nonsense")
      .send(newVote)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad Request");
      });
  });

  test("PATCH 400: should return 400 status code and error message when patch request is missing required fields", () => {
    const newVote = {
      inc_votes: null,
    };
    return request(app)
      .patch("/api/comments/2")
      .send(newVote)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Invalid Patch Query");
      });
  });

  test("PATCH 400: should return 400 status code and error message when patch request contains data with the wrong data type", () => {
    const newVote = {
      inc_votes: "nonsense",
    };
    return request(app)
      .patch("/api/comments/2")
      .send(newVote)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Bad Request");
      });
  });
});

describe("/api/users", () => {
  test("GET 200: should return an array of user objects with username, name and avatar_url properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        expect(response.body.users.length).toBe(4);
        response.body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("/api/users/:username", () => {
  test("GET 200: should return user objects with username, name and avatar_url properties", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then((response) => {
        expect(response.body.user).toMatchObject({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });
  test("GET 404: should return 404 status code and error message when given non-existent username", () => {
    return request(app)
      .get("/api/users/nonsense")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("User Does Not Exist");
      });
  });
});

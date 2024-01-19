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
        expect(response.body.msg).toBe("Endpoint Invalid/Not Found");
      });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("GET 200: should return an article object by given id with its own key properties, with comment_count included", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then((response) => {
          expect(response.body.article_id).toBe(1);
          expect(response.body.author).toBe("butter_bridge");
          expect(response.body.title).toBe(
            "Living in the shadow of a great man"
          );
          expect(response.body.votes).toBe(100);
          expect(response.body).toHaveProperty("comment_count");
          expect(typeof response.body.created_at).toBe("string");
          expect(typeof response.body.article_img_url).toBe("string");
        });
    });

    test("GET 404: should return status code 404 and 'Article ID not found' when article_id is not found", () => {
      return request(app)
        .get("/api/articles/9999")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Article ID not found");
        });
    });

    test("GET 400: should return status code 400, bad request for an invalid id ", () => {
      return request(app)
        .get("/api/articles/nonsense")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe(
            "Bad request, invalid id/not a number"
          );
        });
    });
  });

  describe("PATCH", () => {
    test("PATCH 200: should update the votes property of the article", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: 10 })
        .expect(200)
        .then((response) => {
          expect(response.body.article.votes).toBe(110);
        });
    });

    test("PATCH 400: should return status code 400 for invalid inc_votes", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: "nonsense" })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe(
            "Bad request, inc_votes must be a number"
          );
        });
    });

    test("PATCH 404: should return status code 404 when article_id is not found", () => {
      return request(app)
        .patch("/api/articles/999")
        .send({ inc_votes: 10 })
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Article ID not found");
        });
    });

    test("PATCH 400: should return status code 400, bad request for an invalid article_id ", () => {
      return request(app)
        .get("/api/articles/nonsense")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe(
            "Bad request, invalid id/not a number"
          );
        });
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
        expect(response.body.length).toBeGreaterThan(0);
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

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("GET 200: should return an an array of comments for the given article_id", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then((response) => {
          expect(response.body.comments).toBeInstanceOf(Array);
          expect(response.body.comments).toBeSortedBy("created_at", {
            descending: true,
          });
          response.body.comments.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id");
            expect(comment).toHaveProperty("votes");
            expect(comment).toHaveProperty("created_at");
            expect(comment).toHaveProperty("author");
            expect(comment).toHaveProperty("body");
            expect(comment).toHaveProperty("article_id");
          });
        });
    });

    test("GET 200: should return an empty array for an article with 0 comments", () => {
      return request(app)
        .get("/api/articles/7/comments")
        .expect(200)
        .then((response) => {
          expect(response.body.comments).toBeInstanceOf(Array);
          expect(response.body.comments).toHaveLength(0);
          expect(response.body.comments).toEqual([]);
        });
    });

    test("GET 404: should return status code 404 and 'Article ID not found' when article_id is not found", () => {
      return request(app)
        .get("/api/articles/999/comments")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Article ID not found");
        });
    });

    test("GET 400: should return status code 400, bad request for an invalid article_id ", () => {
      return request(app)
        .get("/api/articles/nonsense/comments")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe(
            "Bad request, invalid id/not a number"
          );
        });
    });
  });

  describe("POST", () => {
    test("POST 201: should add a new comment to the article and responds with the posted comment", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "butter_bridge", body: "Testing POST comment" })
        .expect(201)
        .then((response) => {
          expect(response.body.comment.body).toBe("Testing POST comment");
          expect(response.body.comment.author).toBe("butter_bridge");
          expect(response.body.comment).toHaveProperty("comment_id");
          expect(response.body.comment).toHaveProperty("created_at");
        });
    });

    test("POST 400: should return status code 400, for request with no username || body", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "butter_bridge" })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe(
            "Username or body are required fields"
          );
        });
    });

    // Because this is a not found type error, the status code should be 404
    // vvv(to be refactored)
    test("POST 400: should return status code 400, for non-existent user POST request", () => {
      return request(app)
        .post("/api/articles/1/comments")
        .send({ username: "test_user", body: "Testing POST comment" })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("User not found");
        });
    });

    test("POST 400: should return status code 400, for invalid article_id", () => {
      return request(app)
        .post("/api/articles/nonsense/comments")
        .send({ username: "butter_bridge", body: "Testing POST comment" })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe(
            "Bad request, invalid id/not a number"
          );
        });
    });

    test("POST 404: should return status code 404 when article_id is not found", () => {
      return request(app)
        .post("/api/articles/999/comments")
        .send({ username: "butter_bridge", body: "Testing POST comment" })
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Article not found");
        });
    });
  });
});

describe("/api/comments/:comment_id", () => {
  describe("DELETE", () => {
    test("DELETE 204: should delete the given comment by comment_id", () => {
      return request(app).delete("/api/comments/1").expect(204);
    });

    test("DELETE 404: should return status code 404 when comment_id is not found", () => {
      return request(app)
        .delete("/api/comments/999")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Comment with provided ID not found");
        });
    });

    test("DELETE 400: should return status code 400 for an invalid comment_id", () => {
      return request(app)
        .delete("/api/comments/nonsense")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe(
            "Bad request, invalid id/not a number"
          );
        });
    });
  });
});

describe("/api/users", () => {
  describe("GET", () => {
    test("GET 200: should return an array of user objects", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then((response) => {
          expect(response.body.users.length).toBeGreaterThan(0);
          response.body.users.forEach((user) => {
            expect(user).toHaveProperty("username");
            expect(user).toHaveProperty("name");
            expect(user).toHaveProperty("avatar_url");
          });
        });
    });
  });
});

describe("/api/articles?topic=", () => {
  describe("GET", () => {
    test("GET 200: should return articles filtered by topic if topic query is provided", () => {
      const topic = "mitch";
      return request(app)
        .get(`/api/articles?topic=${topic}`)
        .expect(200)
        .then((response) => {
          expect(response.body.length).toBeGreaterThan(0);
          response.body.forEach((article) => {
            expect(article.topic).toBe(topic);
          });
        });
    });

    test("GET 200: should return an empty array if topic exists but there is no article associated", () => {
      const topic = "paper";
      return request(app)
        .get(`/api/articles?topic=${topic}`)
        .expect(200)
        .then((response) => {
          console.log(response.body);
          expect(response.body.length).toBe(0);
          expect(response.body).toEqual([]);
        });
    });

    test("GET 200: should return all articles if no topic query is provided", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then((response) => {
          expect(response.body.length).toBeGreaterThan(0);
          response.body.forEach((article) => {
            expect(article).toHaveProperty("author");
            expect(article).toHaveProperty("topic");
            expect(article).toHaveProperty("article_img_url");
            expect(article).toHaveProperty("comment_count");
            expect(article).not.toHaveProperty("body");
            expect(typeof article.votes).toBe("number");
          });
        });
    });

    test("GET 404: should return status code 404 for a valid but not found topic", () => {
      return request(app)
        .get("/api/articles?topic=nonsense")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe(
            `No articles found with topic: nonsense`
          );
        });
    });
  });
});

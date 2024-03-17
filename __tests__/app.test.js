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

describe("GET /api", () => {
  test("should return statusCode 200 and  object describing all the available endpoints on API", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const { instructions } = body;
        for (let key in instructions) {
          expect(instructions[key].hasOwnProperty("description")).toBe(true);
          expect(instructions[key].hasOwnProperty("queries")).toBe(true);
          expect(instructions[key].hasOwnProperty("exampleResponse")).toBe(
            true
          );
        }
      });
  });
});

describe("GET /api/topics", () => {
  test("should return statuscode 200 and  an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).not.toHaveLength(0);
        topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("should return statusCode 200 and article object by id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article["article_id"]).toBe(1);
        expect(typeof article["title"]).toBe("string");
        expect(typeof article["topic"]).toBe("string");
        expect(typeof article["author"]).toBe("string");
        expect(typeof article["body"]).toBe("string");
        expect(typeof article["created_at"]).toBe("string");
        expect(typeof article["votes"]).toBe("number");
        expect(typeof article["article_img_url"]).toBe("string");
      });
  });
  test("GET:404 sends an appropriate status and error message when given a valid but non-existent id", () => {
    return request(app)
      .get("/api/articles/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article does not exist");
      });
  });
  test("GET:400 sends an appropriate status and error message when given an invalid id", () => {
    return request(app)
      .get("/api/articles/nonsense")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api/articles", () => {
  test("should return statuscode 200 and  an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        articles.forEach((article) => {
          expect(typeof article["article_id"]).toBe("number");
          expect(typeof article["title"]).toBe("string");
          expect(typeof article["topic"]).toBe("string");
          expect(typeof article["author"]).toBe("string");
          expect(typeof article["created_at"]).toBe("string");
          expect(typeof article["votes"]).toBe("number");
          expect(typeof article["article_img_url"]).toBe("string");
          expect(typeof article["comment_count"]).toBe("string");
        });
      });
  });
  test("should return statuscode 200 and  an array of article objects sorted by date in descending order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("should return statuscode 200 and  an array of article objects sorted by author in descending order by default", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("author", { descending: true });
      });
  });
  test("should return statuscode 200 and  an array of article objects sorted by topic in asc order", () => {
    return request(app)
      .get("/api/articles?sort_by=topic&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("topic", { descending: false });
      });
  });
  test("should return statuscode 200 and  an array of article objects ONLY of given TOPIC sorted by date in descending order by default", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { descending: true });
        articles.forEach((article) => {
          expect(article["topic"]).toBe("cats");
        });
      });
  });
  test("should return statuscode 200 and  an array of article objects ONLY of given AUTHOR sorted by date in descending order by default", () => {
    return request(app)
      .get("/api/articles?author=icellusedkars")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { descending: true });
        articles.forEach((article) => {
          expect(article["author"]).toBe("icellusedkars");
        });
      });
  });
  test("GET:400 sends an appropriate status and error message when given an invalid sort_by query", () => {
    return request(app)
      .get("/api/articles?sort_by=234")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("GET:400 sends an appropriate status and error message when given an invalid order query", () => {
    return request(app)
      .get("/api/articles?order=dosc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("GET:404 sends an appropriate status and error message when given a valid but NON-existent TOPIC", () => {
    return request(app)
      .get("/api/articles?topic=nonsense")
      .expect(404)
      .then(({ body }) => {
        // expect(body.msg).toBe("Topic does not exist");
      });
  });
  test("GET:404 sends an appropriate status and error message when given a valid but NON-existent Author", () => {
    return request(app)
      .get("/api/articles?author=icellusedka")
      .expect(404)
      .then(({ body }) => {
        // expect(body.msg).toBe("Author does not exist");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("should return statuscode 200 and  an array of comments for an article given by ID", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).not.toHaveLength(0);
        comments.forEach((comment) => {
          expect(comment["article_id"]).toBe(1);
          expect(typeof comment["comment_id"]).toBe("number");
          expect(typeof comment["body"]).toBe("string");
          expect(typeof comment["author"]).toBe("string");
          expect(typeof comment["created_at"]).toBe("string");
          expect(typeof comment["votes"]).toBe("number");
        });
      });
  });
  test("return 200 and an array of comments for an article given by ID sorted by created_at in DESC ", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("return 200 and an empty array of comments when the article does not have comments ", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toEqual([]);
      });
  });
  test("GET:404 sends an appropriate status and error message when given a valid but NON-existent article ID ", () => {
    return request(app)
      .get("/api/articles/99999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article does not exist");
      });
  });
  test("GET:400 sends an appropriate status and error message when given an invalid ID", () => {
    return request(app)
      .get("/api/articles/nonsense/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("POST: 201 inserts a new comment to the db and sends the posted comment to the client", () => {
    const newComment = {
      username: "icellusedkars",
      body: "Hello world!",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment.body).toBe("Hello world!");
        expect(comment.author).toBe("icellusedkars");
        expect(comment.article_id).toBe(1);
      });
  });
  test("POST:404 sends an appropriate status and error message when given a valid but non-existent id", () => {
    const newComment = {
      username: "icellusedkars",
      body: "Hello world!",
    };
    return request(app)
      .post("/api/articles/99999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article does not exist");
      });
  });
  test("POST:404 sends an appropriate status and error message when given a valid but non-existent username", () => {
    const newComment = {
      username: "nonsense",
      body: "Hello world!",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Username does not exist");
      });
  });
  test("POST:400 sends an appropriate status and error message when given an invalid id", () => {
    const newComment = {
      username: "icellusedkars",
      body: "Hello world!",
    };
    return request(app)
      .post("/api/articles/nonsense/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("POST:400 sends an appropriate status and error message when missing required properties", () => {
    const newComment = {
      body: "Hey there! This is a new comment!",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request: missing some properties");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("PATCH: 200 sends an updated article", () => {
    const updateVote = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(updateVote)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article.votes).toBe(101);
        expect(article.article_id).toBe(1);
      });
  });

  test("PATCH: 200 sends an updated article when negative number is given", () => {
    const updateVote = { inc_votes: -10 };
    return request(app)
      .patch("/api/articles/1")
      .send(updateVote)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article.votes).toBe(90);
        expect(article.article_id).toBe(1);
      });
  });

  test("PATCH:404 sends an appropriate status and error message when given a valid but non-existent id", () => {
    const updateVote = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/991")
      .send(updateVote)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article does not exist");
      });
  });

  test("PATCH:400 sends an appropriate status and error message when missing properties", () => {
    const updateVote = {};
    return request(app)
      .patch("/api/articles/1")
      .send(updateVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          "Bad request: missing some properties OR inc_votes is not a integer"
        );
      });
  });

  test("PATCH:400 sends an appropriate status and error message when inc_votes is not a number", () => {
    const updateVote = { inc_votes: "nonsense" };
    return request(app)
      .patch("/api/articles/1")
      .send(updateVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          "Bad request: missing some properties OR inc_votes is not a integer"
        );
      });
  });

  test("PATCH:400 sends an appropriate status and error message when given an invalid id", () => {
    const updateVote = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/nonsense")
      .send(updateVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("DELETE: 204 deletes the specified comment and sends no body back", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });

  test("DELETE:404 responds with an appropriate status and error message when given a non-existent id", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Comment does not exist");
      });
  });

  test("DELETE:400 responds with an appropriate status and error message when given an invalid id", () => {
    return request(app)
      .delete("/api/comments/notId")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api/users", () => {
  test("check if the returned array is not empty", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).not.toHaveLength(0);
      });
  });

  test("GET: 200 and  an array of users objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        users.forEach((user) => {
          expect(typeof user.username).toBe("string");
          expect(typeof user.name).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });
});

describe("GET /api/articles/?topic=cats", () => {
  test("should return statuscode 200 and  an array of article objects ONLY of given TOPIC", () => {
    return request(app)
      .get("/api/articles/?topic=cats")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).not.toHaveLength(0);
        articles.forEach((article) => {
          expect(article.topic).toBe("cats");
        });
      });
  });

  test("should return statuscode 200 and  an array of ALL article objects if query is omitted (cause of pagination limit will be max 10", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(10);
      });
  });

  test("GET:404 sends an appropriate status and error message when given a valid but NON-existent TOPIC", () => {
    return request(app)
      .get("/api/articles?topic=burger")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic does not exist");
      });
  });

  test("GET: 404 sends an appropriate status and error message when given a valid TOPIC, but article does not exist", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("There is no more article yet");
      });
  });
});

describe("GET /api/articles/:article_id with comment_count", () => {
  test("should return statusCode 200 and article object by id with comment_count", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article["article_id"]).toBe(1);
        expect(article.hasOwnProperty("comment_count")).toBe(true);
      });
  });
});

describe("GET /api/users/:username", () => {
  test("should return statusCode 200 and user object by user name", () => {
    return request(app)
      .get("/api/users/rogersop")
      .expect(200)
      .then(({ body }) => {
        const { user } = body;
        expect(user.name).toBe("paul");
        expect(user.avatar_url).toBe(
          "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4"
        );
      });
  });

  test("GET:404 sends an appropriate status and error message when given a valid but non-existent username", () => {
    return request(app)
      .get("/api/users/nonsense")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User does not exist");
      });
  });

  test("GET:404 sends an appropriate status and error message when given a valid but non-existent username", () => {
    return request(app)
      .get("/api/users/123")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User does not exist");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("PATCH: 200 sends an updated article with updated votes", () => {
    const updateVote = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/1")
      .send(updateVote)
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment.votes).toBe(17);
        expect(comment.comment_id).toBe(1);
      });
  });

  test("PATCH: 200 sends an updated article with updated votes, when inc_votes has a negative value", () => {
    const updateVote = { inc_votes: -10 };
    return request(app)
      .patch("/api/comments/1")
      .send(updateVote)
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment.votes).toBe(6);
        expect(comment.comment_id).toBe(1);
      });
  });

  test("PATCH:404 sends an appropriate status and error message when given a valid but non-existent id", () => {
    const updateVote = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/99999")
      .send(updateVote)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment does not exist");
      });
  });

  test("PATCH:400 sends an appropriate status and error message when missing properties", () => {
    const updateVote = {};
    return request(app)
      .patch("/api/comments/1")
      .send(updateVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          "Bad request: missing some properties OR inc_votes is not a integer"
        );
      });
  });

  test("PATCH:400 sends an appropriate status and error message when inc_votes is not a number", () => {
    const updateVote = { inc_votes: "nonsense" };
    return request(app)
      .patch("/api/comments/1")
      .send(updateVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          "Bad request: missing some properties OR inc_votes is not a integer"
        );
      });
  });

  test("PATCH:400 sends an appropriate status and error message when given an invalid id", () => {
    const updateVote = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/nonsense")
      .send(updateVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("POST /api/articles", () => {
  test("POST: 201 inserts a new article to the db and sends the posted article to the client", () => {
    const newArticle = {
      title: "The Maine Coon",
      topic: "cats",
      author: "icellusedkars",
      body: "The Maine Coon is a large domesticated cat breed.The Maine Coon is predominantly known for its size and dense coat of fur which helps it survive in the harsh climate of Maine. The Maine Coon is often cited as having dog-like characteristics",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        const { article } = body;
        expect(article.topic).toBe("cats");
        expect(article.author).toBe("icellusedkars");
        expect(article.title).toBe("The Maine Coon");
        expect(article.body).toBe(
          "The Maine Coon is a large domesticated cat breed.The Maine Coon is predominantly known for its size and dense coat of fur which helps it survive in the harsh climate of Maine. The Maine Coon is often cited as having dog-like characteristics"
        );
        expect(article.article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
        expect(article.votes).toBe(0);
        expect(article.comment_count).toBe(0);
        expect(article.hasOwnProperty("created_at")).toBe(true);
        expect(article.hasOwnProperty("article_id")).toBe(true);
      });
  });

  test("POST:404 sends an appropriate status and error message when given a valid but non-existent author", () => {
    const newArticle = {
      title: "The Maine Coon",
      topic: "cats",
      author: "nonsense",
      body: "The Maine Coon is a large domesticated cat breed.The Maine Coon is predominantly known for its size and dense coat of fur which helps it survive in the harsh climate of Maine. The Maine Coon is often cited as having dog-like characteristics",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Author does not exist");
      });
  });

  test("POST:404 sends an appropriate status and error message when given a valid but non-existent TOPIC", () => {
    const newArticle = {
      title: "The Maine Coon",
      topic: "nonsense",
      author: "icellusedkars",
      body: "The Maine Coon is a large domesticated cat breed.The Maine Coon is predominantly known for its size and dense coat of fur which helps it survive in the harsh climate of Maine. The Maine Coon is often cited as having dog-like characteristics",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic does not exist");
      });
  });

  test("POST:400 sends an appropriate status and error message when missing required properties", () => {
    const newArticle = {
      title: "The Maine Coon",
      topic: "cats",
      body: "The Maine Coon is a large domesticated cat breed.The Maine Coon is predominantly known for its size and dense coat of fur which helps it survive in the harsh climate of Maine. The Maine Coon is often cited as having dog-like characteristics",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request: missing some properties");
      });
  });
});

describe("GET /api/articles PAGINATION", () => {
  test("GET: 200 and returns articles paginated according to the limit and  page values", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=asc&limit=5&p=1")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(5);
        articles.forEach((article) => {
          expect([1, 2, 3, 4, 5].includes(article.article_id)).toBe(true);
        });
      });
  });

  test("GET: 200 and returns articles paginated according to the limit and  page values FOR PAGE 2", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=asc&limit=5&p=2")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(5);
        articles.forEach((article) => {
          expect([6, 7, 8, 9, 10].includes(article.article_id)).toBe(true);
        });
      });
  });

  test("GET: 200 and returns articles paginated according to the limit and  page values AND TOTAL_COUNT value", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=asc&limit=5&p=2")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(5);
        articles.forEach((article) => {
          expect(article.hasOwnProperty("total_count")).toBe(true);
        });
      });
  });

  test("GET: 200 and returns 10 articles when pagination limit is not passed BUT there is a page value ", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=asc&p=1")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        articles.forEach((article) => {
          expect(
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(article.article_id)
          ).toBe(true);
        });
      });
  });

  test("GET:404 sends an appropriate status and error message when given a valid but NON-existent PAGE", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=asc&p=4")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("There is no more article yet");
      });
  });
});

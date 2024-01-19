# Northcoders News API

Welcome to NC News! This project is a full-stack application
This is an API for the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as Reddit) which should provide this information to the front end architecture.

# Hosted Version

Explore the hosted version of NC News here:
https://nc-news-cristian.onrender.com/

\*You may find it easier to read by installing a JSON Formatter extension to your browser. We recommend this one for Chrome: https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa?hl=en

Your database will be PSQL, and you will interact with it using node-postgres. Please check: https://node-postgres.com/ for documentation and command lines

# Get started

             by cloning (not forking) this GitHub repo:

https://github.com/BTCristian/nc-news

# Database instructions

Creating the databases
We'll have two databases in this project:
one for real-looking dev data, and another for simpler test data.

You will need to create two .env files for your project:
.env.test - which should contain one line:

    e.g: PGDATABASE=nc_news_test

and

.env.development. - which should contain one line:

    e.g: PGDATABASE=nc_news

Into each, add PGDATABASE=, with the correct database name for that environment (see /db/setup.sql for the database names).
Double check that these .env files are .gitignored.

Check 'package.json' file and install required dependencies:
You'll need to run npm install at this point.

\*Please do not install specific packages as you can do this down the line when you need them.

# Seed local database

You have also been provided with a db folder with some data, a setup.sql file and a seeds folder. In 'package.json' file you can see scripts section and now is time to seed your local db:

        npm run setup-dbs
        npm run seed

# Run Tests

Run the tests to ensure everything is set up correctly:

        npm test

# Minimum Versions

Ensure you have the following minimum versions of Node.js and PostgreSQL:

Node.js: v14.0.0
PostgreSQL: v12.0.0

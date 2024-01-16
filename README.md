# Northcoders News API

This is an API for the purpose of accessing application data programmatically.

Your database will be PSQL, and you will interact with it using node-postgres.

#Database instructions:

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

You'll need to run npm install at this point.

\*Please do not install specific packages as you can do this down the line when you need them.

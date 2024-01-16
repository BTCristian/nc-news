# Northcoders News API

#Database instructions:

Creating the databases
We'll have two databases in this project:
one for real-looking dev data, and another for simpler test data.

You will need to create two .env files for your project:
.env.test and .env.development.

Into each, add PGDATABASE=, with the correct database name for that environment (see /db/setup.sql for the database names).
Double check that these .env files are .gitignored.

You'll need to run npm install at this point.

\*Please do not install specific packages as you can do this down the line when you need them.

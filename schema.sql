--CREATE DATABASE IF NOT EXISTS movies;

DROP TABLE IF EXISTS category CASCADE;
CREATE TABLE IF NOT EXISTS category (
	id serial PRIMARY KEY,
  name varchar(50) NOT NULL UNIQUE,
  isSubCategoryOf int DEFAULT NULL REFERENCES category(id)
);

DROP TABLE IF EXISTS movies CASCADE;
CREATE TABLE IF NOT EXISTS movies (
	id serial PRIMARY KEY,
  name varchar(100) NOT NULL,
  year int,
  director varchar(100),
  category_id integer NOT NULL REFERENCES category(id),
  token varchar(500)
);
DROP TABLE IF EXISTS category CASCADE
CREATE TABLE category (
	id serial PRIMARY KEY,
    name varchar(50) NOT NULL UNIQUE,
    isSubCategoryOf int DEFAULT NULL
)

DROP TABLE IF EXISTS movies CASCADE
CREATE TABLE movies (
	id serial PRIMARY KEY,
    name varchar(100) NOT NULL,
  	year int,
  	director varchar(100),
    category_id integer NOT NULL references category(id)
)
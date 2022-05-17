const express = require("express");
const category = require("./controllers/category");
const movies = require("./controllers/movies");

const routes = express();

//categories
routes.get("/categories", category.getAllCategories);
routes.get("/category/:id", category.getCategoryById);
routes.post("/category", category.addCategory);
routes.put("/category/:id", category.updateCategory);
routes.delete("/category/:id", category.deleteCategory);

//movies
routes.get("/movies", movies.getAllMovies);
routes.get("/movies/:id", movies.getMoviesById);
routes.post("/movies", movies.addMovies);
routes.put("/movies/:id", movies.updateMovies);
routes.delete("/movies/:id", movies.deleteMovies);

module.exports = routes;

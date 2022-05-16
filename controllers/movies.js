const connection = require("../connection");

const getAllMovies = async (req, res) => {
  try {
    const { rows: movies } = await connection.query(
      `SELECT a.id, a.name, a.year, a.director, b.name AS category
          FROM movies a 
          LEFT JOIN category b ON a.category_id = b.id
          ORDER BY a.id`
    );

    return res.status(200).json(movies);
  } catch (err) {
    return res.status(400).json(err.message);
  }
};

const getMoviesById = async (req, res) => {
  const { id } = req.params;
  try {
    const movies = await connection.query(
      `SELECT a.id, a.name, a.year, a.director, b.name AS category
        FROM movies a 
        LEFT JOIN category b ON a.category_id = b.id
        WHERE a.id = $1`,
      [id]
    );
    if (movies.rowCount === 0) {
      return res.status(404).json("Movies not found");
    }
    return res.status(200).json(movies.rows[0]);
  } catch (err) {
    return res.status(400).json(err.message);
  }
};

const addMovies = async (req, res) => {
  const { name, year, director, category_id } = req.body;
  if (!name) {
    return res.status(400).json("Name is required");
  }
  if (!category_id) {
    return res.status(400).json("Category Id is required");
  }
  let moviesList = await connection.query(
    `SELECT * 
    FROM movies 
    WHERE name = $1
    AND year = $2
    AND director = $3
    AND category_id = $4`,
    [name, year, director, category_id]
  );
  if (moviesList.rowCount !== 0) {
    return res.status(404).json("Movies is already in the database");
  }

  try {
    const movies = await connection.query(
      `INSERT INTO movies (name, year, director, category_id) 
      VALUES ($1, $2, $3, $4)`,
      [name, year, director, category_id]
    );

    if (movies.rowCount === 0) {
      return res.status(400).json("Movies could not be added");
    }

    res.status(200).json("Movies added successfully!");
  } catch (err) {
    return res.status(400).json(err.message);
  }
};

const updateMovies = async (req, res) => {
  const { id } = req.params;
  let { name, year, director, category_id } = req.body;
  try {
    const movies = await connection.query(
      `SELECT * FROM movies WHERE id = $1`,
      [id]
    );
    if (movies.rowCount === 0) {
      return res.status(404).json("Movies not found");
    }

    const newMovies = {
      name: name ?? movies.rows[0].name,
      year: year ?? movies.rows[0].year,
      director: director ?? movies.rows[0].director,
      category_id: category_id ?? movies.rows[0].category_id,
    };

    const { rows: moviesList } = await connection.query(
      "SELECT * FROM movies WHERE id <> $1",
      [id]
    );
    for (let item of moviesList) {
      if (
        item.name === newMovies.name &&
        item.year === newMovies.year &&
        item.director === newMovies.director &&
        item.category_id === newMovies.category_id
      ) {
        return res.status(404).json("Movies is already in the database");
      }
    }

    const updatedMovies = await connection.query(
      `UPDATE movies
          SET name = $1, year = $2, director = $3, category_id = $4
          WHERE id = $5`,
      [
        newMovies.name,
        newMovies.year,
        newMovies.director,
        newMovies.category_id,
        id,
      ]
    );
    if (updatedMovies.rowCount === 0) {
      return res.status(404).json("Movies could not be updated");
    }

    return res.status(200).json("Movies updated successfully");
  } catch (err) {
    return res.status(400).json(err.message);
  }
};

const deleteMovies = async (req, res) => {
  const { id } = req.params;

  try {
    const movies = await connection.query(
      `SELECT * FROM movies WHERE id = $1`,
      [id]
    );
    if (movies.rowCount === 0) {
      return res.status(404).json("Movies not found");
    }

    const deletedMovies = await connection.query(
      `DELETE FROM movies WHERE id = $1`,
      [id]
    );
    if (deletedMovies.rowCount === 0) {
      return res.status(400).json("Movies could not be deleted");
    }

    return res.status(200).json("Movies deleted successfully!");
  } catch (err) {
    return res.status(400).json(err.message);
  }
};

module.exports = {
  getAllMovies,
  getMoviesById,
  addMovies,
  updateMovies,
  deleteMovies,
};

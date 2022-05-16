const connection = require("../connection");

const getAllCategories = async (req, res) => {
  try {
    const { rows: categories } = await connection.query(
      `SELECT a.id, a.name, b.name AS SubcategoryOf
        FROM category a 
        LEFT JOIN category b ON a.isSubCategoryOf = b.id
        ORDER BY a.id`
    );

    for (const category of categories) {
      const { rows: movies } = await connection.query(
        `SELECT id, name, year, director
        FROM movies
        WHERE category_id = $1`,
        [category.id]
      );
      category.movies = movies;
    }

    return res.status(200).json(categories);
  } catch (err) {
    return res.status(400).json(err.message);
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await connection.query(
      `SELECT a.id, a.name, b.name AS SubcategoryOf
        FROM category a 
        LEFT JOIN category b ON a.isSubCategoryOf = b.id
        WHERE a.id = $1`,
      [id]
    );

    if (category.rowCount === 0) {
      return res.status(404).json("Category not found");
    }

    const { rows: movies } = await connection.query(
      `SELECT id, name, year, director
        FROM movies
        WHERE category_id = $1`,
      [id]
    );
    category.rows[0].movies = movies;

    return res.status(200).json(category.rows[0]);
  } catch (err) {
    return res.status(400).json(err.message);
  }
};

const addCategory = async (req, res) => {
  const { name, isSubCategoryOf } = req.body;

  if (!name) {
    return res.status(400).json("Name is required");
  }

  let categoryList = await connection.query(
    "SELECT * FROM category WHERE name = $1",
    [name]
  );
  if (categoryList.rowCount !== 0) {
    return res.status(404).json("Category is already in the database");
  }

  try {
    const category = await connection.query(
      `INSERT INTO category (name, isSubCategoryOf) 
      VALUES ($1, $2)`,
      [name, isSubCategoryOf]
    );

    if (category.rowCount === 0) {
      return res.status(400).json("Category could not be added");
    }

    res.status(200).json("Category added successfully!");
  } catch (err) {
    return res.status(400).json(err.message);
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  let { name, isSubCategoryOf } = req.body;
  try {
    const category = await connection.query(
      `SELECT * FROM category WHERE id = $1`,
      [id]
    );

    if (category.rowCount === 0) {
      return res.status(404).json("Category not found");
    }

    const newCategory = {
      name: name ?? category.rows[0].name,
      isSubCategoryOf: isSubCategoryOf ?? category.rows[0].isSubCategoryOf,
    };

    const { rows: categoryList } = await connection.query(
      "SELECT * FROM category WHERE id <> $1",
      [id]
    );
    for (let item of categoryList) {
      if (item.name === newCategory.name) {
        return res.status(404).json("Category is already in the database");
      }
    }

    const updatedCategory = await connection.query(
      `UPDATE category
        SET name = $1, isSubCategoryOf = $2
        WHERE id = $3`,
      [newCategory.name, newCategory.isSubCategoryOf, id]
    );
    if (updatedCategory.rowCount === 0) {
      return res.status(404).json("Category could not be updated");
    }

    return res.status(200).json("Category updated successfully");
  } catch (err) {
    return res.status(400).json(err.message);
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await connection.query(
      `SELECT * FROM category WHERE id = $1`,
      [id]
    );
    if (category.rowCount === 0) {
      return res.status(404).json("Category not found");
    }

    const movies = await connection.query(
      `SELECT * FROM movies WHERE category_id = $1`,
      [id]
    );
    if (movies.rowCount !== 0) {
      return res.status(400).json("You cannot delete a category with movies");
    }
    //IMPLEMENTAR UMA CHAMADA PARA EXCLUIR TODOS OS FILMES CADASTRADOS COM TAL CATEGORIA???

    const subcategories = await connection.query(
      `SELECT * FROM category WHERE isSubCategoryOf = $1`,
      [id]
    );
    if (subcategories.rowCount !== 0) {
      return res
        .status(400)
        .json("You cannot delete a category with subcategories");
    }
    //IMPLEMENTAR UMA CHAMADA *RECURSIVA* PARA EXCLUIR AS SUBCATEGORIAS E SUBS DAS SUBS...???

    const deletedCategory = await connection.query(
      `DELETE FROM category WHERE id = $1`,
      [id]
    );
    if (deletedCategory.rowCount === 0) {
      return res.status(400).json("Category could not be deleted");
    }

    return res.status(200).json("Category deleted successfully!");
  } catch (err) {
    return res.status(400).json(err.message);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
};

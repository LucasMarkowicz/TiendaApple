const { Router } = require("express");
const router = Router();
const ProductManager = require("../daos/productManager.js");
const manager = new ProductManager();
const productErrors = require("../errors/productErrors.js");
const logger = require("../config/logger.js");
const accessRole = require("../middlewares/accessRole.js")

router.get("/", accessRole(['admin', 'user']), async (req, res) => {
  try {
    let limit;
    let sortBy;
    let category;

    if (req.query.limit) {
      limit = parseInt(req.query.limit);
    } else {
      limit = undefined;
    }

    if (req.query.sortBy) {
      sortBy = req.query.sortBy.toLowerCase();
    } else {
      sortBy = undefined;
    }

    if (req.query.category) {
      category = req.query.category.toLowerCase();
    } else {
      category = undefined;
    }

    let products = await manager.getProducts();

    if (category) {
      products = products.filter(product => product.category.toLowerCase() === category);
    }

    if (sortBy) {
      if (sortBy === "asc") {
        products.sort((a, b) => a.price - b.price);
      } else if (sortBy === "desc") {
        products.sort((a, b) => b.price - a.price);
      }
    }

    if (limit) {
      products = products.slice(0, limit);
    }

    res.json({ products });
  } catch (error) {
    logger.error("Error en la ruta GET 'api/products/json':", error);
    res.status(500).send(productErrors.PRODUCT_LIST_ERROR);
  }
});




router.get("/:pid", accessRole(['admin', 'user']), async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await manager.getProductById(pid);
    if (product) {
      res.json({ product });
    } else {
      res.status(404).send(productErrors.PRODUCT_NOT_FOUND);
    }
  } catch (error) {
    logger.error(`Error en la ruta GET ' api/products/:pid': ${error}`);
    res.status(500).send(productErrors.PRODUCT_GET_ERROR);
  }
});

router.post("/", accessRole(['admin']), async (req, res) => {
  try {
    const { title, description, price, thumbnail, code, stock, category } = req.body;
    const newProduct = await manager.addProduct(
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
      category
    );
    res.send("Producto agregado exitosamente");
  } catch (error) {
    logger.error("Error en la ruta POST 'api/products/':", error);
    res.status(500).send(productErrors.PRODUCT_ADD_ERROR);
  }
});

router.put("/:pid", accessRole(['admin']), async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await manager.getProductById(pid);
    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    const updatedProduct = req.body;
    await manager.updateProduct(pid, updatedProduct);
    res.send("Producto actualizado exitosamente");
  } catch (error) {
    logger.error(`Error en la ruta PUT 'api/products/:pid': ${error}`);
    res.status(500).send(productErrors.PRODUCT_UPDATE_ERROR);
  }
});

router.delete("/:pid", accessRole(['admin']), async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await manager.getProductById(pid);
    if (!product) {
      res.status(404).send(productErrors.PRODUCT_NOT_FOUND);
    } else {
      await manager.deleteProduct(pid);
      res.send("Producto eliminado exitosamente");
    }
  } catch (error) {
    logger.error(`Error en la ruta DELETE 'api/products/:pid': ${error}`);
    res.status(500).send(productErrors.PRODUCT_DELETE_ERROR);
  }
});

module.exports = router;

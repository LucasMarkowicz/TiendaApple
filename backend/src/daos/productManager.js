const { ObjectId } = require('../db/db.js');
const Product = require('./models/product.Models.js');
const productErrors = require('../errors/productErrors.js');
const logger = require('../config/logger.js');

class ProductManager {
  async addProduct(title, description, price, thumbnail, code, stock, category) {
    try {
      const existingProduct = await Product.findOne({ code: code });
      if (existingProduct) {
        throw new Error(productErrors.PRODUCT_EXISTS);
      }

      const product = {
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        category,
      };

      await Product.create(product);
      logger.info('Producto agregado');
    } catch (error) {
      logger.error(`Error al agregar el producto: ${error}`);
      throw new Error(productErrors.GENERAL_ERROR);
    }
  }

  async getProducts() {
    try {
      const products = await Product.find({});
      return products;
    } catch (error) {
      logger.error(`Error al obtener los productos: ${error}`);
      throw new Error(productErrors.GENERAL_ERROR);
    }
  }

  async getProductById(pid) {
    try {
      const result = await Product.findOne({ _id: new ObjectId(pid) });
      return result ? result : null;
    } catch (error) {
      logger.error(`Error al obtener el producto por ID: ${error}`);
      throw new Error(productErrors.GENERAL_ERROR);
    }
  }

  async updateProduct(id, updates) {
    try {
      const product = await Product.findOne({ _id: id });
      if (!product) {
        throw new Error(productErrors.PRODUCT_NOT_FOUND);
      }
  
      await Product.updateOne({ _id: id }, { $set: updates });
      logger.info('Producto actualizado');
    } catch (error) {
      logger.error(`Error al actualizar el producto: ${error}`);
      throw new Error(productErrors.GENERAL_ERROR);
    }
  }

  async deleteProduct(id) {
    try {
      const product = await Product.findOne({ _id: new ObjectId(id) });
      if (!product) {
        throw new Error(productErrors.PRODUCT_NOT_FOUND);
      }

      await Product.deleteOne({ _id: new ObjectId(id) });
      logger.info('Producto eliminado');
    } catch (error) {
      logger.error(`Error al eliminar el producto: ${error}`);
      throw new Error(productErrors.GENERAL_ERROR);
    }
  }
}

module.exports = ProductManager;



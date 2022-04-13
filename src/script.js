const { Router } = require("express");
const router = Router();
const { json, urlencoded } = require("express");
const { options } = require("../options/mariaDB.js");
const knex = require("knex")(options);

class ApiProducts {
  constructor() {
    router.use(json());
    router.use(urlencoded({ extended: true }));

    this.createIfNotExist();
    this.showProducts();
    this.showProduct();
    this.router = router;
  }

  async createIfNotExist() {
    try {
      await knex.schema.createTable("products", (table) => {
        table.string("title");
        table.string("thumbnail");
        table.float("price");
        table.increments("id");
      });
      console.log("Table products created");
    } catch (err) {
      console.log(err.sqlMessage);
    }
  }

  async getDataBaseProducts() {
    let db;
    await knex
      .from("products")
      .select("*")
      .then((products) => {
        db = products;
      })
      .catch((err) => {
        console.log(err);
      });
    return db;
  }

  async getDataBaseProduct(id) {
    let db;
    await knex
      .from("products")
      .select("*")
      .where("id", "=", id)
      .then((product) => {
        db = product;
      });
    return db;
  }

  showProducts() {
    router
      .route("/")
      .get(async (req, res) => {
        const products = await this.getDataBaseProducts();
        res.render("table", { products });
      })
      .post(async (req, res) => {
        const products = await this.getDataBaseProducts();
        const newProduct = req.body;
        newProduct.price = parseFloat(newProduct.price);

        knex("products")
          .insert(newProduct)
          .then(() => {
            console.log("Product inserted");
          })
          .finally(() => {
            res.render("table", { products });
          });
      });
  }

  showProduct() {
    router
      .route("/:id")
      .get(async (req, res) => {
        const id = parseInt(req.params.id);
        const product = await this.getDataBaseProduct(id);

        if (product.length) {
          return res.json(product);
        }
        res.json({ error: "producto no encontrado" });
      })
      .put(async (req, res) => {
        const id = parseInt(req.params.id);
        const product = await this.getDataBaseProduct(id);

        if (product) {
          knex
            .from("products")
            .where({ id: id })
            .update(req.body)
            .then(() => {
              console.log("Product updated");
            });

          return res.json(
            `El producto con el id:${req.params.id} ha sido actualizado`
          );
        }
        res.json({ error: "producto no encontrado" });
      })
      .delete(async (req, res) => {
        const id = parseInt(req.params.id);
        const product = await this.getDataBaseProduct(id);

        if (product) {
          knex
            .from("products")
            .where({ id: id })
            .del()
            .then(() => {
              console.log("Product deleted");
            });

          return res.json(
            `El producto con el id:${req.params.id} ha sido eliminado`
          );
        }
        res.json({ error: "producto no encontrado" });
      });
  }
}

const api = new ApiProducts();

module.exports = api;

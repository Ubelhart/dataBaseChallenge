const express = require("express");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
const server = express();
const httpServer = new HttpServer(server);
const io = new IOServer(httpServer);
const api = require("./script");
let products;
api.getDataBaseProducts().then((db) => {
  products = db;
});
const { options } = require("../options/mariaDB.js");
const knex = require("knex")(options);

async function createIfNotExist() {
  try {
    await knex.schema.createTable("messages", (table) => {
      table.string("email");
      table.string("text");
    });
    console.log("Table messages created");
  } catch (err) {
    console.log(err.sqlMessage);
  }
}

async function getDataBaseMessages() {
  await createIfNotExist();

  let db;
  await knex
    .from("messages")
    .select("*")
    .then((messages) => {
      db = messages;
    })
    .catch((err) => {
      console.log(err);
    });
  return db;
}

io.on("connection", async (socket) => {
  console.log("Un cliente se ha conectado");

  socket.emit("products", products);
  socket.on("new-products", (product) => {
    product.price = parseInt(product.price);

    if (!products.length) {
      product.id = 1;
    } else {
      product.id = products.at(-1).id + 1;
    }
    products.push(product);
    io.sockets.emit("products", products);
  });
  const messages = await getDataBaseMessages();

  socket.emit("messages", messages);
  socket.on("new-message", async (data) => {
    knex("messages")
      .insert(data)
      .then(() => {
        console.log("Message inserted");
      })
      .catch((err) => {
        console.log(err);
      });
    io.sockets.emit("messages", messages);
  });
});

server.use(express.static("public"));
server.use("/api/productos", api.router);

server.set("views", "./views");
server.set("view engine", "ejs");

server.get("/", (req, res) => {
  res.render("form");
});

module.exports = httpServer;

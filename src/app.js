const express = require("express");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
const server = express();
const httpServer = new HttpServer(server);
const io = new IOServer(httpServer);
const api = require("./script");

const { options } = require("../options/mariaDB.js");
const knex = require("knex")(options);

async function createIfNotExist() {
  try {
    await knex.schema.createTable("messages", (table) => {
      table.string("email");
      table.string("text");
      table.string("date");
      table.increments("id");
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
    .catch(async (err) => {
      console.log(err.sqlMessage);
    });
  return db;
}

io.on("connection", async (socket) => {
  console.log("Un cliente se ha conectado");
  const messages = await getDataBaseMessages();
  const products = await api.getDataBaseProducts();

  socket.emit("products", products);
  socket.on("new-products", async (product) => {
    product.price = parseInt(product.price);

    knex("products")
      .insert(product)
      .then(() => {
        console.log("Producto insertado");
      });
    const products = await api.getDataBaseProducts();
    io.sockets.emit("products", products);
  });

  socket.emit("messages", messages);
  socket.on("new-message", async (message) => {
    message.date = new Date().toLocaleString();

    knex("messages")
      .insert(message)
      .then(() => {
        console.log("Message inserted");
      })
      .catch((err) => {
        console.log(err);
      });
    const messages = await getDataBaseMessages();
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

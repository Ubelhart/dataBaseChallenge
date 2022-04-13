const express = require("express");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
const server = express();
const httpServer = new HttpServer(server);
const io = new IOServer(httpServer);
const { containerMessages, containerProducts } = require("./Container");

io.on("connection", async (socket) => {
  console.log("Un cliente se ha conectado");
  const messages = await containerMessages.getDataBaseMessages();
  const products = await containerProducts.getDataBaseProducts();

  socket.emit("products", products);
  socket.on("new-products", async (product) => {
    product.price = parseInt(product.price);

    containerProducts.insertProduct(product);
    const products = await containerProducts.getDataBaseProducts();
    io.sockets.emit("products", products);
  });

  socket.emit("messages", messages);
  socket.on("new-message", async (message) => {
    message.date = new Date().toLocaleString();

    containerMessages.insertMessage(message);
    const messages = await containerMessages.getDataBaseMessages();
    io.sockets.emit("messages", messages);
  });
});

server.use(express.static("public"));

server.set("views", "./views");
server.set("view engine", "ejs");

server.get("/", (req, res) => {
  res.render("form");
});

module.exports = httpServer;

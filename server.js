const httpServer = require("./src/app");

const PORT = 8080;

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

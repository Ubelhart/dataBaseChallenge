const sqlite3 = {
  client: "sqlite3",
  connection: {
    filename: "./DB/mydb.sqlite",
  },
  useNullAsDefault: true,
};

module.exports = { sqlite3 };

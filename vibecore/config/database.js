require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "admin",
    database: process.env.DB_NAME || "readvibe",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 1000,
    dialect: "postgres",
    logging: false,
  },
  test: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "admin",
    database: process.env.DB_NAME_TEST || "readvibe_test",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 1000,
    dialect: "postgres",
    logging: false,
  },
  production: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "admin",
    database: process.env.DB_NAME || "readvibe",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 1000,
    dialect: "postgres",
    logging: false,
  },
};

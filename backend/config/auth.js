require("dotenv").config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  jwtExpiration: "24h",
  saltRounds: 10,
};

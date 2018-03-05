var path = require("path");
module.exports = {
  entry: "./actions/flight-price-check.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  target: "node",
  mode: "development"
};

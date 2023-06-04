// next.config.js

module.exports = {
  webpack: (config) => {
    config.resolve.alias["@/components"] = require("path").resolve(
      __dirname,
      "src/components"
    );
    return config;
  },
};

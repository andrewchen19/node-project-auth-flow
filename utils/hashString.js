// build-in module
const crypto = require("crypto");

const hashString = (string) => {
  const hashValue = crypto.createHash("sha256").update(string).digest("hex");

  return hashValue;
};

module.exports = hashString;

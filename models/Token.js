const mongoose = require("mongoose");
const { Schema } = mongoose;

// schema 的部分
const tokenSchema = new Schema(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    // 這行代表 user 的值，是來自於 mongoDB users collection 裡面的 primary key
    // 但還是要自行添加 (並非會自動儲存)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  // automatically generate createdAt and updatedAt fields for the document
  { timestamps: true }
);

// model 的部分
const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;

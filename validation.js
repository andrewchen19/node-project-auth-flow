const Joi = require("joi");

// 當有人要註冊我們系統的話，必須先通過此驗證
const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(50).messages({
      "any.required": "Name must be provided",
      "string.empty": "Name cannot be empty",
      "string.min": "Name should have a minimum length of {#limit} characters",
      "string.max": "Name should have a maximum length of {#limit} characters",
    }),
    // email() -> 必須是有效的 email 格式
    email: Joi.string().email().required().messages({
      "any.required": "Email must be provided",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address",
    }),
    password: Joi.string().required().min(5).messages({
      "any.required": "Password must be provided",
      "string.empty": "Password cannot be empty",
      "string.min":
        "Password should have a minimum length of {#limit} characters",
    }),
    role: Joi.string().valid("admin", "user").default("user").messages({
      "any.only": "Role must be one of: admin, user",
    }),
  });

  return schema.validate(data);
};

// 當有人要登入我們系統的話，必須先通過此驗證
// 這邊的 password 不用限定字數 (只是登入而已)
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email must be provided",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password must be provided",
      "string.empty": "Password cannot be empty",
    }),
  });

  return schema.validate(data);
};

// 當有人忘記密碼的話，必須先通過此驗證
const forgotPasswordValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email must be provided",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address",
    }),
  });

  return schema.validate(data);
};

// 當有人要更改密碼的話，必須先通過此驗證
const resetPasswordValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email must be provided",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address",
    }),
    token: Joi.string().required().messages({
      "any.required": "Password token must be provided",
      "string.empty": "Password token cannot be empty",
    }),
    password: Joi.string().required().min(5).messages({
      "any.required": "Password must be provided",
      "string.empty": "Password cannot be empty",
      "string.min":
        "Password should have a minimum length of {#limit} characters",
    }),
  });

  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};

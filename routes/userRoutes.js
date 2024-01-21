const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
} = require("../controllers/userController");

const { authorizePermissions } = require("../middleware/auth");

router.route("/").get(authorizePermissions("admin"), getAllUsers);
router.route("/showMe").get(showCurrentUser);
router.route("/:_id").get(getSingleUser);

module.exports = router;

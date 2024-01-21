const User = require("../models/User");

const { checkPermission } = require("../utils");

const getAllUsers = async (req, res) => {
  try {
    // method chaining (exclude password 這個欄位)
    let users = await User.find({ role: "user" }).select("-password");

    res.status(200).json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const getSingleUser = async (req, res) => {
  const { _id } = req.params;

  try {
    // 沒找到特定的資料時， return null
    const user = await User.findOne(req.params).select("-password");

    if (!user) {
      // Not Found
      return res.status(404).json({ msg: `No user with id: ${_id}` });
    }

    // 找到資料後，查看使用者是否有權限進行操作
    checkPermission(req.user, _id);

    res.status(200).json({ user });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ msg: `No user with id: ${_id}` });
    } else if (error.message === "Permission Fail") {
      return res.status(403).json({ msg: "Not authorized to this route" });
    } else {
      res.status(500).json({ msg: error });
    }
  }
};

const showCurrentUser = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
};

// external emports
const express = require("express");

// internal imports
const {
  getUsers,
  addUser,
  removeUser,
} = require("../controller/usersControler");
const decorateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const avatarUpload = require("../middlewares/users/avatarUploads");
const {
  addUserValidators,
  addUserValidationHandler,
} = require("../middlewares/users/userValidator");
const { checkLogin } = require("../middlewares/common/checkLogin");

const router = express.Router();

// users page
router.get("/", decorateHtmlResponse("Users"), checkLogin, getUsers);

// user add
router.post(
  "/",
  checkLogin,
  avatarUpload,
  addUserValidators,
  addUserValidationHandler,
  addUser
);

// delete user
router.delete("/:id", removeUser);

// export module
module.exports = router;

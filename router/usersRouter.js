// external emports
const express = require("express");

// internal imports
const { getUsers } = require("../controller/usersControler");
const decorateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");

const router = express.Router();

// users page
router.get("/", decorateHtmlResponse("Users"), getUsers);

// export module
module.exports = router;

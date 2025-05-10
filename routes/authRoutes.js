import express from "express";
const router = express.Router();
const authController = require("../../controllers/authController");
const { ensureAuth, ensureGuest } = require("../middlewares/auth");

router.post("/signup", ensureGuest, authController.signup);
router.post("/login", ensureGuest, authController.login);
router.post("/logout", ensureAuth, authController.logout);

module.exports = router;
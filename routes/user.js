const express = require("express");
const router = express.Router();

// Import de fileupload qui nous permet de recevoir des formdata
const fileUpload = require("express-fileupload");

const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../functions/convertToBase64");

const User = require("../models/User");

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const isAuthenticated = require("../middlewares/isAuthenticated");

// ===========================
// Creation nouvel utilisateur
// ===========================
router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const avatarUser = req.files?.picture;
    // exclusions
    if (!username) {
      return res.status(400).json({ message: "username is needed" });
    }
    if (!email) {
      return res.status(400).json({ message: "email is needed" });
    }
    if (!password) {
      return res.status(400).json({ message: "password is missing" });
    }
    const userExisting = await User.findOne({ email: email });
    if (userExisting !== null) {
      return res.status(409).json({ message: "email already exists" });
    }
    // traitement du mot de passe
    const salt = uid2(64);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(32);
    // creation de l'objet User
    const user = new User({
      email: email,
      account: {
        username: username,
        avatar: null,
      },
      favorites: null,
      token: token,
      hash: hash,
      salt: salt,
    });
    // traitement de l'avatar
    if (avatarUser) {
      const folder = "/happyCow/users/" + user._id;
      const avatarCloudinary = await cloudinary.uploader.upload(
        convertToBase64(avatarUser),
        (options = { folder: folder })
      );
      user.account.avatar = avatarCloudinary;
    }
    // sauvegarde du user dans la BDD
    await user.save();
    res.json({
      _id: user._id,
      token: user.token,
      account: user.account,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ===========================
// Login d'un utilisateur
// ===========================
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // recherche par email
    const user = await User.findOne({ email: email });
    if (user === null) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // check du mot de passe
    const salt = user.salt;
    const newHash = SHA256(password + salt).toString(encBase64);
    if (newHash !== user.hash) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // user OK
    res.json({
      _id: user._id,
      token: user.token,
      account: user.account,
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ========================
// Update d'un utilisateur
// ========================
router.put("/user/update", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    const { email, username, favorites, modifyAvatar } = req.body;
    const avatar = req.files?.picture;
    const userToModify = await User.findById(req.user._id);
    let isModified = false;
    if (email && email !== userToModify.email) {
      // verification de l'inexistence du nouvel email dans la BDD
      const userExisting = await User.findOne({ email: email });
      if (userExisting !== null) {
        return res.status(409).json({ message: "email already exists" });
      } else {
        // changement de l'email
        userToModify.email = email;
        isModified = true;
      }
    }
    if (username && username !== userToModify.account.username) {
      userToModify.account.username = username;
      isModified = true;
    }
    if (modifyAvatar === "true") {
      if (userToModify.account.avatar) {
        const deleted = await cloudinary.uploader.destroy(
          userToModify.account.avatar.public_id
        );
        userToModify.account.avatar = null;
      }
      if (avatar) {
        const folder = "/happyCow/users/" + req.user._id;
        const avatarCloudinary = await cloudinary.uploader.upload(
          convertToBase64(avatar),
          (options = { folder: folder })
        );
        userToModify.account.avatar = avatarCloudinary;
      }
      isModified = true;
    }
    if (favorites && !favorites.includes("undefined")) {
      userToModify.favorites = JSON.parse(favorites);
      isModified = true;
    }
    if (isModified) {
      const updated = await userToModify.save();
    }
    res.json({
      email: userToModify.email,
      username: userToModify.account.username,
      favorites: userToModify.favorites,
      avatar: userToModify.account.avatar?.secure_url,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ====================================
// Obtenir les données d'un utilisateur
// ====================================
router.get("/user/read", isAuthenticated, async (req, res) => {
  try {
    const userToRead = await User.findById(req.user._id);
    if (userToRead) {
      res.json({
        email: userToRead.email,
        username: userToRead.account.username,
        favorites: userToRead.favorites,
        avatar: userToRead.account.avatar?.secure_url || null,
      });
    } else {
      res.status(400).json({ message: "user not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

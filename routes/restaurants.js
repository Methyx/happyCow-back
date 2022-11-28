// const { request } = require("express");
const express = require("express");
const router = express.Router();

const Restaurant = require("../models/Restaurant");

router.get("/restaurants", async (req, res) => {
  try {
    const {
      string,
      nameOnly,
      address,
      category,
      rating,
      vegan,
      vegOnly,
      page,
      nbPerPage,
    } = req.query;
    // construction de la requete dans FIND pour les mots clés
    const requestFind = {};
    if (string) {
      if (nameOnly === "true") {
        // string est recherché sur "name" uniquement
        requestFind.name = new RegExp(string, "i");
      } else {
        //string est recherché dans "name" ou dans "description"
        requestFind.$or = [
          { name: new RegExp(string, "i") },
          { description: new RegExp(string, "i") },
        ];
      }
    }
    if (address) {
      requestFind.address = new RegExp(address, "i");
    }
    if (category && Number(category)) {
      requestFind.category = Number(category);
    }
    if (rating && Number(rating)) {
      requestFind.rating = { $gte: Number(rating) };
    }
    if (vegan === "true") {
      requestFind.vegan = 1;
    }
    if (vegOnly === "true") {
      requestFind.vegOnly = 1;
    }
    // construction de la requete SKIP et LIMIT
    let nbRestaurants = 10;
    if (nbPerPage && Number(nbPerPage) && Number(nbPerPage) > 0) {
      nbRestaurants = nbPerPage;
    }
    let nbToSkip = 0;
    if (Number(page) > 1) {
      nbToSkip = (page - 1) * nbRestaurants;
    }

    // envoi de la requete à la BDD
    const results = await Restaurant.find(requestFind)
      .skip(nbToSkip)
      .limit(nbRestaurants);
    //   .select("name description address");
    //   .populate("owner", "account _id");
    // reponse au client
    nbElements = await Restaurant.countDocuments(requestFind);
    const response = {
      count: nbElements,
      restaurants: results,
    };
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

// const { request } = require("express");
const { request } = require("express");
const express = require("express");
const router = express.Router();

const Restaurant = require("../models/Restaurant");

// =======================
// Search a list of items
// =======================
router.get("/restaurants", async (req, res) => {
  try {
    const {
      string,
      nameOnly,
      address,
      category,
      type,
      rating,
      vegan,
      vegOnly,
      page,
      nbPerPage,
    } = req.query;
    // build FIND request with key words
    const requestFind = {};
    if (string) {
      if (nameOnly === "true") {
        // string is searched ONLY in "name"
        requestFind.name = new RegExp(string, "i");
      } else {
        //string is searched in "name" or in "description"
        requestFind.$and = [
          {
            $or: [
              { name: new RegExp(string, "i") },
              { description: new RegExp(string, "i") },
            ],
          },
        ];
      }
    }
    if (address) {
      requestFind.address = new RegExp(address, "i");
    }
    if (category) {
      const categories = category.split(" "); // each category must be separate by "+"" in request, but split with " "
      requestFind.$or = [];
      for (let i = 0; i < categories.length; i++) {
        if (categories[i] === "0" && type) {
          const types = type.split(" "); // each type must be separate by "+"" in request, but split with " "
          for (let j = 0; j < types.length; j++) {
            requestFind.$or.push({
              $and: [{ category: 0 }, { type: types[j] }],
            });
          }
        } else {
          requestFind.$or.push({ category: categories[i] });
        }
      }
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
    // build SKIP and LIMIT request
    let nbRestaurants = 10;
    if (nbPerPage && Number(nbPerPage) && Number(nbPerPage) > 0) {
      nbRestaurants = nbPerPage;
    }
    let nbToSkip = 0;
    if (Number(page) > 1) {
      nbToSkip = (page - 1) * nbRestaurants;
    }

    // send request to DB
    const results = await Restaurant.find(requestFind)
      .skip(nbToSkip)
      .limit(nbRestaurants);
    //   .select("name description address");
    //   .populate("owner", "account _id");
    // Send Response
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

// ================================
// Search ONE item by id
// ================================
router.get("/restaurant/:id", async (req, res) => {
  const id = req.params.id;
  let result = {};
  try {
    if (id.includes("placeId=")) {
      result = await Restaurant.findOne({
        placeId: id.replace("placeId=", ""),
      });
    } else {
      result = await Restaurant.findById(id);
    }
    if (!result) {
      res.status(404).json({ message: "item not found" });
    } else {
      res.json(result);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

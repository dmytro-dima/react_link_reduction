const { Router } = require("express");
const Link = require("../models/links");
const router = Router();

router.get("/:code", async (req, res) => {
  try {
    const link = await Link.findOne({ code: req.params.code });

    if (!link) res.status(400).json({ message: "Посилання не знайдено" });
    else {
      link.clicks++;
      await link.save();
      return res.redirect(link.from);
    }
  } catch (e) {
    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" });
  }
});

module.exports = router;

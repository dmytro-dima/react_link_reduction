const router = require("express").Router();
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../config/default.json").jwtSecret;
const { check, validationResult } = require("express-validator");

// /api/auth/register
router.post(
  "/register",
  [
    check("email", "некоректний email").isEmail(),
    check("password", "некоректний password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array(), message: "некоректні дані" });
    }

    try {
      const { email, password } = req.body;
      const candidate = await User.findOne({ email });
      if (candidate) {
        return res.status(400).json({ message: "такий користувач вже існує" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email,
        password: hashedPassword,
      });
      await user.save();

      res.status(201).json({ message: "користувач створений" });
    } catch (err) {
      res.status(500).json({ message: "щось пішло не так" });
    }
  }
);

// /api/auth/login
router.post(
  "/login",
  [
    check("email", "Введіть коректний email").normalizeEmail().isEmail(),
    check("password", "Введіть коректний password")
      .exists()
      .isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array(), message: "некоректні дані" });
    }
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });

      if (!user) res.status(400).json({ message: "користувач не знайдений" });

      const isMatch = await bcrypt.compare(password, user.password);

      const token = jwt.sign({ userId: user.id }, jwtSecret, {
        expiresIn: "1h",
      });

      if (isMatch) res.status(201).json({ token, userId: user.id });
      else res.status(400).json({ message: "невірний пароль" });
    } catch (err) {
      res.status(500).json({ message: "щось пішло не так" });
    }
  }
);

module.exports = router;

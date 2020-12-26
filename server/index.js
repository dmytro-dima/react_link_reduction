const express = require("express");
const config = require("./config/default.json");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/link", require("./routes/link.routes"));
app.use("/t", require("./routes/redirect.routes"));

if ((process.env.NODE_ENV = "production")) {
  app.use("/", express.static(path.join(__dirname, "../client", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}
app.get("/", (req, res) => res.json({ message: "home pages 🏠🏠🏠" }));

const PORT = config.port || 5000;
const start = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    app.listen(PORT, () => console.log(`App has been started on port ${PORT}`));
  } catch (error) {
    console.log(`Server error ${error}`);
    process.exit(1);
  }
};

start();

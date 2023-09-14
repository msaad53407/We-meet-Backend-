const express = require("express");
const cors = require("cors");
const app = express();
app.options("*", cors());
app.use(express.json());
app.use(cors());

const PORT = 3000;

app.post("/", cors(), (req, res) => {
  const { name } = req.body;
  res.json(`Hello ${name}!`);
});

app.listen(PORT, function () {
  console.log("App listening on http://localhost:" + PORT);
});

const express = require("express");
const { mongodb, MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
require("dotenv").config();
app.options("*", cors());
app.use(express.json());
app.use(cors());

const PORT = 3000;

const uri = process.env.MONGO_DB_URI;
const dbName = "Authentication";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.post("/login", cors(), async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await client.connect((err) => {
      if (err) {
        console.error(err);
        return false;
      }
      // Connection to mongo is successful, listen for requests
      app.listen(PORT, () => {
        console.log("listening for requests");
      });
    });
    await client.db(dbName).command({ ping: 1 });
    console.log("Connected to MongoDB Successfully");

    const db = result.db(dbName);
    const userData = db.collection("userData");
    const query = { "user.username": username };
    const user = await userData.findOne(query);
    if (!user) {
      res.status(200).json({
        loginCondition: false,
        loginData: "No User found with username. Try SigningUp",
      });
    } else {
      res.status(200).json({
        loginCondition: true,
        loginData: user,
      });
    }
  } catch (error) {
    res.status(500).send(error);
  } finally {
    console.log("client closed");
    client.close();
  }
});

app.post("/signup", cors(), async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await client.connect((err) => {
      if (err) {
        console.error(err);
        return false;
      }
      // connection to mongo is successful, listen for requests
      app.listen(PORT, () => {
        console.log("listening for requests");
      });
    });
    await client.db(dbName).command({ ping: 1 });
    console.log("Connected to MongoDB Successfully");

    const db = result.db(dbName);
    const userData = db.collection("userData");
    const query = { "user.username": username };
    const user = await userData.findOne(query);
    if (user) {
      res.status(200).json({
        signUpCondition: false,
        signUpData: "Username already taken. Try something else.",
      });
    } else {
      const newDocument = {
        user: {
          username: username,
          password: password,
        },
      };
      userData.insertOne(newDocument);
      const query = { "user.username": username };
      const user = await userData.findOne(query);
      if (user) {
        res.status(200).json({
          signUpCondition: true,
          signUpData: user,
        });
      } else {
        res.status(200).json({
          signUpCondition: true,
          signUpData: newDocument,
        });
      }
    }
  } catch (error) {
    res.status(500).send(error);
  } finally {
    console.log("client closed");
    client.close();
  }
});

app.get("/login", cors(), async (req, res) => {
  try {
    const id = req.query.id;
    const result = await client.connect((err) => {
      if (err) {
        console.error(err);
        return false;
      }
      // connection to mongo is successful, listen for requests
      app.listen(PORT, () => {
        console.log("listening for requests");
      });
    });
    await client.db(dbName).command({ ping: 1 });
    console.log("Connected to MongoDB Successfully");
    const db = result.db(dbName);

    const userData = db.collection("userData");

    const query = { _id: new ObjectId(id) };

    const user = await userData.findOne(query);
    if (!user) {
      res.status(200).json({
        loginCondition: false,
        loginData: "No User found with username",
      });
    } else {
      res.status(200).json({
        loginCondition: true,
        loginData: user,
      });
    }
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  } finally {
    console.log("client closed");
    client.close();
  }
});

app.post("/", cors(), (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { name } = req.body;
  res.json(`Hello ${name}!`);
});

app.listen(PORT, function () {
  console.log("App listening on http://localhost:" + PORT);
});

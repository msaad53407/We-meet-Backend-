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
    const { name, username, password } = req.body;
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
          name: name,
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
        console.log(err);
        return;
      }
      app.listen(PORT, () => {
        console.log("Listening for requests");
      });
    });
    await client.db(dbName).command({ ping: 1 });
    console.log("Connected to MongoDB Successfully");
    const db = result.db(dbName);

    const userData = db.collection("userData");

    const query = { _id: new ObjectId(id) };
    const user = await userData.findOne(query);
    if (!user) {
      console.log(id);
      res.status(200).json({
        loginCondition: false,
        loginData: "No User found with username",
      });
    } else {
      console.log(id);
      res.status(200).json({
        loginCondition: true,
        loginData: user,
      });
    }
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  } finally {
    client.close();
    console.log("client closed");
  }
});

app.post("/post", cors(), async (req, res) => {
  try {
    const { userId, tweetContent } = req.body;
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

    const PostsData = db.collection("PostsData");
    const userData = db.collection("userData");
    const query = { _id: new ObjectId(userId) };
    const user = await userData.findOne(query);
    const response = await PostsData.insertOne({
      user: {
        userId,
        username: user.user.username,
        name: user.user.name,
      },
      tweetContent,
      statistics: {
        likes: {
          likesCount: 0,
          usersLiked: [],
        },
        comments: 0,
        shares: 0,
      },
      postedAt: new Date().getTime(),
    });

    if (response.acknowledged) {
      res.status(200).json({
        status: "Posted Successfully.",
      });
    } else {
      res.status(300).json({
        status: "Could not Post",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Internal Server Error" + error,
    });
  } finally {
    client.close();
    console.log("Client Closed");
  }
});

app.put("/post", cors(), async (req, res) => {
  try {
    const { tweetId, modifyType, userId } = req.body;
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

    const PostsData = db.collection("PostsData");

    const query = { _id: new ObjectId(tweetId) };
    switch (modifyType) {
      case "like":
        const incrementLike = {
          $inc: { "statistics.likes.likesCount": 1 },
          $push: {
            "statistics.likes.usersLiked": {
              userId: userId,
            },
          },
        };
        const updatedPost = await PostsData.findOneAndUpdate(
          query,
          incrementLike
        );
        res.status(200).json({
          status: "Liked Successfully.",
          data: updatedPost,
        });
        break;
      case "unlike":
        const decrementLike = {
          $inc: { "statistics.likes.likesCount": -1 },
          $pull: { "statistics.likes.usersLiked": { userId } },
        };
        const unlikeDocument = await PostsData.findOne(query);
        if (unlikeDocument && unlikeDocument.statistics.likes.likesCount > 0) {
          const post = await PostsData.updateOne(query, decrementLike);
          res.status(200).json({
            status: "Unliked Successfully.",
            data: post,
          });
          break;
        } else {
          res.status(200).json({
            status: "Cannot Decrement likes below 0",
          });
          break;
        }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Internal Server Error" + error,
    });
  } finally {
    client.close();
    console.log("Client Closed");
  }
});

app.delete("/post-delete", cors(), async (req, res) => {
  try {
    const { tweetId } = req.body;
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

    const PostsData = db.collection("PostsData");

    const query = { _id: new ObjectId(tweetId) };
    console.log(await PostsData.findOne(query));
    await PostsData.findOneAndDelete(query);
    res.status(200).json({
      status: "Post Deleted Successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Internal Server Error" + error,
    });
  } finally {
    client.close();
    console.log("Client Closed");
  }
});

app.get("/posts", cors(), async (req, res) => {
  try {
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

    const PostsData = db.collection("PostsData");

    const posts = await PostsData.find({}).limit(10).toArray();
    res.status(200).json({
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "Internal Server Error" + error,
    });
  } finally {
    client.close();
    console.log("Client Closed");
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

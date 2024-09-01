const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(cookieParser());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5q2fm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = "mongodb://localhost:27017/";
// console.log("connection string : ", uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//middlewares

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const serviceCollection = client.db("serviceDB").collection("services");
    const bookingCollection = client.db("serviceDB").collection("bookings");

    // auth related api

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log("User payload", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
        })
        .send({ success: true });
    });

    // verify token

    const verifyToken = async (req, res, next) => {
      // console.log("token in the middleware", req.cookies.token);
      const token = req.cookies?.token;

      if (!token) {
        return res.status(401).send({ message: "Not authorized" });
      }

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "Unauthorized" });
        }
        req.user = decoded;
        next();
      });
    };

    app.post("/logout", async (req, res) => {
      const userLog = req.body;
      // console.log("login out user : ", userLog);
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    // Services related api
    app.get("/services", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = {
        projection: { title: 1, img: 1, price: 1 },
      };
      const result = await serviceCollection.findOne(filter, options);
      res.send(result);
    });

    app.get("/bookings", verifyToken, async (req, res) => {
      console.log(req.query?.email);
      // console.log("Verified token : ", req.user);
      if (req.user.email !== req.query.email) {
        return res.status(403).send({ message: "Forbidden access" });
      }
      const query = { email: req.query?.email };
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const customerInfo = req.body;
      console.log(customerInfo);
      const result = await bookingCollection.insertOne(customerInfo);
      res.send(result);
    });

    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateBooking = req.body;
      console.log(updateBooking);

      const updatedDoc = {
        $set: {
          status: updateBooking.status,
        },
      };
      const result = await bookingCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Car server running...");
});

app.listen(port, () => {
  console.log(`Car server running on port ${port}`);
});

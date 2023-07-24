const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
console.log(process.env.DB_USER);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ljsyrma.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const collegeData = client.db("CampusReserve").collection("campusDB");
    const userData = client.db("CampusReserve").collection("userDB");
    const bookAdmission = client
      .db("CampusReserve")
      .collection("bookAdmission");
    const reviews = client.db("CampusReserve").collection("reviews");
    // search college
    app.get("/searchCollege/:name", async (req, res) => {
      const name = req.params.name;
      // console.log(name);
      const result = await collegeData
        .find({ college_name: { $regex: name, $options: "i" } })
        .limit(3)
        .toArray();
      res.json(result);
    });

    // put user on registration and update
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userData.updateOne(query, updateDoc, options);
      res.json(result);
    });

    // get user information by email
    app.get("/user-data/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userData.findOne(query);
      res.json(result);
    });

    // update user information
    app.put("/user-profile-update/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const option = { upsert: true };
      const updatedProfileData = req.body;
      const updateData = {
        $set: {
          name: updatedProfileData.name,
          email: updatedProfileData.email,
          address: updatedProfileData.address,
          university: updatedProfileData.university,
        },
      };
      const result = await userData.updateOne(query, updateData, option);
      res.json(result);
    });

    // get all college information
    app.get("/all-college", async (req, res) => {
      const result = await collegeData.find({}).toArray();
      res.json(result);
    });

    // get college information by id
    app.get("/college-information/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await collegeData.findOne(query);
      res.json(result);
    });

    // Admission bookings
    app.post("/bookAdmission", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      const result = await bookAdmission.insertOne(body);
      res.json(result);
    });

    // Get My Admission bookings
    app.get("/myBookings/:email", async (req, res) => {
      const email = req.params.email;
      const result = await bookAdmission
        .find({
          email: req.params.email,
        })
        .sort({ createdAt: -1 })
        .toArray();
      res.json(result);
    });

    // Give Reviews to colleges
    app.post("/reviews", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      const result = await reviews.insertOne(body);
      res.json(result);
    });

    // get all reviews information
    app.get("/all-reviews", async (req, res) => {
      const result = await reviews.find({}).toArray();
      res.json(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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
  res.send("Course Reserve server is running");
});

app.listen(port, () => {
  console.log("Course Reserve server Running on localhost");
});

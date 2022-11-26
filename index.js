const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uhdrgdr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoriesCollection = client.db("vehiclesZone").collection("categories");
        const productsCollection = client.db("vehiclesZone").collection("products");

        app.get("/categories", async(req, res) => {
            const query = {};
            const result = await categoriesCollection.find(query).toArray();
            res.send(result);
        })
        app.get("/categories/:id", async(req, res) => {
            const id = req.params.id;
            const query = {category_id: id};
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        })
  
    } finally {
    }
  }
  run().catch((error) => console.error(error));


app.get("/", (req, res) => {
    res.send("vehicles zone server is running");
  });
  
  app.listen(port, () => {
    console.log(`vehicles zone server is running on port ${port}`);
  });
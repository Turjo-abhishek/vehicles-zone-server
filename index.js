const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
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
        const usersCollection = client.db("vehiclesZone").collection("users");
        // Categories
        app.get("/categories", async(req, res) => {
            const query = {};
            const result = await categoriesCollection.find(query).toArray();
            res.send(result);
        })
        app.get("/categories/:id", async(req, res) => {
            const id = req.params.id;
           
            const query = {category_id: id};
            const result = await productsCollection.find(query).toArray();
            console.log(result);
            res.send(result);
        })

        // products

        app.post("/products", async(req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        });

        app.get("/vehicles", async(req, res) => {
            const userEmail = req.query.email;
            const query = {seller_email: userEmail};
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        })

        // Users

        app.post("/users", async(req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        // JWT

        app.get("/jwt", async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '2 days'});
                return res.send({token});
            }
            res.status(403).send(" ");
        });

        // buyers

        app.get("/allbuyers", async(req, res) => {
            const role = req.query.role;
            const query = {role: role};
            const buyers = await usersCollection.find(query).toArray();
            res.send(buyers);
        })

        app.delete("/allbuyers/:id", async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        // seller

        app.get("/users/seller/:email", async(req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            res.send({isSeller: user?.role === "seller"})
        })

        app.get("/allsellers", async(req, res) => {
            const role = req.query.role;
            const query = {role: role};
            const sellers = await usersCollection.find(query).toArray();
            res.send(sellers);
        })

        app.delete("/allsellers/:id", async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        // Admin

        app.get("/users/admin/:email", async(req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === "admin"})
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
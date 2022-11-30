const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uhdrgdr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const categoriesCollection = client
      .db("vehiclesZone")
      .collection("categories");
    const productsCollection = client.db("vehiclesZone").collection("products");
    const usersCollection = client.db("vehiclesZone").collection("users");
    const bookingsCollection = client.db("vehiclesZone").collection("bookings");
    const paymentsCollection = client.db("vehiclesZone").collection("payments");
    const advertisesCollection = client.db("vehiclesZone").collection("advertises");
    // Categories
    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoriesCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { category_id: id, status: "available" };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    // products

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.patch("/products", async(req, res) => {
        const productId = req.query.productId;
        const providedStatus = req.body.status;
        const filter = {_id : ObjectId(productId)};
        const updateDoc = {
            $set: {
              status: providedStatus
            },
          };
        const result = await productsCollection.updateOne(filter, updateDoc); 
        res.send(result);
    })

    app.get("/vehicles", async (req, res) => {
      const userEmail = req.query.email;
      const query = { seller_email: userEmail };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/vehicles/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const result = await productsCollection.deleteOne(filter);
        res.send(result);
      });

      app.patch("/vehicles", async(req, res) => {
        const vehicleId = req.query.vehicleId;
        const advertised = req.body.advertised;
        const filter = {_id : ObjectId(vehicleId)};
        const updateDoc = {
            $set: {
              advertised: advertised
            },
          };
        const result = await productsCollection.updateOne(filter, updateDoc); 
        res.send(result);
    })

    // advertises

    app.post("/advertises", async(req, res) => {
        const advertisedProduct = req.body;
        const result = await advertisesCollection.insertOne(advertisedProduct);
        res.send(result);
    })

    app.get("/advertises", async(req, res) => {
        const query = {};
        const result = await advertisesCollection.find(query).toArray();
        res.send(result);
    })

    app.delete("/advertises/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { vehicle_id: id };
        const result = await advertisesCollection.deleteOne(filter);
        res.send(result);
      });


    // bookings

    app.post("/bookings", async (req, res) => {
      const bookedProduct = req.body;
      const result = await bookingsCollection.insertOne(bookedProduct);
      res.send(result);
    });

    app.get("/orders", async (req, res) => {
      const userEmail = req.query.email;
      const query = { buyer_email: userEmail };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.findOne(query);
      res.send(result);
    });

    // Users

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // JWT

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "2 days",
        });
        return res.send({ token });
      }
      res.status(403).send(" ");
    });

    // buyer

    app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isBuyer: user?.role === "buyer" });
    });

    app.get("/allbuyers", async (req, res) => {
      const role = req.query.role;
      const query = { role: role };
      const buyers = await usersCollection.find(query).toArray();
      res.send(buyers);
    });

    app.delete("/allbuyers/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

    // seller

    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role === "seller" });
    });

    app.get("/allsellers", async (req, res) => {
      const role = req.query.role;
      const query = { role: role };
      const sellers = await usersCollection.find(query).toArray();
      res.send(sellers);
    });

    app.delete("/allsellers/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

    app.put("/allsellers/:id", async(req, res) => {
        const id = req.params.id;
        const filter = {_id: ObjectId(id)};
        const options = { upsert: true };
        const updatedDoc = {
            $set: {
                verified: true
            }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc, options);
        res.send(result);
    });
    
    app.put("/seller/verify/:email", async(req, res) => {
        const email = req.params.email;
        const filter = {seller_email: email};
        const options = { upsert: true };
        const updatedDoc = {
            $set: {
                verified: true
            }
        }
        const result = await productsCollection.updateOne(filter, updatedDoc, options);
        res.send(result);
    });

    

    // app.get("/sellers/verified/:email", async (req, res) => {
    //     const email = req.params.email;
    //     console.log(email);
    //     const query = { seller_email: email };
    //     const seller = await usersCollection.findOne(query);
    //     res.send({ isverified: seller?.verified === true });
    //   });

    // Admin

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    // payment

    app.post("/create-payment-intent", async (req, res) => {
      const order = req.body;
      const  price = order.parsedPrice;
      console.log(price);
        const amount = price * 100;
        const paymentIntent = await stripe.paymentIntents.create({
          currency: "usd",
          amount: amount,
          payment_method_types: ["card"],
        });
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
    });

    app.post("/payments", async(req, res) => {
        const paymentInfo = req.body;
        const result = await paymentsCollection.insertOne(paymentInfo);
        const id = paymentInfo.booking_id;
        const filter = {_id: ObjectId(id)};
        const updatedDoc = {
            $set: {
                paid: true,
                transactionId: paymentInfo.transactionId
            }
        };
        const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc);
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

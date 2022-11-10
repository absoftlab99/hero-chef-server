const express = require("express");
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken");
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
    res.send('Hero Chef API Running');
})



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.m1mm015.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
        if (!authHeader) {
        return res.status(401).send({ message: "Unauthorize access" });
    }

    const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
        return res.status(403).send({ message: "Forbidden access" });
    }

    req.decoded = decoded;
        next();
    });
}

async function run(){
    try{
        const serviceCollection = client.db('heroChef').collection('services');
        const reviewCollection = client.db('heroChef').collection('reviews');

        app.post("/jwt", (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "1d",
        });
            res.send({ token });
        });
        
        app.get('/services', async(req, res) =>{
            let dataLimit = 9999;
            if (req.query.limit) {
                dataLimit = parseInt(req.query.limit);
            }
            const query = {};
            const cursor = serviceCollection.find(query).limit(dataLimit).sort({ timestamp: -1 });
            const services = await cursor.toArray();
            res.send(services); 
        })
        app.get('/services/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const details = await serviceCollection.findOne(query);
            res.send(details);

        })
        app.post("/addreview", async (req, res) => {
            const review = req.body;
            
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        app.get("/reviews", async (req, res) => {
        let query = {};
        if (req.query.email) {
            query = {
            customarEmail: req.query.email,
            };
        } else if (req.query.productId) {
            query = {
            productId: req.query.productId,
            };
        }
    
        const cursor = reviewCollection.find(query).sort({ reviewTime: -1 });
        const reviews = await cursor.toArray();
        res.send(reviews);
        });

        app.post("/services", async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        });

        app.put("/reviews/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id)
        };
            const review = req.body;
            // const option = { upsert: true };
            const updateReview = {
                $set: {
                    reviewText: review.reviewText,
                    star: review.star,
                },
            };
            const result = await reviewCollection.updateOne(filter, updateReview);
            res.send(result);
        });

        app.delete("/reviews/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)
        };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });

        app.get("/reviews/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)
        };
            const review = await reviewCollection.findOne(query);
            res.send(review);
        });
    }
    finally{

    }
}
run().catch(err => console.error(err));


app.listen(port, () =>{
    console.log(`Api running on port ${port}`);
})
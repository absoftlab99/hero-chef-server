const express = require("express");
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

async function run(){
    try{
        const serviceCollection = client.db('heroChef').collection('services');
        const reviewCollection = client.db('heroChef').collection('reviews');

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
    }
    finally{

    }
}
run().catch(err => console.error(err));


app.listen(port, () =>{
    console.log(`Api running on port ${port}`);
})
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
    }
    finally{

    }
}
run().catch(err => console.error(err));


app.listen(port, () =>{
    console.log(`Api running on port ${port}`);
})
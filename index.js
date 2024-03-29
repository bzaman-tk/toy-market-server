const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000

//MiddleWare
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ukltrw5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('server is running fine')
})

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        //client.connect();
        const toyCollection = client.db('toyDB').collection('toys');
        // Creating index on two fields
        //const indexKeys = { name: 1, categorys: 1 };
        //const indexOptions = { name: "namecat" };
        //const result = await toyCollection.createIndex(indexKeys, indexOptions);
        // console.log(result);
        app.get('/toys', async (req, res) => {
            const result = await toyCollection.find().toArray()
            res.json(result)
        })
        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const result = await toyCollection.find({ _id: new ObjectId(id) }).toArray()
            res.json(result)
        })
        app.get('/my-toys', async (req, res) => {
            const email = req.query.email;
            const result = await toyCollection.find({ email: email }).toArray()
            // console.log(result);
            res.json(result)
        })
        app.get('/all-toys', async (req, res) => {
            const count = await toyCollection.estimatedDocumentCount()
            const toys = await toyCollection.find().limit(20).toArray()
            const result = { count, toys }
            res.json(result)
        })
        app.get('/search/:text', async (req, res) => {
            const searchText = req.params.text;
            const result = await toyCollection.find(
                {
                    $or: [
                        { name: { $regex: searchText, $options: "i" } },
                        //{ categorys: { $regex: searchText, $options: "i" } },
                    ],
                }
            ).toArray()
            // console.log(searchText);
            res.json(result)
        })

        app.post('/addtoy', async (req, res) => {
            const newToy = req.body;
            const result = await toyCollection.insertOne(newToy)
            res.json(result)
        })

        app.patch('/update/:id', async (req, res) => {
            const data = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    price: data.price,
                    quantity: data.quantity,
                    details: data.details
                }
            }
            const result = await toyCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        app.delete('/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const result = await toyCollection.deleteOne({ _id: new ObjectId(id) })
            res.json(result)
        })

        // Send a ping to confirm a successful connection
        //await client.db("admin").command({ ping: 1 });
        //console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})
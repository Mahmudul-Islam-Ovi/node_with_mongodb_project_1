const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config()

const ObjectId = require('mongodb').ObjectId

const app = express();


// middleware 
app.use(cors());
app.use(express.json());


const port = process.env.PORT || 5000


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.imuxo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      await client.connect();
      const database = client.db("bulkData");
      const detailsCollection = database.collection("details");
      // get api 

      app.get('/users',async(req, res) => {
          const cursor = detailsCollection.find({});
          const details = await cursor.toArray();
          res.send(details);
      });
        // oneFind api 
      app.get('/users/:id', async(req, res) => {
          const id = req.params.id;
          const query =  {_id: ObjectId(id)};
          const data = await detailsCollection.findOne(query);
          // console.log('Loading data ',id);
          res.send(data)
      });

       // post api 
        app.post('/users',async(req, res) => {
            const newDetails = req.body;
            const results = await detailsCollection.insertOne(newDetails);
            //   console.log("hitting the post",req.body);
            //   console.log("added details", results);
              res.json(results);
        });

        // update api status
        app.put('/users/:id', async (req, res) => {
          const id = req.params.id;
          const updatedUser = req.body;
          const filter = { _id: ObjectId(id) };
          const options = { upsert: true };
          const updateDoc = {
            $set: {
              country : updatedUser.country,
              division : updatedUser.division,
              city : updatedUser.city,
              area : updatedUser.area,
              status : updatedUser.status
            },
          };

          const results = await detailsCollection.updateOne(filter,updateDoc,options);
        console.log('Connected',updatedUser,id)
         res.json(results);
        });


        // delete api 
        app.delete('/users/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const results = await detailsCollection.deleteOne(query);

            // console.log('delete id ',results);
            res.json(results);
        });

    } finally {
      //await client.close();
    }
  }
  run().catch(console.dir);

   // check 
   app.get('/', async(req, res)=>{
          
        res.send('Server Is on ')
  });


app.listen(port, ()=>{
    console.log('listening on port',port);
})
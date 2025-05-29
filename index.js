const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Career Code API is running successfully!')
})

// pass: 8bXxuSVCEFiJKgUy 8bXxuSVCEFiJKgUy
// user: careerCode



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hzu9wpj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const jobsCollection = client.db('careerCode').collection('jobs');
        const applicationsCollection = client.db('careerCode').collection('applications');

        // jobs api
        app.get('/jobs', async (req, res) => {
            const result = await jobsCollection.find().toArray();
            res.send(result)
        })

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.findOne(query);
            res.send(result)
        })

        // applications api
        app.get('/applications', async (req, res) => {
            const result = await applicationsCollection.find().toArray();
            res.send(result);
        });

        // query applications by job email
        app.get('/application', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            const query = { applicant: email };
            const result = await applicationsCollection.find(query).toArray();

            // bqd way to agregate the results
            for (const application of result) {
                const jobId = application.jobId;
                const jobQuery = { _id: new ObjectId(jobId) }
                const job = await jobsCollection.findOne(jobQuery);
                // console.log(job);
                application.company = job.company;
                application.jobTitle = job.title;
                application.company_logo = job.company_logo;
                application.jobsCollection = job.location
            }
            res.send(result);
        })

        // applications api
        app.post('/applications', async (req, res) => {
            const application = req.body;
            const result = await applicationsCollection.insertOne(application)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');




app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))

app.get('/', (req, res) => {
    res.send('Career Code API is running successfully!')
})





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

        // JWT related API
        // app.post('/jwt', async (req, res) => {
        //     const { email } = req.body;
        //     const user = { email }
        //     const token = jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
        //     res.send({ token })
        // })

        // JWT related api
        app.post('/jwt', async (req, res) => {
            const userData = req.body;
            const token = jwt.sign(userData, process.env.JWT_ACCESS_SECRET, { expiresIn: '1d' })

            // Set the token in the cookies
            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
            })

            res.send({ success: true })
        })


        // job post method
        app.post('/jobs', async (req, res) => {
            const newJob = req.body;
            const result = await jobsCollection.insertOne(newJob);
            res.send(result)
        })

        // jobs api
        app.get('/jobs', async (req, res) => {
            const email = req.query.email;
            const query = {};
            if (email) {
                query.hr_email = email
            }
            const result = await jobsCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/jobs/applications', async (req, res) => {
            const email = req.query.email;
            const query = { hr_email: email };
            const jobs = await jobsCollection.find(query).toArray();

            // should use aggregate to have optimum data fetching
            for (const job of jobs) {
                const applicationQuery = { jobId: job._id.toString() }
                const application_count = await applicationsCollection.countDocuments(applicationQuery);
                job.application_count = application_count
            }
            res.send(jobs)
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

        // get single applications
        app.get('/applications/job/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { jobId: id };
            const result = await applicationsCollection.find(query).toArray()
            res.send(result)
            // console.log(id);
        })


        // patch the data form  single applications
        app.patch('/applications/:id', async (req, res) => {
            const id = req.params.id;
            // const updated = req.body;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    status: req.body.status
                }
            }
            const result = await applicationsCollection.updateOne(filter, updatedDoc);
            res.send(result)
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
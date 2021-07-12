import { URI, EXPRESS_PORT } from './config.js'

const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const app = express();

// Import routes
const programsRoute = require('./routes/programs');
const specialisationsRoute = require('./routes/specialisations')
const coursesRoute = require('./routes/courses');

// Routing
app.use('/programs', programsRoute);
app.use('/specialisations', specialisationsRoute);
app.use('/courses', coursesRoute);


// Start the connection to the mongoDB server
MongoClient.connect(URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(client => {
    // Get the relevant database/s and collections
    const mainDB = client.db('Main');
    const programsCOL = mainDB.collection('Programs');
    const specialisationsCOL = mainDB.collection('Specialisations');
    const coursesCOL = mainDB.collection('Courses');

    // Set to local so they can be accesed by other routes
    app.locals.programsCOL = programsCOL;
    app.locals.specialisationsCOL = specialisationsCOL;
    app.locals.coursesCOL = coursesCOL;

    app.listen(EXPRESS_PORT, () => { console.log("Express Server is listening on", EXPRESS_PORT) });
})



const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan'); 
const express = require('express'); 

const app = express();
const PORT = process.env.PORT || 4000;

const apiRouter = require('./api/api')

// Body-parsing Middleware
app.use(bodyParser.json());

// Error Handler Middleware
app.use(errorhandler());

// CORS Middleware
app.use(cors());

// Morgan Middleware
app.use(morgan('dev'));

app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`listen on port ${PORT}`);
});
  
module.exports = app;

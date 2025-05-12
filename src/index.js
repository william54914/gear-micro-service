const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes/index.js');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 
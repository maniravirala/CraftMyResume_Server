const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoute = require('./routes/authRoute');
const profileRoute = require('./routes/profileRoute');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'https://craftedcareer.netlify.app'],
}));
    

// Routes
app.use('/api/auth', authRoute);
app.use('/api/profile', profileRoute);
app.get('/', (req, res) => {
    res.json({ message: 'Crafted Career API is running' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB Connected');
    }
    )
    .catch(err => {
        console.log(err);
    }
    );

// Global Error Handler
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
});

// Server
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})
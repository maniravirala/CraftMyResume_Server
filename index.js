const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const authRoute = require('./routes/authRoute');
const profileRoute = require('./routes/profileRoute');  
const mailRoute = require('./routes/mailRoute');
const referRoute = require('./routes/referRoute');
const messageRoute = require('./routes/messageRoute');
const resumeRoute = require('./routes/resumeRoute');
const verify = require('./middleware/verify');

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'https://craftedcareer.netlify.app'],
    credentials: true
}));


// Routes
app.use('/api/auth', authRoute);
app.use('/api/profile', profileRoute);
app.use('/api/mail', mailRoute);
app.use('/api/refer', referRoute);
app.use('/api/message', messageRoute);
app.use('/api/resume', resumeRoute);

app.get('/', (req, res) => {
    res.json({ message: 'Resume Studio is working' });
});

// write the route with verify middleware and and other with no middleware
app.get('/verify', verify, (req, res) => {
    res.json({ message: 'Verified' });
}
);

app.get('/no-verify', (req, res) => {
    res.json({ message: 'No Verify' });
}
);

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
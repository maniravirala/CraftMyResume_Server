const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const createError = require('../utils/appError');
const { deductCredit } = require('./creditsController');
const User = require('../models/userModel');


const Links = {
    API: {
        REQUEST_PDF: 'https://api.tailwindstream.io/request',
        RETRY_PDF: 'https://api.tailwindstream.io/request/:requestId/download',
    },
};

exports.generatePdf = async (req, res, next) => {
    const { html } = req.body;
    const { access_token } = req.cookies;

    const newHtml = `<!DOCTYPE html>
    <html lang="en">
    <head>
    <link rel="stylesheet" href="https://use.typekit.net/umf5tls.css">
    </head>
    <body>
    ${html}
    </body>
    </html>`;

    try {
        const decoded = jwt.decode(access_token);
        if (!decoded) {
            return next(new createError(400, 'Invalid token'));
        }

        const user = await User.findById(decoded._id);
        const { email, credits } = user;
        if (credits <= 0) {
            return next(new createError(400, 'Insufficient credits'));
        }
        const response = await requestDownload({ html: newHtml });
        if (response.error) {
            return next(new createError(400, response.error));
        }

        if (response.requestId) {
            if (email) {
                await deductCredit({ email });
            }
            res.send({
                status: 'success',
                downloadUrl: response.downloadUrl
            });
        }
    } catch (error) {
        console.log(error);
        return next(new createError(400, 'Error generating PDF'));
    }
}

exports.sendPdf = async (req, res, next) => {
    const { access_token } = req.cookies;
    const decoded = jwt.decode(access_token);
    if (!decoded) {
        return next(new createError(400, 'Invalid token'));
    }

    const user = await User.findById(decoded._id);
    const { email, name } = user;
    
    const pdfBlob = await fetch(req.body.downloadUrl).then(res => res.body);

    try {
        await sendEmail(email, name, pdfBlob);
        res.send({
            status: 'success',
            message: 'PDF sent successfully to your email',
        });
    }
    catch (error) {
        return next(new createError(400, 'Error sending PDF to email'));
    }
}

async function requestDownload(payload) {
    const response = await fetch(Links.API.REQUEST_PDF, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to request PDF generation');
    }
    return data;
}

async function sendEmail(email, name, pdfBlob) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });


    const message = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Resume PDF from Crafted Career',
        html: `
        <h2>Thank you ${name} for using Crafted Career</h2>
        <p>Here is your resume in PDF format</p>
        `,
        attachments: [
            {
                filename: `${name.split(' ').join('_').toLowerCase()}_resume.pdf`,
                content: pdfBlob,
            },
        ],
    };

    await transporter.sendMail(message);
}
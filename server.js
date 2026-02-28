// server.js
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const nodemailer = require('nodemailer')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

// --------------------
// CORS Configuration
// --------------------
const corsOptions = {
    origin: 'https://mpc-code.fly.dev',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions)) // handle preflight requests

// --------------------
// Body Parser
// --------------------
app.use(bodyParser.json())

// --------------------
// Nodemailer Setup
// --------------------
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

// --------------------
// Contact Route
// --------------------
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, subject, message } = req.body

    // Validate fields
    if (!name || !email || !phone || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required.' })
    }

    // Admin Email
    const adminHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        </div>
    `

    // User Acknowledgement Email
    const userHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Thank You, ${name}!</h2>
            <p>We received your message and will get back to you shortly.</p>
        </div>
    `

    const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: subject,
        html: adminHtml,
    }

    const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank you for contacting us!',
        html: userHtml,
    }

    try {
        // Send Admin Email
        await transporter.sendMail(adminMailOptions)
        console.log('Admin email sent to', process.env.EMAIL_USER)

        // Send User Acknowledgement Email
        await transporter.sendMail(userMailOptions)
        console.log('Acknowledgement email sent to', email)

        res.status(200).json({ success: true, message: 'Emails sent successfully!' })
    } catch (error) {
        console.error('Error sending emails:', error)
        res.status(500).json({ error: 'Failed to send emails. Please try again later.' })
    }
})

// --------------------
// Start Server
// --------------------
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
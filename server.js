// server.js
const express = require('express')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
require('dotenv').config()
const path = require('path')

const app = express()
const PORT = process.env.PORT || 5000

// Body parser for JSON
app.use(bodyParser.json())

// Serve frontend static files from root
app.use(express.static(__dirname))

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password if Gmail 2FA
    },
})

// Contact API
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, subject, message } = req.body

    if (!name || !email || !phone || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required.' })
    }

    // Email templates
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

    const userHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Thank You, ${name}!</h2>
            <p>We received your message and will get back to you shortly.</p>
        </div>
    `

    try {
        // Send admin email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject,
            html: adminHtml,
        })

        // Send acknowledgement to user
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for contacting us!',
            html: userHtml,
        })

        res.status(200).json({ success: true, message: 'Emails sent successfully!' })
    } catch (err) {
        console.error('Error sending emails:', err)
        res.status(500).json({ error: 'Failed to send emails. Please try again later.' })
    }
})

// Catch-all to serve index.html for any other frontend routes
app.use('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
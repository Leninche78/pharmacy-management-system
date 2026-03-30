const nodemailer = require('nodemailer');

// In a real production app, use OAuth2 or a transactional service (SendGrid/AWS SES)
// Using an Ethereal fake SMTP service for demonstration purposes so we don't spam real emails
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'medimanage.pharmacy@ethereal.email', // Replace with real Ethereal account if testing delivery
        pass: 'fake_password' // Replace with real Ethereal password
    }
});

const sendPrescriptionEmail = async (customerEmail, customerName, doctorName) => {
    if (!customerEmail) return;
    
    try {
        const info = await transporter.sendMail({
            from: '"MediManage Pharmacy" <no-reply@medimanage.com>',
            to: customerEmail,
            subject: "New Prescription Logged - MediManage",
            text: `Hello ${customerName},\n\nA new prescription from Dr. ${doctorName} has been successfully logged to your profile at MediManage Pharmacy.\n\nThank you for choosing us!`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; text-align: center;">
                <h2 style="color: #059669;">MediManage Pharmacy</h2>
                <p>Hello <b>${customerName}</b>,</p>
                <p>A new prescription from <b>Dr. ${doctorName}</b> has been successfully logged to your profile.</p>
                <p>Log in or visit us in-store to fulfill your medication requirements.</p>
                <br/>
                <p style="color: #64748b; font-size: 12px;">This is an automated notification. Please do not reply.</p>
              </div>
            `,
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = {
    sendPrescriptionEmail
};

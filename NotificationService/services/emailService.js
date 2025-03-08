const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send a booking confirmation email
 * @param {Object} notification - The notification object
 * @returns {Promise} - Resolves with the email info or rejects with an error
 */
const sendBookingConfirmationEmail = async (notification) => {
  // In a real application, we would send an actual email
  // For this demo, we'll just log the email details
  
  console.log(`
    ✉️ SENDING EMAIL NOTIFICATION
    ----------------------------------
    To: ${notification.user_email}
    Subject: Your Booking Confirmation #${notification.booking_id}
    
    Dear Customer,
    
    Your booking for ${notification.event_name} has been confirmed.
    
    Booking Details:
    - Booking ID: ${notification.booking_id}
    - Event: ${notification.event_name}
    - Tickets: ${notification.tickets}
    - Total Price: $${notification.total_price.toFixed(2)}
    
    Thank you for your booking!
    
    Best regards,
    The Event Booking Team
  `);
  
  // For demo purposes, we'll simulate sending an email
  // In a production environment, uncomment the code below
  
  /*
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: notification.user_email,
    subject: `Your Booking Confirmation #${notification.booking_id}`,
    html: `
      <h1>Booking Confirmation</h1>
      <p>Dear Customer,</p>
      <p>Your booking for <strong>${notification.event_name}</strong> has been confirmed.</p>
      <h2>Booking Details:</h2>
      <ul>
        <li><strong>Booking ID:</strong> ${notification.booking_id}</li>
        <li><strong>Event:</strong> ${notification.event_name}</li>
        <li><strong>Tickets:</strong> ${notification.tickets}</li>
        <li><strong>Total Price:</strong> $${notification.total_price.toFixed(2)}</li>
      </ul>
      <p>Thank you for your booking!</p>
      <p>Best regards,<br>The Event Booking Team</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
  */
  
  // Return a resolved promise for demo purposes
  return Promise.resolve({
    messageId: `demo-${Date.now()}`,
    response: 'Dummy email sent successfully'
  });
};

/**
 * Send a booking cancellation email
 * @param {Object} notification - The notification object
 * @returns {Promise} - Resolves with the email info or rejects with an error
 */
const sendBookingCancellationEmail = async (notification) => {
  console.log(`
    ✉️ SENDING EMAIL NOTIFICATION
    ----------------------------------
    To: ${notification.user_email}
    Subject: Your Booking Cancellation #${notification.booking_id}
    
    Dear Customer,
    
    Your booking for ${notification.event_name} has been cancelled.
    
    Booking Details:
    - Booking ID: ${notification.booking_id}
    - Event: ${notification.event_name}
    - Tickets: ${notification.tickets}
    - Total Price: $${notification.total_price.toFixed(2)}
    
    If you did not request this cancellation, please contact our support team.
    
    Best regards,
    The Event Booking Team
  `);
  
  // Return a resolved promise for demo purposes
  return Promise.resolve({
    messageId: `demo-${Date.now()}`,
    response: 'Dummy cancellation email sent successfully'
  });
};

module.exports = {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail
}; 
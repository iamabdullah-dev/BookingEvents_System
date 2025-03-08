/**
 * Send a booking confirmation SMS
 * @param {Object} notification - The notification object
 * @returns {Promise} - Resolves with the SMS info or rejects with an error
 */
const sendBookingConfirmationSMS = async (notification) => {
  // In a real application, we would integrate with an SMS provider like Twilio
  // For this demo, we'll just log the SMS details
  
  console.log(`
    📱 SENDING SMS NOTIFICATION
    ----------------------------------
    To: User ID ${notification.user_id}
    
    Your booking #${notification.booking_id} for ${notification.event_name} has been confirmed.
    Tickets: ${notification.tickets}, Total: $${notification.total_price.toFixed(2)}
  `);
  
  // Return a resolved promise for demo purposes
  return Promise.resolve({
    messageId: `sms-demo-${Date.now()}`,
    response: 'Dummy SMS sent successfully'
  });
};

/**
 * Send a booking cancellation SMS
 * @param {Object} notification - The notification object
 * @returns {Promise} - Resolves with the SMS info or rejects with an error
 */
const sendBookingCancellationSMS = async (notification) => {
  console.log(`
    📱 SENDING SMS NOTIFICATION
    ----------------------------------
    To: User ID ${notification.user_id}
    
    Your booking #${notification.booking_id} for ${notification.event_name} has been cancelled.
    If you did not request this cancellation, please contact our support team.
  `);
  
  // Return a resolved promise for demo purposes
  return Promise.resolve({
    messageId: `sms-demo-${Date.now()}`,
    response: 'Dummy cancellation SMS sent successfully'
  });
};

module.exports = {
  sendBookingConfirmationSMS,
  sendBookingCancellationSMS
}; 
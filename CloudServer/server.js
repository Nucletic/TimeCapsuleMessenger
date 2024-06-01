const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const essentials = require('./essentials');
const admin = require('./firebaseAdminSDK');
const cron = require('node-cron');

require('dotenv-safe').config();

const { SECRET_KEY } = process.env;
const AUTH = admin.auth();
const DB = admin.firestore();
const STORAGE = admin.storage();

const app = express();

const PORT = process.env.PORT || 6000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());


cron.schedule('* * * * *', async () => {
  try {
    // Query Firestore for scheduled messages
    const currentTime = new Date();
    const currentDate = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}`;

    // Query Firestore for scheduled messages with the current date and time
    const scheduledMessagesSnapshot = await DB.collection('scheduledMessages')
      .where('time.date', '==', currentDate)
      .where('time.meridian', '==', currentTime.getHours() < 12 ? 'AM' : 'PM') // Assuming 'AM' or 'PM' based on current hour
      .where('time.time', '==', `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`)
      .get();

    scheduledMessagesSnapshot.forEach(async (doc) => {
      const messageData = doc.data();
      const { recipient, message, notification } = messageData;

      // Send the message to the recipient
      // Example: sendNotification(recipient, message);

      // Send notification to the recipient
      // Example: sendNotification(recipient, notification);

      // Delete the scheduled message from Firestore
      await doc.ref.delete();
    });
  } catch (error) {
    console.error('Error checking scheduled messages:', error);
  }
});





app.listen(PORT, () => {
  console.log('Server is listening on Port:', PORT);
});
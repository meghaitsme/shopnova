const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
require('dotenv').config();

// Set up a way to read input from the terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // 1. Ask for the email
    rl.question('Enter the email of the existing user: ', async (email) => {
      
      // 2. Ask for the new password
      rl.question('Enter the new password: ', async (newPassword) => {
        
        try {
          // Load the user model
          const User = require('./backend/dist/models/User.model').default || require('./backend/dist/models/User.model');
          
          // Hash the new password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(newPassword, salt);

          // Update the user
          const result = await User.updateOne(
            { email: email },
            { $set: { password: hashedPassword } }
          );

          if (result.modifiedCount === 1) {
            console.log(`\n✅ Success! Password for ${email} has been updated.`);
          } else {
            console.log(`\n❌ Failed. User with email "${email}" was not found.`);
          }
        } catch (err) {
          console.error("\n❌ Error updating user:", err.message);
        } finally {
          rl.close();
          mongoose.disconnect();
        }
      });
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    rl.close();
  }
};

run();
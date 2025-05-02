const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const { User } = require('./models');

const uri = process.env.CONNECTION_URI;

async function hashExistingPasswords() {
  if (!uri) {
    console.error('Error: CONNECTION_URI environment variable not set.');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users.`);
    for (const user of users) {
      console.log('Retrieved user:', user); // Log the entire user object
      if (user.username) {
        try {
          const hashedPassword = bcryptjs.hashSync(user.password, 10);
          user.password = hashedPassword;
          await user.save();
          console.log(`Hashed password for user: ${user.username}`);
        } catch (saveError) {
          console.error(`Error saving user ${user.username}:`, saveError);
        }
      } else {
        console.warn('Warning: User found without username. Skipping.');
      }
    }

    console.log('Password hashing complete.');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    mongoose.disconnect();
  }
}

hashExistingPasswords();
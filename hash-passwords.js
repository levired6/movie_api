const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const { User } = require('./models'); 

//MongoDB Atlas connection string for the 'test' database
const uri = 'CONNECTION_URI';

async function hashExistingPasswords() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
      if (!user.password.startsWith('$2a$')) { // Check if password is not already a bcrypt hash
        const hashedPassword = bcryptjs.hashSync(user.password, 10);
        user.password = hashedPassword;
        await user.save();
        console.log(`Hashed password for user: ${user.username}`);
      } else {
        console.log(`Password for user ${user.username} is already hashed.`);
      }
    }

    console.log('Password hashing complete.');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error hashing passwords:', error);
    mongoose.disconnect();
  }
}

hashExistingPasswords();
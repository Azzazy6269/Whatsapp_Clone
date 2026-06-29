const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Chat = require('../models/Chat');

dotenv.config();

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI is not defined in your .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    await User.deleteMany();
    await Chat.deleteMany();
    console.log('Existing Users and Chats cleared successfully.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      { name: 'Ahmed Ali', email: 'ahmed@example.com', password: hashedPassword, avatar: 'https://placehold.co/150?text=Ahmed' },
      { name: 'Mohamed Amr', email: 'mohamed@example.com', password: hashedPassword, avatar: 'https://placehold.co/150?text=Mohamed' },
      { name: 'Sara Hassan', email: 'sara@example.com', password: hashedPassword, avatar: 'https://placehold.co/150?text=Sara' },
      { name: 'Mona Mahmoud', email: 'mona@example.com', password: hashedPassword, avatar: 'https://placehold.co/150?text=Mona' }
    ]);
    console.log('4 Mock users created successfully.');

    const ahmed = users[0];
    const mohamed = users[1];
    const sara = users[2];
    const mona = users[3];

    const individualChat = await Chat.create({
      chatName: 'sender',
      isGroupChat: false,
      users: [ahmed._id, mohamed._id],
    });
    console.log('Individual chat between Ahmed and Mohamed created.');

    const groupChat = await Chat.create({
      chatName: 'WhatsApp Clone Developers 🚀',
      isGroupChat: true,
      users: [ahmed._id, mohamed._id, sara._id],
      groupAdmin: ahmed._id,
    });
    console.log('Group chat "WhatsApp Clone Developers" created.');

    console.log('\n Data Seeding Completed Successfully! Enjoy testing your API.');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();

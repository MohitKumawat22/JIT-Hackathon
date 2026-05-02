const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/medconnect';

const patientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  blood: { type: String, required: true },
});

const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to local MongoDB');

    // Check if test user exists
    const existing = await Patient.findOne({ username: 'testuser' });
    if (existing) {
      console.log('Test user already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const testPatient = new Patient({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
      phone: '1234567890',
      age: 30,
      blood: 'O+',
    });

    await testPatient.save();
    console.log('Test patient created successfully!');
    console.log('Username: testuser');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

seed();

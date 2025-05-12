const { User } = require('../models');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

async function seedUsers() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected to database successfully');

    console.log('Seeding initial admin user...');
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('isgay', saltRounds);
    
    // Create admin user
    const [user, created] = await User.findOrCreate({
      where: { username: 'will' },
      defaults: {
        username: 'will',
        password_hash: passwordHash,
        first_name: 'Will',
        last_name: 'Larson',
        date_of_birth: new Date('1987-08-17'),
        email: 'will@example.com', // You'll need to update this with the actual email
        is_active: true,
        role: 'admin'
      }
    });
    
    if (created) {
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists, updating details...');
      
      // Update existing user
      user.password_hash = passwordHash;
      user.first_name = 'Will';
      user.last_name = 'Larson';
      user.date_of_birth = new Date('1987-08-17');
      user.role = 'admin';
      
      await user.save();
      console.log('Admin user updated successfully');
    }
    
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedUsers(); 
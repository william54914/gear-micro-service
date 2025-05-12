const express = require('express');
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    // const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // const user = await prisma.user.findUnique({
    //   where: { id: parseInt(id) }
    // });
    
    // if (!user) {
    //   return res.status(404).json({ error: 'User not found' });
    // }
    
    res.json(id);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const partsUnlimitedService = require('../services/ftp/ftp.partsunlimited.service');
const helmethouseService = require('../services/ftp/ftp.helmethouse.service');

router.get('/partsunlimited', async (req, res) => {
  try {
    const files = await partsUnlimitedService.listFiles('/partsunlimited');
    res.json(files);
  } catch (error) {
    console.error('Error listing FTP files:', error);
    res.status(500).json({ error: 'Failed to list FTP files' });
  }
});

router.get('/helmethouse', async (req, res) => {
  try {
    const files = await helmethouseService.listFiles();
    res.json(files);
  } catch (error) {
    console.error('Error listing FTP files:', error);
    res.status(500).json({ error: 'Failed to list FTP files' });
  }
});


module.exports = router;

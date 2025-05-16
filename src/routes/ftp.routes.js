const express = require('express');
const router = express.Router();
const partsUnlimitedService = require('../services/ftp/ftp.partsunlimited.service');
const helmethouseService = require('../services/ftp/ftp.helmethouse.service');
const vendorService = require('../services/ftp/ftp.vendor.service');
const ls2Service = require('../services/ftp/ftp.ls2.service');

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

// Routes for the vendor data import
router.get('/vendor/files', async (req, res) => {
  try {
    const files = await vendorService.listFiles();
    res.json(files);
  } catch (error) {
    console.error('Error listing vendor FTP files:', error);
    res.status(500).json({ error: 'Failed to list vendor FTP files', message: error.message });
  }
});

router.post('/vendor/import/file/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const result = await vendorService.importFile(filename);
    res.json({ success: true, filename, result });
  } catch (error) {
    console.error(`Error importing vendor file ${req.params.filename}:`, error);
    res.status(500).json({ error: 'Failed to import vendor file', message: error.message });
  }
});

router.post('/vendor/import/all', async (req, res) => {
  try {
    const result = await vendorService.importAllFiles();
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error importing all vendor files:', error);
    res.status(500).json({ error: 'Failed to import vendor files', message: error.message });
  }
});

// LS2-specific routes
router.get('/ls2/files', async (req, res) => {
  try {
    const files = await ls2Service.listFiles();
    res.json(files);
  } catch (error) {
    console.error('Error listing LS2 FTP files:', error);
    res.status(500).json({ error: 'Failed to list LS2 FTP files', message: error.message });
  }
});

router.get('/ls2/latest', async (req, res) => {
  try {
    const latestFile = await ls2Service.getLatestPriceFile();
    if (!latestFile) {
      return res.status(404).json({ error: 'No price files found on LS2 FTP server' });
    }
    res.json({ success: true, file: latestFile });
  } catch (error) {
    console.error('Error getting latest LS2 file:', error);
    res.status(500).json({ error: 'Failed to get latest LS2 file', message: error.message });
  }
});

router.post('/ls2/import/file/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const result = await ls2Service.importFile(filename);
    res.json({ success: true, filename, result });
  } catch (error) {
    console.error(`Error importing LS2 file ${req.params.filename}:`, error);
    res.status(500).json({ error: 'Failed to import LS2 file', message: error.message });
  }
});

router.post('/ls2/import/latest', async (req, res) => {
  try {
    const latestFile = await ls2Service.getLatestPriceFile();
    if (!latestFile) {
      return res.status(404).json({ error: 'No price files found on LS2 FTP server' });
    }
    
    const result = await ls2Service.importFile(latestFile.name);
    res.json({ 
      success: true, 
      file: latestFile,
      result
    });
  } catch (error) {
    console.error('Error importing latest LS2 file:', error);
    res.status(500).json({ error: 'Failed to import latest LS2 file', message: error.message });
  }
});

router.post('/ls2/import/all', async (req, res) => {
  try {
    const result = await ls2Service.importAllFiles();
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error importing all LS2 files:', error);
    res.status(500).json({ error: 'Failed to import LS2 files', message: error.message });
  }
});

module.exports = router;

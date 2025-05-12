const express = require('express');
const OneDriveClient = require('../services/onedrive.service');
const router = express.Router();

router.get('/folders', async (req, res) => {
  try {
    const client = new OneDriveClient();
    const folders = await client.listRootFolders();
    console.log('Root folder contents:', folders);

    for (const folder of folders) {
      // Get File in Folder
      const files = await client.listFilesInFolder(folder.id);
      console.log('Files in folder:', files);

      for (const file of files) {
        // Check modified date and compare to variable
        const modifiedDate = new Date(file.modifiedDateTime);
        const compareDate = new Date(process.env.COMPARE_DATE);
        if (modifiedDate > compareDate) {
          // Get File Content and save to variable
          const fileContent = await client.getFileContent(file.id);
          console.log('File content:', fileContent);
          const row = await User.create({
            name: file.name,
            content: fileContent,
            modifiedDate: modifiedDate,
            compareDate: compareDate
          });
        }
      }
    }

    res.status(200).json(folders);
  } catch (error) {
    console.error('Error:', error.message);
  }
})

module.exports = router; 
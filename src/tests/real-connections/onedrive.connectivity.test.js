const OneDriveService = require('../../services/onedrive.service');

describe('OneDrive Connectivity Test', () => {
  let oneDrive;

  beforeAll(() => {
    oneDrive = new OneDriveService();
  });

  it('should list root folders', async () => {
    const folders = await oneDrive.listRootFolders();
    console.log('Root folders:', folders);
    expect(folders).toBeDefined();
  });

  it('should find Inventory Management folder', async () => {
    const folder = await oneDrive.findFolderByPath('Inventory Management');
    console.log('Found Inventory Management folder:', folder);
    expect(folder).toBeDefined();
    expect(folder.id).toBeDefined();
  });

  it('should find Restock Products folder', async () => {
    const folder = await oneDrive.findFolderByPath('Inventory Management/Restock Products');
    console.log('Found Restock Products folder:', folder);
    expect(folder).toBeDefined();
    expect(folder.id).toBeDefined();
  });

  it('should find and read restock_products.csv', async () => {
    const folder = await oneDrive.findFolderByPath('Inventory Management/Restock Products');
    const file = await oneDrive.findFileInFolder(folder.id, 'restock_products.csv');
    console.log('Found file:', file);
    expect(file).toBeDefined();
    expect(file.id).toBeDefined();

    const content = await oneDrive.getFileContent(file.id);
    console.log('File content preview:', content.substring(0, 500));
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
  });
}); 
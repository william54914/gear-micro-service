const OneDriveService = require('../../../services/onedrive.service');

describe('OneDriveService', () => {
  let service;

  beforeEach(() => {
    service = new OneDriveService();
  });

  it('should instantiate with correct config', () => {
    expect(service.userEmail).toBeDefined();
    expect(service.token).toBeDefined();
  });

  it('should mock getToken', async () => {
    const token = await service.getToken();
    expect(token).toBe('mock-access-token');
  });

  it('should list root folders', async () => {
    const folders = await service.listRootFolders();
    expect(Array.isArray(folders)).toBe(true);
    expect(folders[0]).toHaveProperty('name');
  });

  it('should list files in folder', async () => {
    const files = await service.listFilesInFolder('folder-1');
    expect(Array.isArray(files)).toBe(true);
    expect(files[0]).toHaveProperty('name');
  });

  it('should get file content', async () => {
    const content = await service.getFileContent('file-1');
    expect(typeof content).toBe('string');
  });

  it('should handle findFileByName', async () => {
    const file = await service.findFileByName('Inventory Management', 'test.csv');
    expect(file).toHaveProperty('name', 'test.csv');
  });

  it('should handle findFileByPath', async () => {
    const file = await service.findFileByPath('Inventory Management', 'test.csv');
    expect(file).toHaveProperty('name', 'test.csv');
  });

  // Real connection test (skipped by default)
  (process.env.TEST_ONEDRIVE_REAL === '1' ? it : it.skip)('should connect to real OneDrive and list root folders', async () => {
    const realService = new (require('../../../services/onedrive.service'))();
    const folders = await realService.listRootFolders();
    console.log('Real OneDrive root folders:', folders);
    expect(Array.isArray(folders)).toBe(true);
  });
}); 
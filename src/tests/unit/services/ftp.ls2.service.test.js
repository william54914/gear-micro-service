const service = require('../../../services/ftp/ftp.ls2.service');

describe('LS2FtpService', () => {
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list files', async () => {
    const files = await service.listFiles();
    expect(Array.isArray(files)).toBe(true);
  });

  it('should get latest price file', async () => {
    const file = await service.getLatestPriceFile();
    // In the mock, this may be null or a file object
    expect(file === null || file.hasOwnProperty('name')).toBe(true);
  });

  it('should get all price files', async () => {
    const files = await service.getAllPriceFiles();
    expect(Array.isArray(files)).toBe(true);
  });

  it('should handle importAllFiles', async () => {
    const result = await service.importAllFiles();
    expect(result).toHaveProperty('processed');
  });
}); 
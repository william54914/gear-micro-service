const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const testDir = path.join(__dirname);
const testFiles = fs.readdirSync(testDir)
  .filter(f => f.endsWith('.test.js'));

let allPassed = true;
let serverProcess = null;

function isServerRunning(port = 3000) {
  // Try to connect to the server port
  return new Promise(resolve => {
    const net = require('net');
    const client = net.createConnection({ port }, () => {
      client.end();
      resolve(true);
    });
    client.on('error', () => resolve(false));
  });
}

async function startServerIfNeeded() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const running = await isServerRunning(port);
  if (running) {
    console.log(`Server already running on port ${port}`);
    return null;
  }
  console.log('Starting server...');
  const proc = spawn('node', ['src/index.js'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'production' }
  });
  // Wait for server to be ready
  await new Promise(res => setTimeout(res, 5000));
  return proc;
}

(async () => {
  serverProcess = await startServerIfNeeded();

  console.log('Running real connectivity tests...\n');

  testFiles.forEach(file => {
    const filePath = path.join(testDir, file);
    process.stdout.write(`Running ${file} ... `);
    try {
      execSync(`npx cross-env NODE_ENV=production FORCE_LS2_REAL=1 FORCE_ONEDRIVE_REAL=1 FORCE_AMAZON_REAL=1 jest --runTestsByPath "${filePath}" --runInBand --silent`, { stdio: 'inherit' });
      console.log(`✅ PASS: ${file}`);
    } catch (err) {
      allPassed = false;
      console.log(`❌ FAIL: ${file}`);
    }
  });

  if (serverProcess) {
    console.log('Killing server...');
    serverProcess.kill();
  }

  console.log('\nSummary:');
  if (allPassed) {
    console.log('✅ All real connectivity tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some real connectivity tests failed.');
    process.exit(1);
  }
})(); 
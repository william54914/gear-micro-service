const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Run a command and return its output as a promise
 * @param {string} command - Command to run
 * @returns {Promise<{success: boolean, output: string, error: string}>} - Command result
 */
function runCommand(command) {
  return new Promise((resolve) => {
    console.log(`\n${'-'.repeat(80)}`);
    console.log(`Running: ${command}`);
    console.log(`${'-'.repeat(80)}\n`);
    
    const startTime = Date.now();
    
    // Use exec instead of spawn for better compatibility with Git Bash
    const child = exec(command, { 
      maxBuffer: 10 * 1024 * 1024, // 10 MB buffer
      shell: true
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
    });
    
    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });
    
    child.on('close', (code) => {
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`\n${'-'.repeat(80)}`);
      console.log(`Command completed in ${duration}s with code ${code}`);
      console.log(`${'-'.repeat(80)}\n`);
      
      resolve({
        success: code === 0,
        output: stdout,
        error: stderr,
        duration
      });
    });
  });
}

/**
 * Run all tests in the project
 */
async function runAllTests() {
  try {
    // Create results directory if it doesn't exist
    const resultsDir = path.join(__dirname, '../../test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    console.log('\n=== RUNNING ALL TESTS ===\n');
    console.log('Working directory:', process.cwd());
    
    const results = [];
    
    // Check if Jest is installed and working
    console.log('\n=== CHECKING JEST INSTALLATION ===');
    try {
      await runCommand('npx jest --version');
      console.log('Jest is properly installed');
    } catch (error) {
      console.log('Installing Jest...');
      await runCommand('npm install -D jest');
    }
    
    // 0. Run test:clean to clear cache
    console.log('\n=== CLEARING TEST CACHE ===');
    await runCommand('npx jest --clearCache');
    
    // 1. Run unit tests
    console.log('\n=== RUNNING UNIT TESTS ===');
    const unitResults = await runCommand('npx cross-env NODE_ENV=test jest --config src/tests/jest.unit.config.js --no-watchman --detectOpenHandles');
    results.push({
      type: 'Unit Tests',
      ...unitResults
    });
    
    // 2. Run integration tests
    console.log('\n=== RUNNING INTEGRATION TESTS ===');
    const integrationResults = await runCommand('npx cross-env NODE_ENV=test jest --config src/tests/jest.integration.config.js --no-watchman --detectOpenHandles');
    results.push({
      type: 'Integration Tests',
      ...integrationResults
    });
    
    // 3. Run e2e tests
    console.log('\n=== RUNNING E2E TESTS ===');
    const e2eResults = await runCommand('npx cross-env NODE_ENV=test jest --config src/tests/jest.e2e.config.js --no-watchman --detectOpenHandles');
    results.push({
      type: 'E2E Tests',
      ...e2eResults
    });
    
    // 4. Run performance tests if they exist
    console.log('\n=== RUNNING PERFORMANCE TESTS ===');
    if (fs.existsSync(path.join(process.cwd(), 'src', 'tests', 'performance', 'run.js'))) {
      const performanceResults = await runCommand('npx cross-env NODE_ENV=test jest --config src/tests/jest.performance.config.js --no-watchman --detectOpenHandles');
      results.push({
        type: 'Performance Tests',
        ...performanceResults
      });
    } else {
      console.log('Performance tests not found, skipping');
    }
    
    // 5. Run coverage test
    console.log('\n=== RUNNING COVERAGE TESTS ===');
    const coverageResults = await runCommand('npx cross-env NODE_ENV=test jest --coverage --no-watchman --detectOpenHandles');
    results.push({
      type: 'Coverage Tests',
      ...coverageResults
    });
    
    // Generate report
    console.log('\n=== TEST SUMMARY ===');
    let allPassed = true;
    
    results.forEach((result) => {
      const status = result.success ? '✅ PASSED' : '❌ FAILED';
      allPassed = allPassed && result.success;
      
      console.log(`${status} - ${result.type} (${result.duration}s)`);
    });
    
    const overallStatus = allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED';
    console.log(`\n${overallStatus}`);
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportPath = path.join(resultsDir, `test-report-${timestamp}.json`);
    
    fs.writeFileSync(
      reportPath,
      JSON.stringify({ timestamp, results, overallStatus: allPassed ? 'PASSED' : 'FAILED' }, null, 2)
    );
    
    console.log(`\nTest report saved to: ${reportPath}`);
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests(); 
#!/usr/bin/env node

/**
 * Comprehensive Calculator Test Runner
 * Executes all calculator tests with detailed reporting and analysis
 * Priority: CRITICAL - Ensures all calculators are production-ready
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Test categories and their priorities
  const testCategories = {
    'CRITICAL': {
      priority: 1,
      tests: [
        'comprehensive-test-runner.test.ts',
        'advanced-mathematical-verification.test.ts',
        'error-handling-edge-cases.test.ts',
        'all-calculators-inventory.test.ts',
        'auto-generated-calculator-tests.test.ts',
      ],
      description: 'Critical system validation and mathematical accuracy'
    },
  'HIGH_PRIORITY': {
    priority: 2,
    tests: [
      'loan.test.ts',
      'investment.test.ts',
      'mortgage.test.ts',
      'sip.test.ts',
      'income-tax.test.ts',
    ],
    description: 'High-priority financial calculators'
  },
    'MEDIUM_PRIORITY': {
      priority: 3,
      tests: [
        'gst.test.ts',
        'salary.test.ts',
        'ppf.test.ts',
        'fd.test.ts',
        'rd.test.ts',
        'epf.test.ts',
        'lumpsum.test.ts',
        'hra.test.ts',
        'break-even-calculator.test.ts',
        'compound-interest-calculator.test.ts',
      ],
      description: 'Medium-priority savings and tax calculators'
    },
  'LOW_PRIORITY': {
    priority: 4,
    tests: [
      'dividend-yield.test.ts',
      'gold.test.ts',
      'capital-gains.test.ts',
    ],
    description: 'Low-priority specialized calculators'
  },
  'UTILITIES': {
    priority: 5,
    tests: [
      'savings-utilities.test.ts',
      'test-runner-verification.test.ts',
    ],
    description: 'Utility functions and test infrastructure'
  }
};

// Test execution configuration
const testConfig = {
  timeout: 30000, // 30 seconds per test file
  maxConcurrency: 4, // Maximum parallel test executions
  retryAttempts: 2, // Number of retry attempts for failed tests
  coverageThreshold: 90, // Minimum coverage percentage
  performanceThreshold: 5000, // Maximum execution time in ms
};

class ComprehensiveTestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      categories: {},
      performance: {},
      coverage: {},
      errors: [],
    };
    this.startTime = Date.now();
  }

  // Print colored console output
  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  // Print test header
  printHeader() {
    this.log('\\n' + '='.repeat(80), 'cyan');
    this.log('🧮 COMPREHENSIVE CALCULATOR TEST SUITE', 'bright');
    this.log('Production-Grade Testing for WealthWise Hub', 'cyan');
    this.log('='.repeat(80), 'cyan');
    this.log(`Started at: ${new Date().toLocaleString()}`, 'white');
    this.log('');
  }

  // Print test category header
  printCategoryHeader(categoryName, category) {
    this.log(`\\n${'─'.repeat(60)}`, 'blue');
    this.log(`📊 ${categoryName} (Priority ${category.priority})`, 'bright');
    this.log(`${category.description}`, 'blue');
    this.log(`Tests: ${category.tests.length}`, 'blue');
    this.log('─'.repeat(60), 'blue');
  }

  // Execute a single test file
  async executeTest(testFile, category) {
    const testPath = path.join('test/calculations', testFile);
    const testName = testFile.replace('.test.ts', '');
    
    this.log(`  🔄 Running ${testName}...`, 'yellow');
    
    const startTime = Date.now();
    
    try {
      // Check if test file exists
      if (!fs.existsSync(testPath)) {
        throw new Error(`Test file not found: ${testPath}`);
      }

      // Execute the test with Jest
      const command = `npx jest ${testPath} --verbose --detectOpenHandles --forceExit --maxWorkers=1`;
      const output = execSync(command, { 
        encoding: 'utf8', 
        timeout: testConfig.timeout,
        stdio: 'pipe'
      });

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Parse Jest output for test results
      const testResults = this.parseJestOutput(output);
      
      this.results.total += testResults.total;
      this.results.passed += testResults.passed;
      this.results.failed += testResults.failed;
      this.results.skipped += testResults.skipped;

      // Store category results
      if (!this.results.categories[category]) {
        this.results.categories[category] = { passed: 0, failed: 0, total: 0 };
      }
      this.results.categories[category].total += testResults.total;
      this.results.categories[category].passed += testResults.passed;
      this.results.categories[category].failed += testResults.failed;

      // Store performance data
      this.results.performance[testName] = executionTime;

      if (testResults.failed === 0) {
        this.log(`  ✅ ${testName} - ${testResults.passed}/${testResults.total} tests passed (${executionTime}ms)`, 'green');
      } else {
        this.log(`  ❌ ${testName} - ${testResults.failed}/${testResults.total} tests failed (${executionTime}ms)`, 'red');
        this.results.errors.push({
          test: testName,
          category,
          failures: testResults.failed,
          output: output.substring(0, 500) // Truncate long output
        });
      }

      return { success: testResults.failed === 0, results: testResults, executionTime };

    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.log(`  💥 ${testName} - EXECUTION FAILED (${executionTime}ms)`, 'red');
      this.log(`     Error: ${error.message}`, 'red');

      this.results.failed++;
      this.results.total++;
      this.results.errors.push({
        test: testName,
        category,
        error: error.message,
        executionTime
      });

      return { success: false, error: error.message, executionTime };
    }
  }

  // Parse Jest output to extract test results
  parseJestOutput(output) {
    const results = { total: 0, passed: 0, failed: 0, skipped: 0 };
    
    // Look for Jest summary line
    const summaryMatch = output.match(/Tests:\\s+(\\d+)\\s+failed,\\s+(\\d+)\\s+passed,\\s+(\\d+)\\s+total/);
    if (summaryMatch) {
      results.failed = parseInt(summaryMatch[1]);
      results.passed = parseInt(summaryMatch[2]);
      results.total = parseInt(summaryMatch[3]);
      return results;
    }

    // Alternative parsing for different Jest output formats
    const passedMatch = output.match(/(\\d+)\\s+passed/);
    const failedMatch = output.match(/(\\d+)\\s+failed/);
    const totalMatch = output.match(/(\\d+)\\s+total/);

    if (passedMatch) results.passed = parseInt(passedMatch[1]);
    if (failedMatch) results.failed = parseInt(failedMatch[1]);
    if (totalMatch) results.total = parseInt(totalMatch[1]);

    // If no explicit total, calculate from passed + failed
    if (results.total === 0) {
      results.total = results.passed + results.failed;
    }

    return results;
  }

  // Execute all tests in a category
  async executeCategory(categoryName, category) {
    this.printCategoryHeader(categoryName, category);
    
    const categoryResults = [];
    
    for (const testFile of category.tests) {
      const result = await this.executeTest(testFile, categoryName);
      categoryResults.push(result);
      
      // Add small delay between tests to prevent resource conflicts
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Calculate category summary
    const categoryPassed = categoryResults.filter(r => r.success).length;
    const categoryTotal = categoryResults.length;
    const categoryFailed = categoryTotal - categoryPassed;

    this.log(`\\n📈 ${categoryName} Summary: ${categoryPassed}/${categoryTotal} test files passed`, 
      categoryFailed === 0 ? 'green' : 'yellow');

    return categoryResults;
  }

  // Generate comprehensive test report
  generateReport() {
    const endTime = Date.now();
    const totalExecutionTime = endTime - this.startTime;

    this.log('\\n' + '='.repeat(80), 'cyan');
    this.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY', 'bright');
    this.log('='.repeat(80), 'cyan');

    // Overall results
    this.log(`\\n🎯 Overall Results:`, 'bright');
    this.log(`   Total Tests: ${this.results.total}`, 'white');
    this.log(`   Passed: ${this.results.passed}`, 'green');
    this.log(`   Failed: ${this.results.failed}`, this.results.failed > 0 ? 'red' : 'green');
    this.log(`   Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`, 
      this.results.failed === 0 ? 'green' : 'yellow');

    // Category breakdown
    this.log(`\\n📋 Category Breakdown:`, 'bright');
    Object.entries(this.results.categories).forEach(([category, results]) => {
      const successRate = ((results.passed / results.total) * 100).toFixed(2);
      this.log(`   ${category}: ${results.passed}/${results.total} (${successRate}%)`, 
        results.failed === 0 ? 'green' : 'yellow');
    });

    // Performance analysis
    this.log(`\\n⚡ Performance Analysis:`, 'bright');
    this.log(`   Total Execution Time: ${totalExecutionTime}ms`, 'white');
    
    const performanceEntries = Object.entries(this.results.performance);
    if (performanceEntries.length > 0) {
      const avgTime = performanceEntries.reduce((sum, [, time]) => sum + time, 0) / performanceEntries.length;
      const slowestTest = performanceEntries.reduce((max, [name, time]) => 
        time > max.time ? { name, time } : max, { name: '', time: 0 });
      
      this.log(`   Average Test Time: ${avgTime.toFixed(2)}ms`, 'white');
      this.log(`   Slowest Test: ${slowestTest.name} (${slowestTest.time}ms)`, 
        slowestTest.time > testConfig.performanceThreshold ? 'yellow' : 'white');
    }

    // Error details
    if (this.results.errors.length > 0) {
      this.log(`\\n❌ Error Details:`, 'red');
      this.results.errors.forEach((error, index) => {
        this.log(`   ${index + 1}. ${error.test} (${error.category})`, 'red');
        if (error.error) {
          this.log(`      Error: ${error.error}`, 'red');
        }
        if (error.failures) {
          this.log(`      Failed Tests: ${error.failures}`, 'red');
        }
      });
    }

    // Production readiness assessment
    this.log(`\\n🚀 Production Readiness Assessment:`, 'bright');
    const isProductionReady = this.results.failed === 0 && 
                             totalExecutionTime < (testConfig.performanceThreshold * 10) &&
                             this.results.total > 0;
    
    if (isProductionReady) {
      this.log(`   ✅ ALL SYSTEMS GO - PRODUCTION READY!`, 'green');
      this.log(`   🎉 All ${this.results.total} tests passed successfully`, 'green');
      this.log(`   ⚡ Performance within acceptable limits`, 'green');
      this.log(`   🛡️ Error handling and edge cases covered`, 'green');
    } else {
      this.log(`   ⚠️  PRODUCTION READINESS ISSUES DETECTED`, 'yellow');
      if (this.results.failed > 0) {
        this.log(`   ❌ ${this.results.failed} test failures need attention`, 'red');
      }
      if (totalExecutionTime > (testConfig.performanceThreshold * 10)) {
        this.log(`   ⏱️  Performance issues detected (${totalExecutionTime}ms)`, 'yellow');
      }
    }

    this.log(`\\n📅 Completed at: ${new Date().toLocaleString()}`, 'white');
    this.log('='.repeat(80), 'cyan');

    return isProductionReady;
  }

  // Save detailed report to file
  saveDetailedReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: ((this.results.passed / this.results.total) * 100).toFixed(2),
        executionTime: Date.now() - this.startTime,
      },
      categories: this.results.categories,
      performance: this.results.performance,
      errors: this.results.errors,
      productionReady: this.results.failed === 0,
    };

    const reportPath = path.join('test', 'COMPREHENSIVE_TEST_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    this.log(`\\n📄 Detailed report saved to: ${reportPath}`, 'cyan');
  }

  // Main execution method
  async run() {
    this.printHeader();

    try {
      // Execute tests by priority
      const sortedCategories = Object.entries(testCategories)
        .sort(([, a], [, b]) => a.priority - b.priority);

      for (const [categoryName, category] of sortedCategories) {
        await this.executeCategory(categoryName, category);
      }

      // Generate and save reports
      const isProductionReady = this.generateReport();
      this.saveDetailedReport();

      // Exit with appropriate code
      process.exit(isProductionReady ? 0 : 1);

    } catch (error) {
      this.log(`\\n💥 CRITICAL ERROR: ${error.message}`, 'red');
      this.log(error.stack, 'red');
      process.exit(1);
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const options = {
  category: args.find(arg => arg.startsWith('--category='))?.split('=')[1],
  verbose: args.includes('--verbose'),
  quick: args.includes('--quick'),
  coverage: args.includes('--coverage'),
};

// Modify test configuration based on options
if (options.quick) {
  testConfig.timeout = 10000;
  testConfig.maxConcurrency = 8;
}

if (options.coverage) {
  // Add coverage flags to Jest command
  testConfig.coverageEnabled = true;
}

// Run specific category if specified
if (options.category) {
  const category = testCategories[options.category.toUpperCase()];
  if (!category) {
    console.error(`❌ Unknown category: ${options.category}`);
    console.error(`Available categories: ${Object.keys(testCategories).join(', ')}`);
    process.exit(1);
  }
  
  // Run only the specified category
  const runner = new ComprehensiveTestRunner();
  runner.run = async function() {
    this.printHeader();
    await this.executeCategory(options.category.toUpperCase(), category);
    this.generateReport();
    this.saveDetailedReport();
    process.exit(this.results.failed === 0 ? 0 : 1);
  };
  runner.run();
} else {
  // Run all tests
  const runner = new ComprehensiveTestRunner();
  runner.run();
}

// Export for programmatic use
module.exports = ComprehensiveTestRunner;
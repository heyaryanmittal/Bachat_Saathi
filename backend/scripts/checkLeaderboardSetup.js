#!/usr/bin/env node

/**
 * Leaderboard System - Getting Started Checklist
 * 
 * Print this to verify everything is in place
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const files = [
  // Backend Files
  { path: 'backend/models/Leaderboard.js', type: 'Backend Model' },
  { path: 'backend/services/leaderboardService.js', type: 'Backend Service' },
  { path: 'backend/controllers/leaderboardController.js', type: 'Backend Controller' },
  { path: 'backend/routes/leaderboardRoutes.js', type: 'Backend Routes' },
  { path: 'backend/cronJobs/leaderboardReset.js', type: 'Backend Cron' },
  { path: 'backend/scripts/populateLeaderboard.js', type: 'Backend Script' },
  { path: 'backend/scripts/testLeaderboard.js', type: 'Backend Test Script' },
  
  // Frontend Files
  { path: 'frontend/src/pages/Leaderboard.jsx', type: 'Frontend Component' },
  
  // Documentation
  { path: 'LEADERBOARD_SYSTEM_README.md', type: 'Documentation' },
  { path: 'LEADERBOARD_QUICKSTART.md', type: 'Documentation' },
  { path: 'LEADERBOARD_TESTING_GUIDE.md', type: 'Documentation' },
  { path: 'LEADERBOARD_SETUP_COMPLETE.md', type: 'Documentation' },
  { path: 'LEADERBOARD_IMPLEMENTATION_REPORT.md', type: 'Documentation' },
  
  // Test Scripts
  { path: 'test-leaderboard-api.bat', type: 'Test Script' }
];

function checkFile(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (e) {
    return false;
  }
}

function main() {
  console.log(`\n${colors.blue}${colors.bold}
╔═══════════════════════════════════════════════╗
║   LEADERBOARD SYSTEM - SETUP CHECKLIST        ║
╚═══════════════════════════════════════════════╝${colors.reset}\n`);

  let totalFiles = 0;
  let foundFiles = 0;
  const results = {};

  for (const file of files) {
    const exists = checkFile(file.path);
    totalFiles++;
    if (exists) foundFiles++;
    
    if (!results[file.type]) {
      results[file.type] = { total: 0, found: 0 };
    }
    results[file.type].total++;
    if (exists) results[file.type].found++;

    const symbol = exists ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    const status = exists ? 'FOUND' : 'MISSING';
    console.log(`${symbol} [${file.type}] ${file.path}`);
  }

  console.log(`\n${colors.blue}${colors.bold}Summary by Category:${colors.reset}\n`);

  for (const [category, stats] of Object.entries(results)) {
    const percentage = Math.round((stats.found / stats.total) * 100);
    const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    console.log(`${category}: ${stats.found}/${stats.total} ${bar} ${percentage}%`);
  }

  console.log(`\n${colors.blue}${colors.bold}Overall Status:${colors.reset}\n`);
  const overallPercentage = Math.round((foundFiles / totalFiles) * 100);
  
  if (overallPercentage === 100) {
    console.log(`${colors.green}✓ ALL FILES PRESENT - SYSTEM READY!${colors.reset}`);
  } else if (overallPercentage >= 90) {
    console.log(`${colors.yellow}⚠ MOST FILES PRESENT - ${overallPercentage}% COMPLETE${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ INCOMPLETE - ONLY ${overallPercentage}% COMPLETE${colors.reset}`);
  }

  console.log(`\n${colors.blue}${colors.bold}Total: ${foundFiles}/${totalFiles} files present${colors.reset}\n`);

  if (foundFiles === totalFiles) {
    console.log(`${colors.green}${colors.bold}🎉 Ready to go! Follow these steps:${colors.reset}\n`);
    console.log(`1. Start Backend:     cd backend && npm start`);
    console.log(`2. Start Frontend:    cd frontend && npm run dev`);
    console.log(`3. Populate:         curl -X POST http://localhost:5001/api/debug/populate-leaderboard`);
    console.log(`4. View:             http://localhost:5173/leaderboard\n`);
  }
}

main();

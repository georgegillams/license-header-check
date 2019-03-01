#!/usr/bin/env node

const runProcess = require('./lib.js');

const dir = './';
const endYear = 1900 + new Date().getYear();
const startYear = process.env.START_YEAR || endYear;
const orgName = process.env.ORG_NAME;
const shouldFix = process.argv.includes('--fix') || process.argv.includes('-f');

cli();

module.exports = cli;

function cli () {
  console.log('Checking copyright header years...');
  console.log('');

  runProcess(dir, startYear, endYear, orgName, shouldFix).then(result => {
    if(result) { console.log(result); }
        console.log('');
    process.exit(0)
  }, err => {
    if(err) { console.error(err); }
        console.log('');
    process.exit(1)
  })
}


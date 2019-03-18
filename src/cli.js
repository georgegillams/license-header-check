#!/usr/bin/env node

const runProcess = require('./lib.js');
const prompt = require('prompt');

const getCliArg = (argFlag, argFlagShort) => {
  if(process.argv.includes(`--${argFlag}`)){
    return process.argv[process.argv.indexOf(`--${argFlag}`) + 1];
  }
  if(process.argv.includes(`-${argFlagShort}`)){
    return process.argv[process.argv.indexOf(`-${argFlagShort}`) + 1];
  }
  return null;
}

const dir = './';
const endYear = 1900 + new Date().getYear();
const startYear = getCliArg("year", "y");
const orgName = getCliArg("orgName", "o");
const shouldFix = process.argv.includes('--fix') || process.argv.includes('-f');
const silent = process.argv.includes('--silent') || process.argv.includes('-s');

module.exports = cli;

const schema = {
  properties: {
    startYear: {
      description: 'What year was the repo created/opensourced',
      default: startYear || endYear,
      pattern: /[0-9][0-9][0-9][0-9]/,
      message: 'Must be a valid year',
    },
    orgName: {
      description: 'What is the organisation name?',
      default: orgName || "none",
      pattern: /.*/,
      message: '',
    },
  },
};

const cli = (err, {startYear, orgName}) => {
  console.log('Checking copyright header years...');
  console.log('');

  const orgNameFinal = orgName === "none" ? null : orgName;
  const startYearFinal = startYear || endYear ;

  runProcess(dir, startYearFinal, endYear, orgNameFinal, shouldFix).then(result => {
    if(result) { console.log(result); }
        console.log('');
    process.exit(0)
  }, err => {
    if(err) { console.error(err); }
        console.log('');
    process.exit(1)
  })
}

if(silent) {
  cli(null, {startYear, orgName})
}else{
  prompt.start();
  prompt.get(schema, cli);
}


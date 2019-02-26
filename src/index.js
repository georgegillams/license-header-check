#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

const yearErrors = [];
const presenceErrors = [];
const endYear = 1900 + new Date().getYear();
const startYear = process.env.START_YEAR || endYear;
const orgName = process.env.ORG_NAME;

thing();

module.exports = thing;

function checkCopyrightYear (codeFile, fix) {
  return new Promise(resolve => {
    if (fs.lstatSync(codeFile).isDirectory()) {
      resolve(null);
      return;
    }
    let newFileData = [];
    let licensePresent = false;
    let fixApplied = false;
    fs.readFile(codeFile, 'utf8', (err, data) => {
      if (err) {
        resolve(err);
        return;
      }
      if (!data) {
        resolve(new Error('no data'));
        return;
      }
      const fileLines = data.split('\n');
      for (let i = 0; i < fileLines.length; i += 1) {
        const lineMatch = fileLines[i].match(/(.*)Copyright\s+[0-9\-\s]*.*/);
        if (!lineMatch) {
          newFileData.push(fileLines[i]);
          continue;
        }
        licensePresent = true;
        const correctString = `${lineMatch[1]}Copyright 2012-2019 YO
          `${startYear}-` : ''}${endYear}${orgName ? ` ${orgName}` : ''}`;
        const yearValid = fileLines[i] === correctString;
        if (!yearValid) {
          yearErrors.push({ codeFile });
          if (fix) {
            newFileData.push(correctString);
            fixApplied = true;
          }
        }
      }
      if (!licensePresent) {
        presenceErrors.push({codeFile})
      }
      if (fix && fixApplied) {
        fs.writeFile(codeFile, newFileData.join('\n'), 'utf8', err2 => {
          if (err2) resolve(err2);
        });
      }
      resolve(null);
    });
  });
}

function printYearErrors () {
  if(yearErrors.length < 1){
    return;
  }

  console.log('Some copyright headers are wrong  😱');
  console.log('');
  yearErrors.forEach(yearErrors => {
    console.log(yearErrors.codeFile);
  });
}

function printPresenceErrors () {
  if(presenceErrors.length < 1){
    return;
  }

  console.log('Some copyright headers are missing  😱');
  console.log('');
  presenceErrors.forEach(presenceErrors => {
    console.log(presenceErrors.codeFile);
  });
}

function thing () {
  console.log('Checking copyright headers...');
  console.log('');

  let codeFiles = execSync('find * | grep -v node_modules')
    .toString()
    .split('\n');

  codeFiles = codeFiles.filter(s => s !== '');

  const shouldFix = process.argv.includes('--fix') || process.argv.includes('-f');

  const checks = codeFiles.map(cf => checkCopyrightYear(cf, shouldFix));

  Promise.all(checks)
    .then(() => {
      if (yearErrors.length + presenceErrors.length === 0) {
        console.log('All good.  👍');
      } else if (shouldFix) {
        console.log('\nAll fixed.  👍\n\n');
      } else {
        printYearErrors();
        printPresenceErrors();
        console.log('');
        process.exit(1);
      }
      console.log('');
    })
    .catch(() => {
      console.log(`some yearErrors happened`);
    });
}


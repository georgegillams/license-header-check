#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkCopyrightStatements (codeFile, yearErrors, presenceErrors, startYear, endYear, orgName) {
  return new Promise(resolve => {
    let licensePresent = false;
    if (fs.lstatSync(codeFile).isDirectory()) {
      resolve(null);
      return;
    }
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
          continue;
        }
        licensePresent = true;
        const correctString = `${lineMatch[1]}Copyright `;
        if(startYear !== endYear){
          correctString += `${startYear}-`;
        }
        correctString += `${endYear}`;
        if(orgName){
          correctString += ` ${orgName}`;
        }
        const copyrightStatementValid = fileLines[i] === correctString;
        if (copyrightStatementValid) {
          resolve(null);
          return;
        }
        yearErrors.push({codeFile, offendingLine: fileLines[i], expectedLine: correctString });
      }
      if (!licensePresent) {
        presenceErrors.push({codeFile});
      }
      resolve(null);
    });
  });
}

function fixPresenceError (error) {
  return new Promise(resolve => {
    if (fs.lstatSync(error.codeFile).isDirectory()) {
      resolve(null);
      return;
    }
    fs.readFile(error.codeFile, 'utf8', (err, data) => {
      if (err) {
        resolve(err);
        return;
      }
      if (!data) {
        resolve(new Error('no data'));
        return;
      }

      const newFileData = `LICENSE_HEADER_HERE\n\n${data}`

      fs.writeFile(error.codeFile, newFileData, 'utf8', err2 => {
        if (err2) {
          resolve(err2);
        }
        resolve(null);
      });
    });
  });
}

function fixCopyrightYearError (error) {
  return new Promise(resolve => {
    if (fs.lstatSync(error.codeFile).isDirectory()) {
      resolve(null);
      return;
    }
    let fixApplied = false;
    fs.readFile(error.codeFile, 'utf8', (err, data) => {
      if (err) {
        resolve(err);
        return;
      }
      if (!data) {
        resolve(new Error('no data'));
        return;
      }

      const newFileData = data.split(error.offendingLine).join(error.expectedLine)

      fs.writeFile(error.codeFile, newFileData, 'utf8', err2 => {
        if (err2) {
          resolve(err2);
        }
        resolve(null);
      });
    });
  });
}

function createErrorMessage (yearErrors, presenceErrors) {
   let messages = [];

   if(yearErrors.length > 0){
     const yearErrorMessage = []
     yearErrorMessage.push('Some copyright header years are wrong  😱\n');
     yearErrors.forEach(error => {
       yearErrorMessage.push(`${error.codeFile}`);
     });
     messages.push(yearErrorMessage.join('\n'));
   }

   if(presenceErrors.length > 0){
     const presenceErrorMessage = []
     presenceErrorMessage.push('Some copyright headers are missing  😱\n');
     presenceErrors.forEach(error => {
       presenceErrorMessage.push(`${error.codeFile}`);
     });
     messages.push(presenceErrorMessage.join('\n'));
   }

  return messages.join('\n\n');
}

function performFixes (yearErrors, presenceErrors) {
  return new Promise((resolve, reject) => {
    const fixes = yearErrors.map(err => fixCopyrightYearError(err));
    presenceErrors.forEach(err => fixes.push(fixPresenceError(err)));

     Promise.all(fixes)
     .then(() => {
         const message = '\nAll fixed.  👍\n';
         resolve(message);
         return;
     })
     .catch(() => {
       reject(`Some errors happened. This is a problem with license-header-check, and not your code!`);
       return;
     });
  });
}

function runProcess (dir, startYear, endYear, orgName, shouldFix) {
  return new Promise((resolve, reject) => {
    let yearErrors = [];
    let presenceErrors = [];

    let codeFiles = execSync(`(cd ${dir} && find * | grep -v node_modules | grep -v ".*gif" | grep -v ".*png" | grep -v ".*jpg")`)
      .toString()
      .split('\n');

    codeFiles = codeFiles.filter(s => s !== '');
    codeFiles = codeFiles.map(p => path.join(dir, p));

    const checks = codeFiles.map(cf => checkCopyrightStatements(cf, yearErrors, presenceErrors, startYear, endYear, orgName));

     Promise.all(checks)
       .then(() => {
         if (yearErrors.length + presenceErrors.length === 0) {
           const message = 'All good.  👍';
           resolve(message);
           return;
         } else if (shouldFix) {
           resolve(performFixes(yearErrors, presenceErrors));
           return;
         } else {
           let message = createErrorMessage(yearErrors, presenceErrors);
           reject(message);
           return;
         }
       })
       .catch(() => {
         reject(`Some errors happened. This is a problem with license-header-check, and not your code!`);
         return;
       });
  });
}

module.exports = runProcess;

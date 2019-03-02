#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let errors = [];

function checkCopyrightYear (codeFile, startYear, endYear, orgName, shouldFix) {
  return new Promise(resolve => {
    if (fs.lstatSync(codeFile).isDirectory()) {
      resolve(null);
      return;
    }
    let newFileData = [];
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
        const correctString = `${lineMatch[1]}Copyright `;
        if(startYear !== endYear){
          correctString += `${startYear}-`;
        }
        correctString += `${endYear}`;
        if(orgName){
          correctString += ` ${orgName}`;
        }
        const yearValid = fileLines[i] === correctString;
        if (yearValid) {
          resolve(null);
          return;
        }
        errors.push({codeFile});
        if (shouldFix) {
          newFileData.push(correctString);
          fixApplied = true;
        }
      }

      // We should re-write the file iff a fix has been applied, otherwise we risk leaving binary files in an unclean state 
      if (shouldFix && fixApplied) {
        fs.writeFile(codeFile, newFileData.join('\n'), 'utf8', err2 => {
          if (err2) {
            resolve(err2);
          }
          resolve(null);
        });
      } else {
        resolve(null);
      }
    });
  });
}

function runProcess (dir, startYear, endYear, orgName, shouldFix) {
  return new Promise((resolve, reject) => {
    errors = [];

    let codeFiles = execSync(`(cd ${dir} && find * | grep -v node_modules)`)
      .toString()
      .split('\n');

    codeFiles = codeFiles.filter(s => s !== '');
    codeFiles = codeFiles.map(p => path.join(dir, p));

    const checks = codeFiles.map(cf => checkCopyrightYear(cf, startYear, endYear, orgName, shouldFix));

     Promise.all(checks)
       .then(() => {
         if (errors.length === 0) {
           const message = 'All good.  👍';
           resolve(message); 
           return;
         } else if (shouldFix) {
           const message = '\nAll fixed.  👍\n\n';
           resolve(message); 
           return;
         } else {
           let message = 'Some copyright headers are wrong  😱\n';
           errors.forEach(error => {
             message += `\n${error.codeFile}`;
           });
           reject(message);
           return;
         }
       })
       .catch(() => {
         reject(`some errors happened`);
         return;
       });
  });
}

module.exports = runProcess;


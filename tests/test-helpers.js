#!/usr/bin/env node

const fs = require('fs');
const { spawnSync, execSync } = require('child_process');
const os = require('os');
const path = require('path');


function createTempDir () {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `license-header-check-tests-`));
  execSync(`cp -R ./tests/test-set/* ${tempDir}`)
  return tempDir
}

function consistencise (output) {
  if(output.split("\n\n").length > 1) {
     return output.split("\n\n").map(s => consistencise(s)).join(" || ");
  }
  let s = output.replace(/(\r\n|\n|\r)/gm, "SPLIT_HERE")
  s = s.split("SPLIT_HERE").filter(s => s !== '')
  return s.sort().join(" ")
}

function gitDiff(dir1, dir2) {
  if(process.env.UPDATE_SNAPSHOTS) {
    execSync(`cp -R ${path.join(dir1, '*')} ${dir2}`);
  }

  const diffResult = spawnSync(`diff`, [`-q`, `${path.join(dir1, '')}`, `${path.join(dir2, '')}`], {
    encoding: 'utf-8'
  });

  return diffResult.stdout;
}

module.exports.consistencise = consistencise;
module.exports.createTempDir = createTempDir;
module.exports.gitDiff = gitDiff;


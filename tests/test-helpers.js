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
  let s = output.replace(/(\r\n|\n|\r)/gm, "SPLIT_HERE")
  s = s.split("SPLIT_HERE").filter(s => s !== '')
  return s.sort().join(" ")
}

function gitDiff(dir1, dir2) {
  const gitDiffResult = spawnSync(`git`, [`diff`, dir1, dir2]);
  return gitDiffResult.output.toString(`utf8`);
}

module.exports.consistencise = consistencise;
module.exports.createTempDir = createTempDir;
module.exports.gitDiff = gitDiff;


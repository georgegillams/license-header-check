#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const runProcess = require('../dist/lib.js');
const {gitDiff, consistencise, createTempDir} = require('./test-helpers.js');

test('fix errors when startYear = endYear', (done) => {
  const tempDir = createTempDir()
  
  const result = runProcess(tempDir, 2019, 2019, null, true).then((result) => {
    expect(consistencise(result)).toBe(`All fixed.  👍`)
    expect(gitDiff(`./tests/snapshots/start_year_equal_end_year`, tempDir)).toBe('');
    done();
  })
})

test('fix errors when startYear != endYear', (done) => {
 const tempDir = createTempDir()
 
 const result = runProcess(tempDir, 2012, 2019, null, true).then((result) => {
   expect(consistencise(result)).toBe(`All fixed.  👍`)
   expect(gitDiff(tempDir, `./tests/snapshots/start_year_not_equal_end_year`)).toBe('');
   done();
 })
})

test('fix errors with Organisation when startYear != endYear', (done) => {
 const tempDir = createTempDir()
 
 const result = runProcess(tempDir, 2012, 2019, "Organisation", true).then((result) => {
   expect(consistencise(result)).toBe(`All fixed.  👍`)
   expect(gitDiff(tempDir, `./tests/snapshots/start_year_not_equal_end_year-with_org`)).toBe('');
   done();
 })
})

test('fix errors with Organiseation when startYear = endYear', (done) => {
 const tempDir = createTempDir()
 
 const result = runProcess(tempDir, 2019, 2019, "Organisation", true).then((result) => {
   expect(consistencise(result)).toBe(`All fixed.  👍`)
   expect(gitDiff(tempDir, `./tests/snapshots/start_year_equal_end_year-with_org`)).toBe('');
   done();
 })
})


#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const  runProcess = require('../dist/lib.js');
const  {consistencise} = require('./test-helpers.js');

test('detects errors when startYear = endYear', (done) => {
  const result = runProcess("./tests/test-set", 2019, 2019, null, false).then((result) => {
    console.log(`result`, result)
  }, err => {
    expect(consistencise(err)).toBe("Some copyright headers are wrong  😱 tests/test-set/correct_year-with_org.js tests/test-set/correct_year_range-with_org.js tests/test-set/wrong_year_range-with_org.txt")
    done()
  })
})

test('detects errors when startYear != endYear', (done) => {
  const result = runProcess("./tests/test-set", 2012, 2019, null, false).then((result) => {
    console.log(`result`, result)
  }, err => {
    expect(consistencise(err)).toBe("Some copyright headers are wrong  😱 tests/test-set/correct_year-with_org.js tests/test-set/correct_year_range-with_org.js tests/test-set/wrong_year_range-with_org.txt")
    done()
  })
})

test('detects errors with Organisation when startYear != endYear', (done) => {
  const result = runProcess("./tests/test-set", 2012, 2019, "Organisation", false).then((result) => {
    console.log(`result`, result)
  }, err => {
    expect(consistencise(err)).toBe("Some copyright headers are wrong  😱 tests/test-set/correct_year-with_org.js tests/test-set/correct_year_range-with_org.js tests/test-set/wrong_year_range-with_org.txt")
    done()
  })
})

test('detects errors with Organiseation when startYear = endYear', (done) => {
  const result = runProcess("./tests/test-set", 2019, 2019, "Organisation", false).then((result) => {
    console.log(`result`, result)
  }, err => {
    expect(consistencise(err)).toBe("Some copyright headers are wrong  😱 tests/test-set/correct_year-with_org.js tests/test-set/correct_year_range-with_org.js tests/test-set/wrong_year_range-with_org.txt")
    done()
  })
})


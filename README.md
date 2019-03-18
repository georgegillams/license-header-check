# [License Header Checker](https://www.npmjs.com/license-header-check)

Checks the year in your license header is up to date.

## Try it!
```js
npx license-header-check
```

or

```js
npm i -g license-header-check
license-header-check
```

The tool will prompt you for all the information it needs. If you want to integrate it into your CI, you can use silent mode which only takes CLI arguments.

## Arguments
| name                    | default |
| ----------------------- | ------- |
| `--silent` or `-s`      | false   |
| `--fix` or `-f`         | false   |
| `--orgName` or `-o`     | null    |
| `--startYear` or `-s`   | null    |

## Testing

To run unit tests, simply use
```bash
npm run test
```

Snapshots can be updated automatically using the following:
```bash
UPDATE_SNAPSHOTS=true npm run test
```


## Future work
Will add all the obvious functionality like checking the license is present, checking other aspects of the header, allowing files to be ignored etc.

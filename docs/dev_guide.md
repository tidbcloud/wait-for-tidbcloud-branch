# Dev Guide

### fmt

Use `npm run lint  -- --fix` to find and fix the fmt issues.

### test

Use `npm test` to run the test.

### build & package

Remember to use `npm run build && npm run package` to generate js files before push.

### Publish

push a tag to trigger the release action.

```
git tag v0.0.1
git push --tags
```
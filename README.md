# commit-watch

A CLI to gatekeep commit messages that do not conform to conventions.

## Installation

If you have `npx` available, you can directly use it without explicit installation:

```shell
% npx @eqworks/commit-watch --help
```

Otherwise, or when explicitly local installation is needed:

```shell
% npm i -g @eqworks/commit-watch
% # or
% yarn global add @eqworks/commit-watch
```

Then:

```shell
% commit-watch --help
```

## Usage

This CLI is designed to work in any git repository to exit with code 1 (`process.exit(1)`) when there are any mismatches of the commit message (subject line only) against the convention `category[/sub-category] - subject title` or in RegEx as `/(?<cat>\S+?)(\/(?<t2>\S+))? - (?<title>.*)/`:

```shell
% commit-watch -b origin/master -v
⚠ 6/9 do not match pattern "category[/sub-category] - subject title"

✖ define APIError
✖ fix /readme to reflect changes in selectUser
✖ remove unnecessary await
✖ refactor selectUser to return user || undefined
✖ PR fixes, throws APIError
✖ check if user exists, won't send opt email if user unknown
✓ users - make getUsers async, await db query
✓ login - throw error on /users endpoints when user not found
✓ login - misc PR changes
```

and the exit code:

```shell
% echo $?
1
```

To use it in an automated/CI environment, make sure to pin down the `--base` and `--head` git refs. A generic example in GitHub Actions (in this case, through the given `${{ github }}` context):

```yaml
jobs:
  commit-watch:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v2
        with:
          node-version: 14.x

      - run: npx @eqworks/commit-watch -b ${{ github.event.pull_request.base.sha }} -h ${{ github.event.pull_request.head.sha }} -v
```

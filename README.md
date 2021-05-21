# commit-watch

A CLI to gatekeep commit messages that do not conform to conventions.

## Installation

```shell
% npm i -g @eqworks/commit-watch
% # or
% yarn global add @eqworks/commit-watch
```

Then:

```shell
% commit-watch --help
```

If you have `npx` available, you can directly use it without explicit installation:

```shell
% npx @eqworks/commit-watch --help
```

## Sample usage

This CLI is designed to be used in any git repository to exit with code 1 (`process.exit(1)`) when there are any mismatches of the commit message (subject line only) convention.

```
category[/sub-category] - subject title
```

or in RegEx as `/(?<cat>\S+?)(\/(?<t2>\S+))? - (?<title>.*)/`

```shell
% commit-watch -b origin/master -v
⚠ 6/9 do not match RegExp/(?<cat>\S+?)(\/(?<t2>\S+))? - (?<title>.*)/

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

To use it in an automated/CI environment such as GitHub Actions, check out the `dogfood` job in [this workflow](.github/workflows/main.yml).

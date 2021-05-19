#!/usr/bin/env node
const { execSync } = require('child_process')

const yargs = require('yargs/yargs')
const chalk = require('chalk')

// from @eqworks/release convention
const R = /(?<cat>\S+?)(\/(?<t2>\S+))? - (?<title>.*)/

const SEV_COLOR = {
  log: 'green',
  warn: 'yellow',
  error: 'red',
}
const SEV_PRE = {
  log: '✓',
  warn: '⚠',
  error: '✖',
}
const _log = (sev = 'log') => m => (console[sev])((chalk[SEV_COLOR[sev]])(`${SEV_PRE[sev]} ${m}`))
const log = _log()
const warn = _log('warn')
const error = _log('error')
const isGood = m => m.match(R)
const isBad = m => !isGood(m)

if (require.main === module) {
  const { argv } = yargs(process.argv.slice(2)).options({
    verbose: {
      alias: 'v',
      description: 'verbose/debug flag',
      type: 'boolean',
      default: false,
    },
    base: {
      alias: 'b',
      description: 'base git ref to compare with the head ref',
      type: 'string',
      default: 'origin/main',
    },
    head: {
      alias: 'h',
      description: 'head git ref to compare with the base ref',
      type: 'string',
      default: 'HEAD',
    },
    fetch: {
      description: 'perform a git fetch before commit-watch',
      type: 'boolean',
      default: false,
    },
  })

  if (argv.fetch) {
    execSync('git fetch')
  }

  const { verbose, base, head } = argv

  try {
    const gitLog = `git log --no-merges --format='%s' ${base}..${head}`
    const messages = execSync(gitLog, { stdio: 'pipe' }).toString().trim()
    if (!messages) {
      if (verbose) {
        log(`No commits between ${base}..${head}`)
      }
      process.exit(0)
    }
    const ms = messages.split('\n')
    const bad = ms.filter(isBad)
    const good = ms.filter(isGood)
    if (bad.length) {
      if (verbose) {
        warn(`${bad.length}/${ms.length} do${bad.length === 1 ? 'es' : ''} not match RegExp${R}\n`)
        bad.forEach(m => error(m))
        good.forEach(m => log(m))
      }
      process.exit(1)
    }

    if (verbose) {
      log('All conforming. Good jorb!')
    }
  } catch (e) {
    if (verbose) {
      error(e.message)
    }
    process.exit(1)
  }
}

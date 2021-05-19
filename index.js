#!/usr/bin/env node
const { execSync } = require('child_process')

const yargs = require('yargs/yargs')
const chalk = require('chalk')

// from @eqworks/release convention
const R = /(?<cat>\S+?)(\/(?<t2>\S+))? - (?<title>.*)/

const SEV_COLOR = {
  log: 'blue',
  warn: 'yellow',
  error: 'red',
}
const _log = (sev = 'log') => (message) => (console[sev])((chalk[SEV_COLOR[sev]])(message))
const log = _log()
const warn = _log('warn')
const error = _log('error')

if (require.main === module) {
  const { argv } = yargs(process.argv.slice(2))
  const verbose = argv.verbose || argv.v
  const base = argv.base || argv.b || 'origin/main'

  if (argv.fetch) {
    execSync('git fetch --prune')
  }

  try {
    const messages = execSync(`git log --no-merges --format='%s' ${base}..HEAD`, { stdio: 'pipe' }).toString().trim()
    if (!messages) {
      if (verbose) {
        log(`No commits between ${base}..HEAD`)
      }
      process.exit(0)
    }
    const ms = messages.split('\n')
    const bad = ms.filter(m => !m.match(R))
    if (bad.length) {
      if (verbose) {
        warn(`${bad.length}/${ms.length} do${bad.length === 1 ? 'es' : ''} not match RegExp${R}\n`)
        bad.forEach(m => error(m))
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

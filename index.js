#!/usr/bin/env node
const { execSync } = require('child_process')

const yargs = require('yargs/yargs')
const chalk = require('chalk')

// from @eqworks/release convention
const R_GOOD = /(?<cat>\S+?)(\/(?<t2>\S+))? - (?<title>.*)/
const R_BASE_BRANCH = /^(?<remote>\S+)\/(?<branch>(main|master))$/
// potentially politically correct spelling not offending english and american-alike
const SEV_CLR = {
  log: 'cyan',
  success: 'green',
  warn: 'yellow',
  error: 'red',
}
const SEV_PRE = {
  log: '',
  success: '✓ ',
  warn: '⚠ ',
  error: '✖ ',
}
const _log = (sev = 'log') => m => (console[sev] || console.log)((chalk[SEV_CLR[sev]])(`${SEV_PRE[sev]}${m}`))
const log = _log()
const warn = _log('warn')
const error = _log('error')
const success = _log('success')
const isGood = m => m.match(R_GOOD)
const isBad = m => !isGood(m)

const detectBase = () => {
  const branches = execSync('git branch -r', { stdio: 'pipe' }).toString().trim()
  const bs = branches.split('\n').map(b => b.trim())
  for (let b of bs) {
    if (R_BASE_BRANCH.test(b.trim())) {
      return b
    }
  }
  return null
}

if (require.main === module) {
  const _base = detectBase()
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
      default: _base,
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

  if (!base) {
    if (verbose) {
      error('No base git ref detected or provided')
    }
    process.exit(1)
  }

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
        warn(`${bad.length}/${ms.length} do${bad.length === 1 ? 'es' : ''} not match pattern "category[/sub-category] - subject title"\n`)
        bad.forEach(error)
        good.forEach(success)
      }
      process.exit(1)
    }

    if (verbose) {
      success('All conforming. Good jorb!')
    }
  } catch (e) {
    if (verbose) {
      error(e.message)
    }
    process.exit(1)
  }
}

#!/usr/bin/env node
const { execSync } = require('child_process')
const yargs = require('yargs/yargs')

// from @eqworks/release convention
const R = /(?<cat>\S+?)(\/(?<t2>\S+))? - (?<title>.*)/

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
        console.warn(`No commits between ${base}..HEAD`)
      }
      process.exit(0)
    }
    const ms = messages.split('\n')
    const bad = ms.filter(m => !m.match(R))
    if (bad.length) {
      if (verbose) {
        console.error(`${bad.length}/${ms.length} commit message${bad.length > 1 ? 's' : ''} do${bad.length === 1 ? 'es' : ''} not conform to the convention ${R}\n`)
        bad.forEach(m => console.error(m))
      }
      process.exit(1)
    }

    if (verbose) {
      console.log('All conforming. Good jorb!')
    }
  } catch (e) {
    if (verbose) {
      console.error(e)
    }
    process.exit(1)
  }

}

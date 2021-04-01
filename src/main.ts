import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const inactiveDays = parseInt(core.getInput('inactiveDays'))
    // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
    core.debug(
      `searching for check suites that have not been run for ${inactiveDays} days`
    )
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

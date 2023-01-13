import * as core from '@actions/core'
import * as utils from './utils'
import config from './config'

const { perPage, olderThanDays, lastKeepDate } = config

const main = async (): Promise<void> => {
  try {
    core.info(`Searching for runs older than ${olderThanDays} days (before ${lastKeepDate})`)

    const totalCount = await utils.getTotalCount()
    const remainderPage = totalCount % perPage !== 0 ? 1 : 0
    const lastPage = Math.floor(totalCount / perPage) + remainderPage

    for (let page = lastPage; page >= 0; page--) {
      const runs = await utils.getWorkflowRuns(page)

      const runIds = runs.filter(run => utils.shouldBeDeleted(run)).map(run => run.id)

      if (runIds.length === 0) {
        core.info('No more runs to delete')
        break
      }

      core.info(`Deleting runs ${runIds}`)

      try {
        await utils.deleteWorkflowRuns(runIds)
      } catch (e: any) {
        core.error(`Failed to delete runs: ${e.message}`)
      }
    }
  } catch (error: any) {
    core.setFailed(`Action failed with error: ${error}`)
  }
}

main()

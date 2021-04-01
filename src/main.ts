import * as core from '@actions/core'
import * as github from '@actions/github'
import dayjs from 'dayjs'

async function run(): Promise<void> {
  try {
    const olderDays = parseInt(core.getInput('days-old'))
    const lastKeepDate = dayjs().subtract(olderDays, 'days')

    core.info(
      `searching for runs older than ${olderDays} days (before ${lastKeepDate.format()})`
    )

    const octokit = github.getOctokit(process.env.GITHUB_TOKEN || '')

    const perPage = 10
    const workflowRuns = (await octokit.actions.listWorkflowRunsForRepo({ ...github.context.repo, per_page: perPage, page: 0 })).data

    const totalCount = workflowRuns.total_count
    core.info(`total deletion candidates: ${totalCount}`)
    const remainderPage = (workflowRuns.total_count % perPage) !== 0 ? 1 : 0
    const lastPage = Math.trunc(workflowRuns.total_count / perPage) + remainderPage
    core.info(`last page (first page to search on): ${lastPage}`)

    for (let i = lastPage; i--; i >= 0) {
      const runs = (await octokit.actions.listWorkflowRunsForRepo({ ...github.context.repo, per_page: perPage, page: i })).data.workflow_runs
      const runIds = runs.filter(run => !dayjs(run.created_at).isAfter(lastKeepDate)).map(run => {
        return run.id
      })

      if (runIds.length === 0) {
        core.info(`no runs are older than ${lastKeepDate.format()}`)
        break;
      }

      core.info(`deleting runs ${JSON.stringify(runIds)}`)
      try {
        await Promise.all(runIds.map(id => octokit.actions.deleteWorkflowRun({
          ...github.context.repo,
          run_id: id
        })))
      } catch (e) {
        core.error(e)
      }
      
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

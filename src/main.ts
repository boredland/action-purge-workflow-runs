import * as core from '@actions/core'
import * as github from '@actions/github'
import dayjs from 'dayjs'

async function run(): Promise<void> {
  try {
    const olderDays = parseInt(core.getInput('days-old'))
    const ignoreOpenPullRequests = core.getInput('ignore-open-pull-requests') === 'true'
    const lastKeepDate = dayjs().subtract(olderDays, 'days')

    core.info(
      `searching for runs older than ${olderDays} days (before ${lastKeepDate.format()})`
    )

    const octokit = github.getOctokit(process.env.GITHUB_TOKEN || '')

    const perPage = 10
    const workflowRuns = (await octokit.actions.listWorkflowRunsForRepo({ ...github.context.repo, per_page: perPage, page: 0 })).data
    
    if (ignoreOpenPullRequests) {
      const filteredRuns = workflowRuns.workflow_runs.filter(run => run.pull_requests.length === 0)
      const oldCount = workflowRuns.total_count
      workflowRuns.workflow_runs = filteredRuns
      workflowRuns.total_count = filteredRuns.length
      core.info(`filtered out ${oldCount - filteredRuns.length} runs having open pull requests`)
    }

    const totalCount = workflowRuns.total_count
    core.info(`total deletion candidates: ${totalCount}`)
    const remainderPage = (workflowRuns.total_count % perPage) !== 0 ? 1 : 0
    const lastPage = Math.trunc(workflowRuns.total_count / perPage) + remainderPage
    core.info(`last page (first page to search on): ${lastPage}`)

    for (let i = lastPage; i--; i >= (lastPage - 30)) {
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

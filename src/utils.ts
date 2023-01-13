import * as core from '@actions/core'
import * as github from '@actions/github'
import dayjs from 'dayjs'
import config from './config'

const { actions } = github.getOctokit(process.env.GITHUB_TOKEN || '').rest

/**
 * Check if a run should be deleted
 * @param run the run to check
 * @returns true if the run should be deleted
 */
export const shouldBeDeleted = (run: any) => {
  if (config.ignoreOpenPullRequests && run.pull_requests?.length > 0) {
    core.debug(`Ignoring run ${run.id} because it has open pull requests`)
    return false
  }

  if (dayjs(run.created_at).isAfter(config.lastKeepDate)) {
    core.debug(`Ignoring run ${run.id} because it is newer than ${config.lastKeepDate}`)
    return false
  }

  return true
}

/**
 * Get the total number of runs
 * @returns the total number of runs
 */
export const getTotalCount = async (): Promise<number> => {
  const { total_count } = (await actions.listWorkflowRunsForRepo({ ...config.repo, page: 0 })).data
  return total_count
}

/**
 * Get the runs for a given page
 * @param page the page to get
 * @returns the runs for the given page
 */
export const getWorkflowRuns = async (page: number) => {
  const response = await actions.listWorkflowRunsForRepo({
    ...config.repo,
    page,
    per_page: config.perPage,
  })
  return response.data.workflow_runs
}

/**
 * Delete a list of runs
 * @param runs the list of runs to delete
 */
export const deleteWorkflowRuns = async (runs: number[]): Promise<void> => {
  await Promise.all(runs.map(id => actions.deleteWorkflowRun({ ...config.repo, run_id: id })))
}

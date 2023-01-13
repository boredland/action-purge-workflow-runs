import * as core from '@actions/core'
import * as github from '@actions/github'
import dayjs from 'dayjs'

const olderThanDays = parseInt(core.getInput('days-old') || '30')
const ignoreOpenPullRequests = core.getInput('ignore-open-pull-requests') === 'true'
const lastKeepDate = dayjs().subtract(olderThanDays, 'days')
const repo = github.context.repo
const perPage = 10

export default { olderThanDays, ignoreOpenPullRequests, lastKeepDate, repo, perPage }

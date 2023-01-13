[![build-test](https://github.com/iamludal/action-purge-workflow-runs/actions/workflows/integration.yml/badge.svg)](https://github.com/iamludal/action-purge-workflow-runs/actions/workflows/integration.yml)

# Purge old workflow runs from GitHub Actions

When using GitHub Actions with a lot of different actions and workflows, you'll soon face the issue of deprecated and unused workflows piling up in your `Actions` tab.

This action aims to clean out those outdated workflows by removing old runs.

> You can't decide to ignore runs related to open Pull Requests by using `ignore-open-pull-requests: true`, as shown in the below example.

## Usage example

```yaml
name: Cleanup Workflow Runs
on:
  workflow_dispatch:
  schedule:
    - cron: '0 */2 * * *'
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Cleanup workflow runs
        uses: iamludal/action-purge-workflow-runs@main
        with:
          days-old: 30
          ignore-open-pull-requests: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

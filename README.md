[![build-test](https://github.com/boredland/action-purge-workflow-runs/actions/workflows/test.yml/badge.svg)](https://github.com/boredland/action-purge-workflow-runs/actions/workflows/test.yml)

# Purge old workflow runs from github actions!

when using github actions and a lot of different actions, you'll soon face the issue of deprecated and unused workflows piling up in your actions tab.

this action aims to clean out those outdated workflows by removing old runs.

## Usage example

```yaml
name: workflow run cleanup
on:
  workflow_dispatch:
  schedule:
    - cron: '0 */2 * * *'
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: clean workflow runs
        uses: iamludal/action-purge-workflow-runs@main
        with:
          days-old: 60
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

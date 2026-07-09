# MergeProof Action

MergeProof is a GitHub Action that gates AI-generated pull requests with a simple risk score, a merge decision, and an auditable checklist.

It is intentionally small: no external npm dependencies, no model call, no SaaS backend. The first version proves the workflow before the product becomes a platform.

## What it does

- Reads the current pull request diff.
- Detects risk signals such as auth, payments, database changes, secrets, injection patterns, config changes, missing tests, and large diffs.
- Produces a score from 0 to 100.
- Comments on the PR with a decision and checklist.
- Fails the workflow when the decision is `blocked`.

## Install

Copy this folder into a repository as `.github/actions/mergeproof`, then add:

```yaml
name: MergeProof

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  mergeproof:
    runs-on: ubuntu-latest
    steps:
      - name: Run MergeProof
        uses: ./.github/actions/mergeproof
        with:
          github-token: ${{ github.token }}
          fail-threshold: "70"
          warn-threshold: "42"
          comment: "true"
          fail-on-blocked: "true"
```

## Local smoke test

From this folder:

```bash
INPUT_DIFF_FILE=fixtures/high-risk.diff INPUT_COMMENT=false node src/mergeproof.js
```

Expected result: `blocked`, because the fixture touches payments, auth, SQL, possible secrets, and has no tests.

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `github-token` | empty | Token used to fetch PR diffs and write comments. |
| `diff-file` | empty | Optional local diff path for testing. |
| `fail-threshold` | `70` | Score where the PR becomes blocked. |
| `warn-threshold` | `42` | Score where human review is required. |
| `comment` | `true` | Whether to create or update a PR comment. |
| `fail-on-blocked` | `true` | Whether to fail the workflow for blocked PRs. |

## Output contract

MergeProof emits:

- `score`
- `decision`
- `comment-file`

The product can later replace the rule engine with repository-specific policies, an LLM verifier, or historical repo context while keeping this output contract stable.

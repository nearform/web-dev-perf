# Web development stack performance testbed

This repository contains a testbed for running performance tests on various Web development stacks.

The tests measure the time elapsed from the moment an application file is modified until the result is available in the browser.

## Setup

- `yarn`
- `yarn start`

## Example output

```sh
Running 20 iterations
┌───────────┬──────────┬───────────┬───────────┬────────────┐
│ App       │ Min (ms) │ Mean (ms) │ 99th (ms) │ Max (ms)   │
├───────────┼──────────┼───────────┼───────────┼────────────┤
│ _snowpack │ 99       │ 147.15    │ 184       │ 184.227745 │
├───────────┼──────────┼───────────┼───────────┼────────────┤
│ cra       │ 436      │ 497.9     │ 625       │ 625.813671 │
├───────────┼──────────┼───────────┼───────────┼────────────┤
│ vite      │ 104      │ 150.05    │ 196       │ 196.510825 │
├───────────┼──────────┼───────────┼───────────┼────────────┤
│ next      │ 220      │ 307.9     │ 447       │ 447.463362 │
└───────────┴──────────┴───────────┴───────────┴────────────┘
```

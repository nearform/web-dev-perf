# Web development stack performance testbed

This repository contains a testbed for running performance tests on various Web development stacks.

## What is measured

- The startup time from the time the application is started in development mode to when it renders in the browser
- The time elapsed from the moment an application file is modified until the result is available in the browser

## Setup

- `yarn`
- `yarn start`

## Example output

```sh
┌───────────┬─────────────┬──────────┬───────────┬───────────┬──────────┐
│ App       │ Startup (s) │ Min (ms) │ Mean (ms) │ 99th (ms) │ Max (ms) │
├───────────┼─────────────┼──────────┼───────────┼───────────┼──────────┤
│ _snowpack │ 6.4477293   │ 81       │ 96.6      │ 116       │ 116.4117 │
├───────────┼─────────────┼──────────┼───────────┼───────────┼──────────┤
│ cra       │ 16.9250748  │ 381      │ 431.3     │ 725       │ 725.6596 │
├───────────┼─────────────┼──────────┼───────────┼───────────┼──────────┤
│ vite      │ 5.1510079   │ 112      │ 143.85    │ 268       │ 268.2244 │
├───────────┼─────────────┼──────────┼───────────┼───────────┼──────────┤
│ next      │ 12.977759   │ 250      │ 287       │ 380       │ 380.0615 │
└───────────┴─────────────┴──────────┴───────────┴───────────┴──────────┘
```

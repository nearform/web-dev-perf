# Web development stack performance testbed

[![ci](https://github.com/nearform/web-dev-perf/actions/workflows/ci.yml/badge.svg)](https://github.com/nearform/web-dev-perf/actions/workflows/ci.yml)

This repository contains a testbed for running performance tests on various Web development stacks with a focus on React.

## What is measured

- The startup time from the time the application is started in development mode to when it renders in the browser
- The time elapsed from the time an application file is modified until the result is available in the browser
- The time needed to create a production bundle of the application
- The size on disk of the production bundle

## Setup

- `yarn`
- `yarn start`

## Understanding the output

The output is printed to the terminal and it's visible in the CI builds, for example [here](https://github.com/nearform/web-dev-perf/runs/2075244152?check_suite_focus=true#step:6:18).

The first table shows:

- startup time (cold start) of the development build
- min/mean/99th percentile/max time between the modification of a source file and the result appearing in the browser during development

```
┌──────────────────┬─────────────┬──────────┬───────────┬───────────┬────────────┐
│ App              │ Startup (s) │ Min (ms) │ Mean (ms) │ 99th (ms) │ Max (ms)   │
├──────────────────┼─────────────┼──────────┼───────────┼───────────┼────────────┤
│ create-react-app │ 9.980259191 │ 318      │ 336.75    │ 390       │ 390.508957 │
├──────────────────┼─────────────┼──────────┼───────────┼───────────┼────────────┤
│ vite             │ 2.813310959 │ 70       │ 79.8      │ 128       │ 128.493516 │
├──────────────────┼─────────────┼──────────┼───────────┼───────────┼────────────┤
│ snowpack         │ 7.662191112 │ 51       │ 57.6      │ 84        │ 84.750415  │
├──────────────────┼─────────────┼──────────┼───────────┼───────────┼────────────┤
│ next.js          │ 9.938359153 │ 129      │ 156.9     │ 193       │ 193.143119 │
└──────────────────┴─────────────┴──────────┴───────────┴───────────┴────────────┘
```

The second table shows:

- build time of a production build
- size of the output of the production build

> When comparing Next.js with others, it should be noted that Next.js outputs a server side application as well, which others don't

```
┌──────────────────┬────────────────┬──────────────────┐
│ App              │ Build time (s) │ Bundle size (MB) │
├──────────────────┼────────────────┼──────────────────┤
│ create-react-app │ 10.621055961   │ 0.55859375       │
├──────────────────┼────────────────┼──────────────────┤
│ vite             │ 4.426771473    │ 0.1484375        │
├──────────────────┼────────────────┼──────────────────┤
│ snowpack         │ 2.308214285    │ 0.22265625       │
├──────────────────┼────────────────┼──────────────────┤
│ next.js          │ 11.410309438   │ 12.8125          │
└──────────────────┴────────────────┴──────────────────┘
```

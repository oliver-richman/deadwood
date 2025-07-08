# 🪵 deadwood

[![npm version](https://img.shields.io/npm/v/deadwood.svg)](https://www.npmjs.com/package/deadwood)
[![npm downloads](https://img.shields.io/npm/dm/deadwood.svg)](https://www.npmjs.com/package/deadwood)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/oliver-richman/deadwood/release.yml?branch=main)](https://github.com/oliver-richman/deadwood/actions)
[![license](https://img.shields.io/github/license/oliver-richman/deadwood.svg)](./LICENSE)


A CLI tool for identifying and optionally removing **dead code** in TypeScript projects. Deadwood helps maintain clean and efficient codebases by detecting unused types, variables, functions, classes, imports, exports, and more.

## Features

- Detects unused types, interfaces, enums
- Finds unused variables, functions, classes, and private members
- Identifies unused imports/exports and generic type parameters
- CLI output with summary and per-symbol details
- Configurable via CLI flags or `.deadwoodrc.json`

## Installation

### Global Installation (Recommended)

Install deadwood globally to use it from anywhere:

```bash
npm install -g deadwood
```

Then run:

```bash
deadwood [options]
```

### Local Installation

You can also install deadwood locally in your project:

```bash
npm install --save-dev deadwood
```

Then run:

```bash
npx deadwood [options]
```

## CLI Options

Run `deadwood --help` for all available flags.

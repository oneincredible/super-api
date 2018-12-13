#! /usr/bin/env bash
export PGHOST=localhost
export PGUSER=test
export PGPASSWORD=test
yarn run test --verbose=false --watch

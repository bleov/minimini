#!/bin/bash

set -e

bun install
bunx --bun vite build
rm -rfv ./pb_public
mkdir ./pb_public
cp -r ./dist/* ./pb_public/
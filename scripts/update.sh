#!/bin/bash

set -e

git checkout main
git pull origin main
chmod +x ./scripts/build.sh
./scripts/build.sh
systemctl restart glyph.service
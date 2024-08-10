#!/bin/bash

# Ensure a version number is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <new_version>"
  exit 1
fi

NEW_VERSION=$1

# Update version in package.json
sed -i '' -E "s/\"version\": \"[0-9]+\.[0-9]+\.[0-9]+\"/\"version\": \"$NEW_VERSION\"/" package.json
echo "Updated version in package.json to $NEW_VERSION"

# Update version in README.md
sed -i '' -E "s/version-[0-9]+\.[0-9]+\.[0-9]+-red\.svg/version-$NEW_VERSION-red.svg/g" README.md
sed -i '' -E "s/releases\/tag\/v[0-9]+\.[0-9]+\.[0-9]+/releases\/tag\/v$NEW_VERSION/g" README.md
sed -i '' -E "s/commits-since\/dayvar14\/obr-draw-steel\/v[0-9]+\.[0-9]+\.[0-9]+/commits-since\/dayvar14\/obr-draw-steel\/v$NEW_VERSION/g" README.md
sed -i '' -E "s/compare\/releases\/v[0-9]+\.[0-9]+\.[0-9]+/compare\/releases\/v$NEW_VERSION/g" README.md
echo "Updated version in README.md to $NEW_VERSION"

# Update version in src/config.js
sed -i '' -E "s/export const APP_VERSION = '[0-9]+\.[0-9]+\.[0-9]+'/export const APP_VERSION = '$NEW_VERSION'/" src/config.js
echo "Updated version in src/config.js to $NEW_VERSION"

echo "Version update complete!"

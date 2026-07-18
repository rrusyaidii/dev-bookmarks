#!/bin/bash
cd "C:/Users/syaid/OneDrive/Desktop/dev-bookmarks"
git commit -m "migrate from mock data to Prisma + SQLite with API routes"
git remote add origin https://github.com/rrusyaidii/dev-bookmarks.git 2>/dev/null
gh repo create rrusyaidii/dev-bookmarks --private --push --source=. --remote=origin 2>&1

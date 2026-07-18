@echo off
cd /d "C:\Users\syaid\OneDrive\Desktop\dev-bookmarks"
git add -A
git commit -m "migrate from mock data to Prisma + SQLite with API routes"
git remote add origin https://github.com/rrusyaidii/dev-bookmarks.git 2>nul
git push -u origin master
echo DONE

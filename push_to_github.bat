@echo off
set "PROJECT_DIR=C:\Users\muzid\Downloads\yummy tummy\yummy-tummy-—-zimbabwean-snacks-&-artisanal-nut-butters"
cd "%PROJECT_DIR%"
git remote remove origin 2>nul
git remote add origin https://github.com/MuziDean/yummy-tummy.git
git push -u origin main --force
echo PUSH COMPLETE
pause
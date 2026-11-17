Write-Host "=== .gitattributes check ==="
$attr = Get-ChildItem .gitattributes -ErrorAction SilentlyContinue
if ($attr) { Write-Host "Found: $($attr.FullName) $($attr.Length) bytes" } else { Write-Host ".gitattributes not found" }

Write-Host "=== local .git/config ==="
git config --local --list 2>&1 | Select-Object -First 15

Write-Host "=== global gitconfig filter/lfs lines ==="
git config --global --get-regexp 'lfs|filter' 2>&1 | Select-Object -First 10

Write-Host "=== test curl to github ==="
curl -sI https://github.com/MuziDean/yummy-tummy.git 2>&1 | Select-Object -First 10

Write-Host "=== git version ==="
git --version

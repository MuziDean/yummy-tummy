$repo = "c:\Users\muzid\Downloads\yummy tum my\yummy-tummy-—-zimbabwean-snacks-&-artisanal-nut-butters"
Set-Location $repo

Write-Host "=== Test network speed: download a small file from GitHub ==="
$url = "https://github.com/MuziDean/yummy-tummy/raw/main/index.html"
$sw = [system.diagnostics.stopwatch]::StartNew()
try {
    $content = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15
    Write-Host "Downloaded index.html in $($sw.ElapsedMilliseconds)ms"
} catch {
    Write-Host "Download failed: $($_.Exception.Message)"
}

Write-Host "=== Test push via git ==="
$env:GIT_TERMINAL_PROMPT=0
Remove-Item Env:\GIT_CURL_VERBOSE -ErrorAction SilentlyContinue
Remove-Item Env:\GIT_TRACE -ErrorAction SilentlyContinue
git push origin main 2>&1 | Select-Object -First 40

$repo = "c:\Users\muzid\Downloads\yummy tummy\yummy-tummy-—-zimbabwean-snacks-&-artisanal-nut-butters"
if (Test-Path $repo) {
    Set-Location $repo
    Write-Host "Repo path OK: $repo"
} else {
    Write-Host "Repo path NOT found"
    exit 1
}

# Create a small test file
"test-push-line" | Out-File -FilePath smalltest.txt -Encoding ASCII
git add smalltest.txt
git commit -m "Test push small file" -q
Write-Host "Committed small test file"
git log --oneline -1

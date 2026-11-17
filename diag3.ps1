$cli = "$env:USERPROFILE\.git-credentials"
if (Test-Path $cli) {
    $raw = Get-Content $cli -Raw
    foreach ($line in $raw -split "`n") {
        if ($line -match "github\.com/([^:]+):(.+)@github\.com") {
            $tok = $matches[2]
            Write-Host "Testing token: $($tok.Substring(0,10))..."
            try {
                $resp = Invoke-WebRequest -Uri "https://api.github.com/repos/MuziDean/yummy-tummy" -Headers @{"Authorization"="token $tok"} -Method Get -ErrorAction Stop
                Write-Host "API OK: $($resp.StatusCode) - $($resp.Content)"
            } catch {
                Write-Host "API failed: $($_.Exception.Message)"
            }
        }
    }
} else {
    Write-Host "No credentials file"
}


# Network & Git diagnostics
Write-Host "=== DNS RESOLVE github.com ==="
try {
    $results = Resolve-DnsName github.com -ErrorAction Stop
    $results | Select-Object -First 5 | Format-Table Name, Type, IPAddress -AutoSize
} catch {
    Write-Host "DNS failed: $_"
}

Write-Host "=== TCP CONNECT github.com:443 ==="
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $async = $tcp.BeginConnect("github.com", 443, $null, $null)
    $finished = $async.AsyncWaitHandle.WaitOne(15000, $false)
    if ($finished) {
        Write-Host "Connected OK in $($tcp.EndConnect($async).ToString())"
        $tcp.Close()
    } else {
        Write-Host "Connect timed out 15s"
        $tcp.Close()
    }
} catch {
    Write-Host "Connect failed: $_"
}

Write-Host "=== GIT LFS VERSION ==="
git lfs version 2>&1

Write-Host "=== SSH KEY CHECK ==="
if (Test-Path "$env:USERPROFILE\.ssh") {
    Get-ChildItem "$env:USERPROFILE\.ssh" | Select-Object Name, LastWriteTime, Length | Format-Table -AutoSize
} else {
    Write-Host ".ssh directory does not exist"
}

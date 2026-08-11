Write-Host "Starting traffic generator for monitored-service on port 8081..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow

$endpoints = @(
    "http://localhost:8081/api/hello",
    "http://localhost:8081/api/delay",
    "http://localhost:8081/api/error"
)

while ($true) {
    $rand = Get-Random -Minimum 0 -Maximum 10
    
    if ($rand -lt 7) {
        $url = $endpoints[0]
    }
    elseif ($rand -lt 9) {
        $url = $endpoints[1]
    }
    else {
        $url = $endpoints[2]
    }
    
    try {
        Write-Host "Sending request to $url..." -NoNewline
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        Write-Host " Success (200)" -ForegroundColor Green
    }
    catch {
        Write-Host " Error (Failed/5xx)" -ForegroundColor Red
    }
    
    $sleepSeconds = (Get-Random -Minimum 5 -Maximum 25) / 10.0
    Start-Sleep -Seconds $sleepSeconds
}

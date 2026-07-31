# Helper to manage the local ISDS dev MySQL instance (port 3307, root/no password).
# The repo uses a separate MySQL instance so the existing MySQL80 service is untouched.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/dev-db.ps1 start
#   powershell -ExecutionPolicy Bypass -File scripts/dev-db.ps1 stop
#   powershell -ExecutionPolicy Bypass -File scripts/dev-db.ps1 status

param([ValidateSet("start", "stop", "status")] [string]$Action = "status")

$mysqld = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
$dataDir = "$env:LOCALAPPDATA\isds-mysql-data"
$port = 3307

if (-not (Test-Path -LiteralPath $mysqld)) {
  Write-Error "mysqld not found at $mysqld"
  exit 1
}

function Test-Port {
  try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $iar = $tcp.BeginConnect("127.0.0.1", $port, $null, $null)
    $ok = $iar.AsyncWaitHandle.WaitOne(1500, $false)
    $tcp.Close()
    return $ok
  } catch { return $false }
}

switch ($Action) {
  "start" {
    if (Test-Port) { Write-Host "MySQL dev instance already listening on 127.0.0.1:$port" ; exit 0 }
    if (-not (Test-Path -LiteralPath "$dataDir\mysql")) {
      Write-Host "Initializing fresh MySQL data directory..."
      & $mysqld --no-defaults --initialize-insecure --datadir="$dataDir" 2>&1 | Out-Null
      if ($LASTEXITCODE -ne 0) { Write-Error "mysqld --initialize-insecure failed"; exit 1 }
    }
    Start-Process -FilePath $mysqld -ArgumentList "--no-defaults", "--datadir=$dataDir", "--port=$port", "--bind-address=127.0.0.1" -WindowStyle Hidden
    Start-Sleep -Seconds 6
    if (Test-Port) { Write-Host "MySQL dev instance running on 127.0.0.1:$port (root, no password)" }
    else { Write-Error "Failed to start MySQL dev instance. Check $dataDir\<hostname>.err"; exit 1 }
  }
  "stop" {
    $procs = Get-CimInstance Win32_Process -Filter "Name='mysqld.exe'" | Where-Object { $_.CommandLine -like "*$port*" -and $_.CommandLine -like "*$dataDir*" }
    foreach ($p in $procs) { Stop-Process -Id $p.ProcessId -Force; Write-Host "Stopped mysqld pid $($p.ProcessId)" }
    if (-not $procs) { Write-Host "No ISDS dev MySQL instance running." }
  }
  "status" {
    if (Test-Port) { Write-Host "RUNNING: MySQL dev instance on 127.0.0.1:$port (root, no password)" }
    else { Write-Host "STOPPED: MySQL dev instance (use 'start' to launch)" }
  }
}

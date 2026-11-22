param(
    [Parameter(Mandatory = $true)]
    [string]$DatabaseUrl,

    [string]$BackupDirectory = "backups"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $BackupDirectory | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = Join-Path $BackupDirectory "sevasetu-$timestamp.dump"
pg_dump $DatabaseUrl --format=custom --file=$target
Write-Output $target

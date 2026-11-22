param(
    [Parameter(Mandatory = $true)]
    [string]$DatabaseUrl,

    [Parameter(Mandatory = $true)]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"
if (-not (Test-Path $BackupFile)) {
    throw "Backup file not found: $BackupFile"
}
pg_restore --clean --if-exists --dbname=$DatabaseUrl $BackupFile

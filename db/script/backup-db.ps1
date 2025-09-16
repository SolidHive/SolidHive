# Pour executer le script : .\db\script\backup-db.ps1

# Obtenir le chemin absolu du répertoire du script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent (Split-Path -Parent $scriptPath)
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = Join-Path $projectRoot "db\backups"

# Création du dossier backups s'il n'existe pas
if (!(Test-Path -Path $backupPath)) {
    New-Item -ItemType Directory -Path $backupPath -Force
    Write-Host "Dossier backups créé : $backupPath"
}

# Création du dump
$backupFile = Join-Path $backupPath "backup_$timestamp.sql"
$dumpFile = Join-Path $projectRoot "db\dump.sql"

Write-Host "Création du backup..."
docker compose exec db pg_dump -U postgres solidhive > $backupFile

if (Test-Path $backupFile) {
    # Copie vers dump.sql
    Copy-Item $backupFile $dumpFile -Force
    Write-Host "Backup créé : $backupFile"
    Write-Host "dump.sql mis à jour : $dumpFile"
} else {
    Write-Host "Erreur : Le backup n'a pas été créé"
}
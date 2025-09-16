# Pour executer le script : .\db\script\restore-db.ps1

# Obtenir le chemin absolu du répertoire du script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent (Split-Path -Parent $scriptPath)
$dumpFile = Join-Path $projectRoot "db\dump.sql"

if (!(Test-Path -Path $dumpFile)) {
    Write-Host "Erreur : Fichier dump.sql introuvable à $dumpFile"
    exit 1
}

Write-Host "Restauration de la base de données depuis $dumpFile..."
Get-Content $dumpFile | docker compose exec -T db psql -U postgres -d solidhive

Write-Host "Base de données restaurée avec succès."
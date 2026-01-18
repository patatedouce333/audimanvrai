param(
  [string]$ApiKey
)

$ErrorActionPreference = "Stop"

Write-Host "[Audioman] Configuration Windows 11" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js n'est pas installé. Installez Node.js 20 LTS, puis relancez." -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Path ".env.local")) {
  if ([string]::IsNullOrWhiteSpace($ApiKey)) {
    $ApiKey = Read-Host "Entrez VITE_GEMINI_API_KEY"
  }
  "VITE_GEMINI_API_KEY=$ApiKey" | Out-File -Encoding utf8 ".env.local"
  Write-Host ".env.local créé." -ForegroundColor Green
} else {
  Write-Host ".env.local existe déjà." -ForegroundColor Green
}

Write-Host "Installation des dépendances..." -ForegroundColor Cyan
npm install

Write-Host "OK." -ForegroundColor Green

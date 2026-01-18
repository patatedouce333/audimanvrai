$ErrorActionPreference = "Stop"

Write-Host "[Audioman] Build production" -ForegroundColor Cyan
npm run build

Write-Host "[Audioman] Preview" -ForegroundColor Cyan
npm run preview

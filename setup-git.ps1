# Connect this project to the takunda GitHub repository
# Run this from the project root: .\setup-git.ps1

Write-Host "Initializing git repository..." -ForegroundColor Cyan
git init

Write-Host "Adding takunda remote..." -ForegroundColor Cyan
git remote add origin https://github.com/gilbJohn/takunda.git

Write-Host "Staging all files..." -ForegroundColor Cyan
git add .

Write-Host "Creating initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Next.js setup"

Write-Host "Setting main branch..." -ForegroundColor Cyan
git branch -M main

Write-Host "`nDone! To push to GitHub, run:" -ForegroundColor Green
Write-Host "  git push -u origin main" -ForegroundColor Yellow
Write-Host "`n(You may need to authenticate with GitHub)" -ForegroundColor Gray

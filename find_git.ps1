
$paths = @(
    "$env:LOCALAPPDATA\GitHubDesktop",
    "$env:ProgramFiles\Git",
    "$env:ProgramFiles(x86)\Git"
)

foreach ($path in $paths) {
    if (Test-Path $path) {
        $gitPath = Get-ChildItem -Path $path -Recurse -Filter "git.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($gitPath) {
            Write-Output $gitPath.FullName
            exit 0
        }
    }
}
Write-Output "Git not found"
exit 1

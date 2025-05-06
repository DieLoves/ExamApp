param (
    [switch]$buildPC,
    [switch]$buildAndroid,
    [switch]$buildProject
)

$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$originalWindowTitle = $host.ui.RawUI.WindowTitle

$ANDROID_BUILD_APP = "$PSScriptRoot/src-tauri/gen/android/app/build/outputs/apk/universal/release"
$ANDROID_DEFAULT_APP_NAME = "app-universal-release.apk"

$NEXT_DIR = "$PSScriptRoot/.next"
$outputPCBuild = "$PSScriptRoot\src-tauri\target\release"
$PCExeName = "tauri-app.exe"

# Rename-Item -Path "$ANDROID_BUILD_APP/app-universal-release.apk" -NewName "examapp_tech.apk"

function New-AndroidApp {
	param (
		[string]$Spec
	)

	Set-WindowTitle -Title "Create Android ($Spec) app"

	$env:NEXT_PUBLIC_APP_VERSION="$Spec"


    # Меняем productName в зависимости от Spec
    # if ($Spec -eq "tech") {
    #     bun run tauri android build --config src-tauri\tauri.android.tech.conf.json
    # } else {
        
    # }

    bun run tauri android build --config "src-tauri\tauri.$Spec.conf.json"

	$outputPath = Join-Path $ANDROID_BUILD_APP $ANDROID_DEFAULT_APP_NAME

	if (Test-Path $outputPath) {
        $newName = if ($Spec -eq "tech") { "ExamApp_Tech.apk" } else { "ExamApp_Human.apk" }

        Move-Item -Path $outputPath -Destination "build/$newName" -Force

        Write-Host "Файл переименован $newName"
    } else {
        Write-Host "Ошибка: Файл $exeName не найден в $outputDir"
    }
}

function New-PCApp {
	param (
		[string]$Spec
	)

	Set-WindowTitle -Title "Create PC ($Spec) app"

	$env:NEXT_PUBLIC_APP_VERSION="$Spec"
	
	bun run tauri build --config "src-tauri\tauri.$Spec.conf.json"

	$outputPath = Join-Path $outputPCBuild $PCExeName

	if (Test-Path $outputPath) {
        # РћРїСЂРµРґРµР»СЏРµРј РЅРѕРІРѕРµ РёРјСЏ РІ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РѕС‚ Spec
        $newName = if ($Spec -eq "tech") { "ExamApp_Tech.exe" } else { "ExamApp_Human.exe" }

        # РџРµСЂРµРёРјРµРЅРѕРІС‹РІР°РµРј
        Move-Item -Path $outputPath -Destination "build/$newName" -Force

        Write-Host "Файл переименован $newName"
    } else {
        Write-Host "Ошибка: Файл $exeName не найден в $outputDir"
    }
}

function Remove-NextDir {
	if (Test-Path $NEXT_DIR) {
		Remove-Item -Path $NEXT_DIR -Recurse -Force
		Write-Host "Папка .next найдена и удалена: $NEXT_DIR"
	} else {
		Write-Host "Папка .next не найдена: $NEXT_DIR"
	}
}

function Set-WindowTitle {
	param (
		[string]$Title
	)
	$host.ui.RawUI.WindowTitle = $Title
}

Remove-Item -Path "build/*" -Recurse -Force


if (-not $buildProject) {
    $env:NEXT_PUBLIC_APP_VERSION="human"
    Set-WindowTitle -Title "Build Human version"
    Remove-NextDir
    bun run build
    $env:NEXT_PUBLIC_APP_VERSION="tech"
    Set-WindowTitle -Title "Build Tech version"
    Remove-NextDir
    bun run build
}

if ($buildPC -or $buildAndroid) {
    if ($buildPC) {
        Remove-NextDir
        New-PCApp -Spec human
        Remove-NextDir
        New-PCApp -Spec tech
    }
    if ($buildAndroid) {
        Remove-NextDir
        New-AndroidApp -Spec human
        Remove-NextDir
        New-AndroidApp -Spec tech
    }
} else {
    Remove-NextDir
    New-PCApp -Spec human
    Remove-NextDir
    New-PCApp -Spec tech
    Remove-NextDir
    New-AndroidApp -Spec human
    Remove-NextDir
    New-AndroidApp -Spec tech
}

Set-WindowTitle -Title $originalWindowTitle

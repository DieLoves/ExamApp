#!/bin/bash

set -e

# Флаги
build_pc=false
build_android=false
build_project=false
apps_only=false

# Разбор аргументов
echo "$@"
for arg in "$@"; do
  case $arg in
    --pc) build_pc=true ;;
    --android) build_android=true ;;
    --project) build_project=true ;;
    --apps-only) apps_only=true ;;
  esac
done

# Пути
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_BUILD_APP="$SCRIPT_DIR/src-tauri/gen/android/app/build/outputs/apk/universal/release"
ANDROID_DEFAULT_APP_NAME="app-universal-release.apk"
NEXT_DIR="$SCRIPT_DIR/.next"
OUTPUT_PC_BUILD="$SCRIPT_DIR/src-tauri/target/x86_64-pc-windows-msvc/release"
PC_EXE_NAME="tauri-app.exe"

# Удалить .next
function remove_next_dir() {
  if [ -d "$NEXT_DIR" ]; then
    rm -rf "$NEXT_DIR"
    echo "Папка .next найдена и удалена: $NEXT_DIR"
  else
    echo "Папка .next не найдена: $NEXT_DIR"
  fi
}

# Сборка Android
function new_android_app() {
  local spec="$1"
  echo "Создание Android ($spec) приложения"
  export NEXT_PUBLIC_APP_VERSION="$spec"
  bun run tauri android build --config "src-tauri/tauri.$spec.conf.json"

  local output_path="$ANDROID_BUILD_APP/$ANDROID_DEFAULT_APP_NAME"
  if [ -f "$output_path" ]; then
    local new_name="ExamApp_${spec^}.apk"
    mkdir -p build
    mv -f "$output_path" "build/$new_name"
    echo "Файл переименован в $new_name"
  else
    echo "Ошибка: файл $ANDROID_DEFAULT_APP_NAME не найден в $ANDROID_BUILD_APP"
  fi
}

# Сборка под ПК
function new_pc_app() {
  local spec="$1"
  echo "Создание ПК ($spec) приложения"
  export NEXT_PUBLIC_APP_VERSION="$spec"
  bun run tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc --config "src-tauri/tauri.$spec.conf.json"

  local output_path="$OUTPUT_PC_BUILD/$PC_EXE_NAME"
  if [ -f "$output_path" ]; then
    local new_name="ExamApp_${spec^}.exe"
    mkdir -p build
    mv -f "$output_path" "build/$new_name"
    echo "Файл переименован в $new_name"
  else
    echo "Ошибка: файл $PC_EXE_NAME не найден в $OUTPUT_PC_BUILD"
  fi
}

# Удалить старые сборки
rm -rf build/*
mkdir -p build

echo $apps_only
# Сборка frontend (если не указан --project и не указан --apps-only)
if ! $build_project && ! $apps_only; then
  for spec in human tech; do
    export NEXT_PUBLIC_APP_VERSION="$spec"
    echo "Сборка frontend ($spec)"
    remove_next_dir
    bun run build
  done
fi

# Сборка приложений
if $build_pc || $build_android; then
  $build_pc && for spec in human tech; do remove_next_dir; new_pc_app "$spec"; done
  $build_android && for spec in human tech; do remove_next_dir; new_android_app "$spec"; done
else
  for spec in human tech; do
    remove_next_dir
    new_pc_app "$spec"
    remove_next_dir
    new_android_app "$spec"
  done
fi

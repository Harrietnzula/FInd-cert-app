#!/usr/bin/env sh
set -e

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$script_dir"

flask --app run.py db upgrade
exec gunicorn run:app
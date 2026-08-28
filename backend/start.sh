#!/usr/bin/env sh
set -e

flask --app run.py db upgrade
gunicorn run:app
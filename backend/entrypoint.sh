#!/bin/sh
# Debug: show current user and directory permissions
echo "Current user: $(id)"
echo "Directory permissions:"
ls -la /app
ls -la /app/db.sqlite3 || echo "db.sqlite3 not found"

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start server
echo "Starting server..."
# Using runserver for simplicity, but gunicorn is recommended for production
# exec gunicorn config.wsgi:application --bind 0.0.0.0:8000
python manage.py runserver 0.0.0.0:8000

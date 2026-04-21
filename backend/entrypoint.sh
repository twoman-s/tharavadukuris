```sh
#!/bin/sh

set -e

echo "Starting entrypoint..."

# Debug info
echo "Current user: $(id)"
echo "Listing /app directory:"
ls -la /app || true

# -------------------------------
# Prepare SQLite database (FIXED)
# -------------------------------
echo "Preparing database..."

mkdir -p /data
touch /data/db.sqlite3
chmod 666 /data/db.sqlite3

echo "Database file status:"
ls -la /data/db.sqlite3 || true

# -------------------------------
# Django setup
# -------------------------------
echo "Applying migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

# -------------------------------
# Start server
# -------------------------------
echo "Starting server..."
exec python manage.py runserver 0.0.0.0:8000
```

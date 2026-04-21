```sh
#!/bin/sh

set -e  # Exit immediately if a command fails

echo "🚀 Starting entrypoint..."

# Debug info
echo "👤 Current user: $(id)"
echo "📁 Listing /app directory:"
ls -la /app || true

# Ensure database file exists and is writable
echo "🛠 Preparing SQLite database..."
touch /app/db.sqlite3 || true
chmod 666 /app/db.sqlite3 || true

# Ensure app directory is writable (important for SQLite)
chmod -R 777 /app || true

echo "📁 Database file status:"
ls -la /app/db.sqlite3 || true

# Apply database migrations
echo "📦 Applying database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

# Start server
echo "🌐 Starting Django development server..."
exec python manage.py runserver 0.0.0.0:8000
```

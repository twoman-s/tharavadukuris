# Use Python 3.12 slim image
FROM python:3.12-slim

# -------------------------------
# Environment variables
# -------------------------------
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# -------------------------------
# Set working directory
# -------------------------------
WORKDIR /app

# -------------------------------
# Install system dependencies
# -------------------------------
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# -------------------------------
# Install Python dependencies
# -------------------------------
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# -------------------------------
# Copy project files
# -------------------------------
COPY . /app/

# -------------------------------
# Create writable directory for SQLite
# -------------------------------
RUN mkdir -p /data && chmod -R 777 /data

# -------------------------------
# Make entrypoint executable
# -------------------------------
RUN chmod +x /app/entrypoint.sh

# -------------------------------
# Expose port
# -------------------------------
EXPOSE 8000

# -------------------------------
# Entrypoint
# -------------------------------
ENTRYPOINT ["sh", "/app/entrypoint.sh"]

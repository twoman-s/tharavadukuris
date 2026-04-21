import os
import time
from django.conf import settings


def payment_screenshot_path(instance, filename):
    """
    Generate a custom file path for payment screenshots.
    Format: payments/username_MM_YYYY.extension
    If duplicate, appends timestamp.
    """
    ext = filename.split('.')[-1].lower()
    month_str = instance.payment_month.strftime('%m_%Y')
    base_name = f"{instance.user.username}_{month_str}"
    new_filename = f"{base_name}.{ext}"
    full_path = os.path.join(settings.MEDIA_ROOT, 'payments', new_filename)

    # If file already exists, append timestamp to avoid collision
    if os.path.exists(full_path):
        timestamp = int(time.time())
        new_filename = f"{base_name}_{timestamp}.{ext}"

    return os.path.join('payments', new_filename)


def rename_and_save_screenshot(payment, uploaded_file):
    """
    Manually save an uploaded screenshot with custom naming.
    Returns the relative path saved.
    """
    ext = uploaded_file.name.split('.')[-1].lower()
    month_str = payment.payment_month.strftime('%m_%Y')
    base_name = f"{payment.user.username}_{month_str}"
    new_filename = f"{base_name}.{ext}"

    upload_dir = os.path.join(settings.MEDIA_ROOT, 'payments')
    os.makedirs(upload_dir, exist_ok=True)

    full_path = os.path.join(upload_dir, new_filename)

    # If file already exists, append timestamp
    if os.path.exists(full_path):
        timestamp = int(time.time())
        new_filename = f"{base_name}_{timestamp}.{ext}"
        full_path = os.path.join(upload_dir, new_filename)

    # Write file to disk
    with open(full_path, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)

    relative_path = f"payments/{new_filename}"
    return relative_path


def rename_and_save_winner_screenshot(winner, uploaded_file):
    """
    Manually save an uploaded payment confirmation screenshot for a winner.
    Format: username_month_year_winner.extension
    Returns the relative path saved.
    """
    ext = uploaded_file.name.split('.')[-1].lower()
    
    # winner.month is in YYYY-MM format
    year, month = winner.month.split('-')
    month_str = f"{month}_{year}"
    base_name = f"{winner.user.username}_{month_str}_winner"
    new_filename = f"{base_name}.{ext}"

    upload_dir = os.path.join(settings.MEDIA_ROOT, 'winners')
    os.makedirs(upload_dir, exist_ok=True)

    full_path = os.path.join(upload_dir, new_filename)

    # If file already exists, append timestamp
    if os.path.exists(full_path):
        timestamp = int(time.time())
        new_filename = f"{base_name}_{timestamp}.{ext}"
        full_path = os.path.join(upload_dir, new_filename)

    # Write file to disk
    with open(full_path, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)

    relative_path = f"winners/{new_filename}"
    return relative_path

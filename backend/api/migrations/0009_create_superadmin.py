"""
Ensure a superadmin account exists.

Runs during `python manage.py migrate` (which is part of the deploy), so the
admin account is created regardless of whether Render has synced the start
command / environment from render.yaml. Idempotent: it updates the existing
account if one is already present.

Credentials come from env when available, else a demo default. Change the
password from the admin panel after first login for production use.
"""
import os

from django.contrib.auth.hashers import make_password
from django.db import migrations


def create_superadmin(apps, schema_editor):
    User = apps.get_model("auth", "User")

    username = (os.environ.get("SUPERADMIN_USERNAME") or "admin").strip() or "admin"
    email = (os.environ.get("SUPERADMIN_EMAIL") or "admin@genzflash.app").strip()
    password = os.environ.get("SUPERADMIN_PASSWORD") or "Admin@2026Genz"

    user, _ = User.objects.get_or_create(
        username=username,
        defaults={
            "email": email,
            "is_staff": True,
            "is_superuser": True,
            "is_active": True,
        },
    )
    user.email = email or user.email
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.password = make_password(password)
    user.save()


def noop(apps, schema_editor):
    # Reversing this migration intentionally does nothing (keep the account).
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0008_alter_newsarticle_external_url"),
    ]

    operations = [
        migrations.RunPython(create_superadmin, noop),
    ]

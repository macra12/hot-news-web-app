import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Create or update a superadmin account for this backend.'

    def add_arguments(self, parser):
        parser.add_argument('--username', default=os.getenv('SUPERADMIN_USERNAME', 'superadmin'))
        parser.add_argument('--email', default=os.getenv('SUPERADMIN_EMAIL', 'superadmin@example.com'))
        parser.add_argument('--password', default=os.getenv('SUPERADMIN_PASSWORD'))

    def handle(self, *args, **options):
        username = options['username'].strip()
        email = options['email'].strip()
        password = options['password']

        if not username:
            raise CommandError('Username cannot be empty.')

        if not password:
            # Skip quietly (exit 0) so this step never breaks the deploy chain.
            # Set SUPERADMIN_PASSWORD in the host's environment to enable it.
            self.stdout.write(self.style.WARNING(
                'SUPERADMIN_PASSWORD not set — skipping superadmin creation.'
            ))
            return

        user_model = get_user_model()
        user, created = user_model.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            },
        )

        changed = False
        if user.email != email:
            user.email = email
            changed = True
        if not user.is_staff:
            user.is_staff = True
            changed = True
        if not user.is_superuser:
            user.is_superuser = True
            changed = True
        if not user.is_active:
            user.is_active = True
            changed = True

        user.set_password(password)
        changed = True

        if changed:
            user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f'Superadmin created: {username}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Superadmin updated: {username}'))

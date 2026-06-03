from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Register signal handlers (auto-create UserProfile on user creation)
        from . import signals  # noqa: F401

        # Start the automatic background news importer (only in a server process).
        from .scheduler import start_auto_importer
        start_auto_importer()

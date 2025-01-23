from django.test.runner import DiscoverRunner
from django.conf import settings

class TestRunner(DiscoverRunner):
    def setup_test_environment(self, **kwargs):
        super().setup_test_environment(**kwargs)
        # Use in-memory email backend
        settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
        # Use local memory cache instead of Redis for testing
        settings.CACHES = {
            'default': {
                'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
                'LOCATION': 'unique-snowflake',
            }
        }
        # Disable throttling for tests
        # settings.REST_FRAMEWORK = {
        #     'DEFAULT_THROTTLE_CLASSES': [],
        #     'DEFAULT_THROTTLE_RATES': {
        #         'anon': None,
        #         'user': None,
        #         'login': None,
        #         'register': None
        #     }
        # } 
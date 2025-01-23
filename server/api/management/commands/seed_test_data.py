from django.core.management.base import BaseCommand
from api.seeds_data import create_test_data

class Command(BaseCommand):
    help = 'Seeds the database with test data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating test data...')
        create_test_data()
        self.stdout.write(self.style.SUCCESS('Successfully created test data')) 
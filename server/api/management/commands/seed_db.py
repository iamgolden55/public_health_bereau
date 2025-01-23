from django.core.management.base import BaseCommand
from api.seeds_data import seed_test_data, clear_test_data

class Command(BaseCommand):
    help = 'Seed database with test data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            clear_test_data()
        
        self.stdout.write('Seeding database...')
        seed_test_data()
        self.stdout.write(self.style.SUCCESS('Successfully seeded database')) 
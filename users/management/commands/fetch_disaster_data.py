from django.core.management.base import BaseCommand
from django.utils import timezone
from users.services import DisasterDataService
from users.models import CrisisAlert
from datetime import timedelta

class Command(BaseCommand):
    help = 'Fetch disaster and crisis data from external APIs and create system alerts'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force fetch even if recent alerts exist',
        )

    def handle(self, *args, **options):
        self.stdout.write('Starting disaster data fetch...')
        
        try:
            # Check if we should force fetch
            if not options['force']:
                # Check if we have recent system alerts (within last hour)
                recent_alerts = CrisisAlert.objects.filter(
                    is_system_generated=True,
                    created_at__gte=timezone.now() - timedelta(hours=1)
                ).count()
                
                if recent_alerts > 0:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Found {recent_alerts} recent system alerts. Use --force to fetch anyway.'
                        )
                    )
                    return

            # Fetch and create alerts
            created_alerts = DisasterDataService.create_system_alerts()
            
            if created_alerts:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully created {len(created_alerts)} new system alerts'
                    )
                )
                for alert in created_alerts:
                    self.stdout.write(f'  - {alert.title}')
            else:
                self.stdout.write(
                    self.style.WARNING('No new alerts created')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error fetching disaster data: {str(e)}')
            ) 
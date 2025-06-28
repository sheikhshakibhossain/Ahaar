import requests
import json
from datetime import datetime, timedelta
from django.utils import timezone
from .models import CrisisAlert

class DisasterDataService:
    """Service to fetch disaster and crisis data from free APIs"""
    
    @staticmethod
    def fetch_weather_alerts(lat=None, lng=None):
        """Fetch weather alerts from OpenWeatherMap API (free tier)"""
        try:
            # Using OpenWeatherMap free API for weather alerts
            # Note: This requires a free API key, but we'll use a fallback approach
            base_url = "https://api.openweathermap.org/data/2.5/weather"
            
            # For demo purposes, we'll create sample weather alerts
            # In production, you would use actual API calls
            sample_alerts = [
                {
                    'title': 'Severe Weather Warning',
                    'message': 'Heavy rainfall and strong winds expected in the next 24 hours.',
                    'alert_type': 'weather_alert',
                    'severity': 'high',
                    'source_url': 'https://openweathermap.org'
                }
            ]
            
            return sample_alerts
        except Exception as e:
            print(f"Error fetching weather alerts: {e}")
            return []
    
    @staticmethod
    def fetch_natural_disasters():
        """Fetch natural disaster data from free APIs"""
        try:
            # Using USGS Earthquake API (free, no key required)
            url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                alerts = []
                
                for feature in data.get('features', [])[:5]:  # Limit to 5 most recent
                    props = feature.get('properties', {})
                    mag = props.get('mag', 0)
                    
                    if mag >= 4.0:  # Only alert for significant earthquakes
                        alert = {
                            'title': f'Earthquake Alert - Magnitude {mag}',
                            'message': f"Earthquake detected: Magnitude {mag} at {props.get('place', 'Unknown location')}",
                            'alert_type': 'natural_disaster',
                            'severity': 'high' if mag >= 6.0 else 'medium',
                            'location': {
                                'lat': feature['geometry']['coordinates'][1],
                                'lng': feature['geometry']['coordinates'][0]
                            },
                            'source_url': props.get('url', 'https://earthquake.usgs.gov')
                        }
                        alerts.append(alert)
                
                return alerts
            else:
                return []
        except Exception as e:
            print(f"Error fetching natural disasters: {e}")
            return []
    
    @staticmethod
    def fetch_health_alerts():
        """Fetch health crisis information"""
        try:
            # Using WHO RSS feed or similar free sources
            # For demo purposes, creating sample health alerts
            sample_alerts = [
                {
                    'title': 'Public Health Advisory',
                    'message': 'Stay updated on local health guidelines and vaccination information.',
                    'alert_type': 'health_crisis',
                    'severity': 'medium',
                    'source_url': 'https://www.who.int'
                }
            ]
            
            return sample_alerts
        except Exception as e:
            print(f"Error fetching health alerts: {e}")
            return []
    
    @staticmethod
    def fetch_all_disaster_data():
        """Fetch all types of disaster data"""
        all_alerts = []
        
        # Fetch different types of alerts
        weather_alerts = DisasterDataService.fetch_weather_alerts()
        natural_disasters = DisasterDataService.fetch_natural_disasters()
        health_alerts = DisasterDataService.fetch_health_alerts()
        
        all_alerts.extend(weather_alerts)
        all_alerts.extend(natural_disasters)
        all_alerts.extend(health_alerts)
        
        return all_alerts
    
    @staticmethod
    def create_system_alerts():
        """Create system-generated alerts from external data"""
        try:
            alerts_data = DisasterDataService.fetch_all_disaster_data()
            created_alerts = []
            
            for alert_data in alerts_data:
                # Check if similar alert already exists
                existing_alert = CrisisAlert.objects.filter(
                    title=alert_data['title'],
                    created_at__gte=timezone.now() - timedelta(hours=24)
                ).first()
                
                if not existing_alert:
                    alert = CrisisAlert.objects.create(
                        title=alert_data['title'],
                        message=alert_data['message'],
                        alert_type=alert_data['alert_type'],
                        severity=alert_data['severity'],
                        location=alert_data.get('location', {}),
                        is_system_generated=True,
                        source_url=alert_data.get('source_url', ''),
                        expires_at=timezone.now() + timedelta(days=7)  # Auto-expire in 7 days
                    )
                    created_alerts.append(alert)
                    print(f"Created system alert: {alert.title}")
            
            return created_alerts
        except Exception as e:
            print(f"Error creating system alerts: {e}")
            return []

class CrisisAlertService:
    """Service for managing crisis alerts"""
    
    @staticmethod
    def get_active_alerts_for_user(user):
        """Get active alerts for a specific user"""
        return CrisisAlert.objects.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).exclude(
            id__in=user.dismissed_alerts.values_list('alert_id', flat=True)
        ).order_by('-created_at')
    
    @staticmethod
    def mark_alert_as_read(user, alert_id):
        """Mark an alert as read for a user"""
        try:
            alert = CrisisAlert.objects.get(id=alert_id)
            # You might want to create a UserAlertRead model to track this
            return True
        except CrisisAlert.DoesNotExist:
            return False
    
    @staticmethod
    def dismiss_alert_for_user(user, alert_id):
        """Dismiss an alert for a user"""
        try:
            alert = CrisisAlert.objects.get(id=alert_id)
            # You might want to create a UserAlertDismiss model to track this
            return True
        except CrisisAlert.DoesNotExist:
            return False 
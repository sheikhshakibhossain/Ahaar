from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.conf import settings
import os

class User(AbstractUser):
    DONOR = 'donor'
    RECIPIENT = 'recipient'
    
    ROLE_CHOICES = [
        (DONOR, 'Donor'),
        (RECIPIENT, 'Recipient'),
    ]
    
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default=DONOR
    )
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    is_banned = models.BooleanField(default=False)
    warning_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

class Warning(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='warnings')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Warning for {self.user.username}: {self.message[:50]}..."

class UserAlertDismiss(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dismissed_alerts')
    alert = models.ForeignKey('CrisisAlert', on_delete=models.CASCADE, related_name='dismissed_by_users')
    dismissed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'alert']
        ordering = ['-dismissed_at']

    def __str__(self):
        return f"{self.user.username} dismissed {self.alert.title}"

class CrisisAlert(models.Model):
    SEVERITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    
    TYPE_CHOICES = (
        ('natural_disaster', 'Natural Disaster'),
        ('weather_alert', 'Weather Alert'),
        ('health_crisis', 'Health Crisis'),
        ('security_alert', 'Security Alert'),
        ('system_alert', 'System Alert'),
        ('admin_alert', 'Admin Alert'),
    )
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    alert_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='admin_alert')
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='medium')
    location = models.JSONField(default=dict, blank=True)  # For location-specific alerts
    affected_areas = models.JSONField(default=list, blank=True)  # List of affected areas
    is_active = models.BooleanField(default=True)
    is_system_generated = models.BooleanField(default=False)
    source_url = models.URLField(blank=True, null=True)  # For external API sources
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)  # Auto-expire alerts
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_alert_type_display()}: {self.title}"
    
    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    def get_severity_color(self):
        severity_colors = {
            'low': 'info',
            'medium': 'warning',
            'high': 'error',
            'critical': 'error',
        }
        return severity_colors.get(self.severity, 'default')

class Donation(models.Model):
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('claimed', 'Claimed'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    )

    CATEGORY_CHOICES = (
        ('cooked', 'Cooked Food'),
        ('packaged', 'Packaged Food'),
        ('raw', 'Raw Ingredients'),
        ('other', 'Other'),
    )

    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations')
    title = models.CharField(max_length=200)
    description = models.TextField()
    quantity = models.PositiveIntegerField()
    quantity_taken = models.PositiveIntegerField(default=0)
    expiry_date = models.DateTimeField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    location = models.JSONField(default=dict)
    image = models.ImageField(upload_to='donations/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_remaining_quantity(self):
        return max(0, self.quantity - self.quantity_taken)

    def is_available(self):
        return (
            self.status == 'available' and
            self.get_remaining_quantity() > 0 and
            self.expiry_date > timezone.now()
        )

    def __str__(self):
        return f"{self.title} by {self.donor.get_full_name()}"

class DonationFeedback(models.Model):
    donation = models.ForeignKey(Donation, on_delete=models.CASCADE, related_name='feedbacks')
    recipient = models.ForeignKey('User', on_delete=models.CASCADE, related_name='given_feedbacks')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['donation', 'recipient']
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback for {self.donation.title} by {self.recipient.username}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update donor's penalty score
        self.update_donor_penalty_score()

    def update_donor_penalty_score(self):
        donor = self.donation.donor
        recent_feedbacks = DonationFeedback.objects.filter(
            donation__donor=donor,
            created_at__gte=timezone.now() - timezone.timedelta(days=30)
        )
        
        if recent_feedbacks.exists():
            avg_rating = recent_feedbacks.aggregate(models.Avg('rating'))['rating__avg']
            # Convert 1-5 rating to 0-100 penalty score (5=0 penalty, 1=100 penalty)
            donor.penalty_score = max(0, min(100, (5 - avg_rating) * 25))
            donor.save()

class DonationClaim(models.Model):
    donation = models.ForeignKey(Donation, on_delete=models.CASCADE, related_name='claims')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claims')
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('collected', 'Collected'),
            ('cancelled', 'Cancelled')
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.recipient.get_full_name()} claimed {self.quantity} of {self.donation.title}"

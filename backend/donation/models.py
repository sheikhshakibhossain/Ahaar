from django.db import models
from django.contrib.auth.models import User

class Donation(models.Model):
    DONATION_TYPES = [
        ('perishable', 'Perishable'),
        ('non_perishable', 'Non-Perishable'),
        ('prepared', 'Prepared Food'),
    ]
    
    donor = models.ForeignKey(User, on_delete=models.CASCADE)
    food_type = models.CharField(max_length=20, choices=DONATION_TYPES)
    description = models.TextField()
    quantity = models.PositiveIntegerField()
    pickup_address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateField(null=True, blank=True)
    is_claimed = models.BooleanField(default=False)
    claimed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='claimed_donations')

    def __str__(self):
        return f"{self.food_type} donation by {self.donor.username}"
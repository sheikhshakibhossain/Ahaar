from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Donation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class DonationSerializer(serializers.ModelSerializer):
    donor = UserSerializer(read_only=True)
    claimed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ['created_at', 'is_claimed', 'claimed_by']
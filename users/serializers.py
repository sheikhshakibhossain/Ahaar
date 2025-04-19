from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from users.models import Donation, DonationFeedback, DonationClaim

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'address')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'role': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'address')
        read_only_fields = ('id',)

class DonationClaimSerializer(serializers.ModelSerializer):
    recipient = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = DonationClaim
        fields = ['id', 'donation', 'recipient', 'quantity', 'status', 'status_display', 'created_at']
        read_only_fields = ['recipient', 'created_at']

class DonationSerializer(serializers.ModelSerializer):
    donor = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    remaining_quantity = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()
    claims = DonationClaimSerializer(many=True, read_only=True)

    class Meta:
        model = Donation
        fields = [
            'id', 'title', 'description', 'quantity', 'quantity_taken',
            'remaining_quantity', 'expiry_date', 'category', 'location',
            'image', 'status', 'status_display', 'donor', 'created_at',
            'is_available', 'claims'
        ]
        read_only_fields = ['donor', 'status', 'created_at']

    def get_remaining_quantity(self, obj):
        return obj.get_remaining_quantity()

    def get_is_available(self, obj):
        return obj.is_available()

class DonationFeedbackSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)

    class Meta:
        model = DonationFeedback
        fields = '__all__'
        read_only_fields = ('recipient',) 
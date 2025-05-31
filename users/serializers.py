from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from users.models import Donation, DonationFeedback, DonationClaim
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from django.contrib.auth.models import update_last_login

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
    donation_count = serializers.IntegerField(read_only=True, required=False)
    average_rating = serializers.FloatField(read_only=True, required=False)
    feedback_count = serializers.IntegerField(read_only=True, required=False)
    is_banned = serializers.BooleanField(read_only=True, default=False)
    warning_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'phone_number', 'address', 'donation_count', 
            'average_rating', 'feedback_count', 'is_banned', 
            'warning_count'
        )
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

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            username = attrs[self.username_field]
            password = attrs["password"]
            print(f"\n=== Login attempt for user: {username} ===")

            # First authenticate the user
            authenticate_kwargs = {
                self.username_field: username,
                "password": password,
            }
            try:
                authenticate_kwargs["request"] = self.context["request"]
            except KeyError:
                pass

            self.user = authenticate(**authenticate_kwargs)
            print(f"Authentication result for user {username}: {self.user is not None}")

            if not self.user:
                print(f"Authentication failed for user {username}")
                raise serializers.ValidationError({
                    "detail": "Invalid username or password"
                })

            # Check if user is banned after successful authentication
            if self.user.is_banned:
                print(f"Banned user {self.user.username} attempted to login")
                raise serializers.ValidationError({
                    "detail": "The account is banned. Please contact admin for more information.",
                    "is_banned": True,
                    "user_info": {
                        "username": self.user.username,
                        "email": self.user.email,
                        "first_name": self.user.first_name,
                        "last_name": self.user.last_name
                    }
                })

            # Generate tokens
            refresh = self.get_token(self.user)
            data = {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    'id': self.user.id,
                    'username': self.user.username,
                    'email': self.user.email,
                    'first_name': self.user.first_name,
                    'last_name': self.user.last_name,
                    'role': self.user.role,
                    'is_banned': self.user.is_banned,
                }
            }
            print(f"Login successful for user {username}")
            return data

        except serializers.ValidationError as e:
            print(f"Validation error during login: {str(e)}")
            print(f"Error detail: {e.detail}")
            raise
        except Exception as e:
            print(f"Login error: {str(e)}")
            raise serializers.ValidationError({
                "detail": "An error occurred during login. Please try again."
            }) 
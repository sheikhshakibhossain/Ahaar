from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import UserRegistrationSerializer, UserSerializer
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from .models import Donation, DonationFeedback, DonationClaim
from .serializers import DonationSerializer, DonationFeedbackSerializer, DonationClaimSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction

User = get_user_model()

# Create your views here.

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'status': 'error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            self.perform_create(serializer)
            return Response({
                'status': 'success',
                'message': 'User registered successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class DonationViewSet(ModelViewSet):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        user = self.request.user
        if user.role == 'donor':
            return Donation.objects.filter(donor=user)
        # For recipients, only show available donations
        return Donation.objects.filter(status='available')

    def perform_create(self, serializer):
        # Donation is automatically set to 'available' due to model default
        serializer.save(donor=self.request.user)

    @action(detail=False, methods=['get'])
    def claimed(self, request):
        try:
            # For recipients, show their claimed donations
            if request.user.role == 'recipient':
                claims = DonationClaim.objects.filter(
                    recipient=request.user
                ).select_related('donation').order_by('-created_at')
                
                # Get the donations from the claims
                donations = [claim.donation for claim in claims]
                serializer = self.get_serializer(donations, many=True)
                return Response(serializer.data)
            return Response(
                {'error': 'Only recipients can view claimed donations'},
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        try:
            with transaction.atomic():
                # First check if donation exists
                try:
                    donation = self.get_object()
                except Donation.DoesNotExist:
                    return Response(
                        {'error': 'Donation not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )

                # Validate quantity
                try:
                    quantity = int(request.data.get('quantity', 1))
                    if quantity < 1:
                        return Response(
                            {'error': 'Quantity must be at least 1'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except (TypeError, ValueError):
                    return Response(
                        {'error': 'Invalid quantity value'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Check if donation is available
                if not donation.is_available():
                    return Response(
                        {'error': 'This donation is not available for claiming'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Check if user has any active claims for this donation
                existing_claim = DonationClaim.objects.filter(
                    donation=donation,
                    recipient=request.user,
                    status='pending'
                ).first()
                
                if existing_claim:
                    return Response(
                        {'error': 'You have already claimed this donation'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Check if requested quantity is available
                remaining_quantity = donation.get_remaining_quantity()
                if quantity > remaining_quantity:
                    return Response(
                        {'error': f'Only {remaining_quantity} items are available'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Create the claim
                claim = DonationClaim.objects.create(
                    donation=donation,
                    recipient=request.user,
                    quantity=quantity
                )
                
                # Update donation's quantity taken
                donation.quantity_taken += quantity
                
                # Check if this was the last quantity
                if donation.quantity_taken >= donation.quantity:
                    donation.status = 'expired'
                
                donation.save()
                
                return Response({
                    'status': 'claimed',
                    'remaining_quantity': donation.get_remaining_quantity(),
                    'claim': DonationClaimSerializer(claim).data
                })
        except Exception as e:
            import traceback
            print(f"Error claiming donation: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {'error': 'An unexpected error occurred while claiming the donation'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        try:
            donation = self.get_object()
            if donation.donor != request.user:
                return Response(
                    {'error': 'Not authorized'},
                    status=status.HTTP_403_FORBIDDEN
                )
            if donation.status not in ['available']:  # Only available donations can be cancelled
                return Response(
                    {'error': 'Can only cancel available donations'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            donation.status = 'cancelled'
            donation.save()
            return Response({'status': 'cancelled'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DonationFeedbackViewSet(ModelViewSet):
    serializer_class = DonationFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DonationFeedback.objects.filter(
            donation__donor=self.request.user
        )

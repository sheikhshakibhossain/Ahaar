from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework.pagination import PageNumberPagination
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer
)
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from .models import Donation, DonationFeedback, DonationClaim, Warning, CrisisAlert, UserAlertDismiss
from .serializers import DonationSerializer, DonationFeedbackSerializer, DonationClaimSerializer, WarningSerializer, CrisisAlertSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction
from django.db.models import Avg, Count, Q
from django.utils import timezone
from django.db import models
import requests
import json
from datetime import datetime, timedelta

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
        
    def perform_create(self, serializer):
        serializer.save(recipient=self.request.user)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user data to the response
        user = self.user
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
        }
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class AdminBadDonorsView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        try:
            min_feedback = int(self.request.query_params.get('min_feedback', 3))
            max_avg_rating = float(self.request.query_params.get('max_avg_rating', 2.5))
            sort_by = self.request.query_params.get('sort_by', 'rating')
            search = self.request.query_params.get('search', '')

            # First get all donors with their feedback counts
            queryset = User.objects.filter(role='donor').annotate(
                donation_count=Count('donations', filter=~Q(donations__status='cancelled')),
                feedback_count=Count('donations__feedbacks'),
                average_rating=Avg('donations__feedbacks__rating')
            )

            # Filter by minimum feedback count and maximum average rating
            queryset = queryset.filter(
                feedback_count__gte=min_feedback,
                average_rating__lte=max_avg_rating
            )

            # Apply search filter if provided
            if search:
                queryset = queryset.filter(
                    Q(username__icontains=search) |
                    Q(email__icontains=search) |
                    Q(first_name__icontains=search) |
                    Q(last_name__icontains=search)
                )

            # Sort by rating or feedback count
            if sort_by == 'rating':
                queryset = queryset.order_by('average_rating')
            else:
                queryset = queryset.order_by('-feedback_count')

            # Debug logging
            print("QuerySet:", queryset.query)
            print("First donor in queryset:", queryset.first().__dict__ if queryset.first() else None)
            return queryset
        except Exception as e:
            print(f"Error in get_queryset: {str(e)}")
            return User.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                # Debug logging
                print("Serialized data:", serializer.data)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in list: {str(e)}")
            return Response(
                {'error': 'An error occurred while fetching donors'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminDonorActionView(generics.GenericAPIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, donor_id, action):
        try:
            donor = User.objects.get(id=donor_id, role='donor')
            
            if action == 'warn':
                # Create a warning record
                message = request.data.get('message', 'You have received a warning from the admin.')
                warning = Warning.objects.create(
                    user=donor,
                    message=message,
                    is_read=False
                )
                # Increment warning count
                donor.warning_count = (donor.warning_count or 0) + 1
                donor.save()
                return Response({'status': 'warned'})
            elif action == 'ban':
                donor.is_banned = True
                donor.save()
                return Response({'status': 'banned'})
            elif action == 'unban':
                donor.is_banned = False
                donor.save()
                return Response({'status': 'unbanned'})
            else:
                return Response(
                    {'error': 'Invalid action'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except User.DoesNotExist:
            return Response(
                {'error': 'Donor not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DonorWarningsView(generics.ListAPIView):
    serializer_class = WarningSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Warning.objects.filter(
            user=self.request.user,
            is_read=False
        ).order_by('-created_at')
        print('Found warnings:', list(queryset.values()))  # Debug log
        print('User ID:', self.request.user.id)  # Debug log
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        print('Returning warnings:', serializer.data)  # Debug log
        return Response({
            'warnings': serializer.data
        })

class AdminSendWarningView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    serializer_class = WarningSerializer

    def create(self, request, *args, **kwargs):
        donor_id = kwargs.get('donor_id')
        try:
            donor = User.objects.get(id=donor_id, role='donor')
        except User.DoesNotExist:
            return Response(
                {'error': 'Donor not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        message = request.data.get('message')
        if not message:
            return Response(
                {'error': 'Warning message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Debug logging
        print('Creating warning for donor:', donor.id)
        print('Warning message:', message)

        # Create the warning
        warning = Warning.objects.create(
            user=donor,
            message=message,
            is_read=False
        )

        # Debug logging
        print('Created warning:', warning.__dict__)
        print('Warning is_read:', warning.is_read)

        # Increment warning count
        donor.warning_count = (donor.warning_count or 0) + 1
        donor.save()

        # Debug logging
        print('Updated donor warning count:', donor.warning_count)

        serializer = self.get_serializer(warning)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class WarningDismissView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WarningSerializer

    def post(self, request, *args, **kwargs):
        warning_id = kwargs.get('warning_id')
        try:
            warning = Warning.objects.get(
                id=warning_id,
                user=request.user
            )
            warning.is_read = True
            warning.save()
            return Response({'status': 'dismissed'})
        except Warning.DoesNotExist:
            return Response(
                {'error': 'Warning not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class PublicDonationsView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = DonationSerializer

    def get_queryset(self):
        # Return only available donations that haven't expired
        return Donation.objects.filter(
            status='available',
            expiry_date__gt=timezone.now()
        ).exclude(
            quantity_taken__gte=models.F('quantity')
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class CrisisAlertViewSet(ModelViewSet):
    serializer_class = CrisisAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CrisisAlert.objects.filter(
            user=self.request.user
        )
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CrisisAlertAdminView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = CrisisAlertSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        try:
            search = self.request.query_params.get('search', '')

            # First get all alerts
            queryset = CrisisAlert.objects.all()

            # Apply search filter if provided
            if search:
                queryset = queryset.filter(
                    Q(title__icontains=search) |
                    Q(description__icontains=search)
                )

            # Sort by created_at
            queryset = queryset.order_by('-created_at')

            # Debug logging
            print("QuerySet:", queryset.query)
            print("First alert in queryset:", queryset.first().__dict__ if queryset.first() else None)
            return queryset
        except Exception as e:
            print(f"Error in get_queryset: {str(e)}")
            return CrisisAlert.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                # Debug logging
                print("Serialized data:", serializer.data)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in list: {str(e)}")
            return Response(
                {'error': 'An error occurred while fetching alerts'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, *args, **kwargs):
        """Handle DELETE requests for crisis alerts"""
        try:
            alert_id = kwargs.get('pk')
            if not alert_id:
                return Response(
                    {'error': 'Alert ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            alert = CrisisAlert.objects.get(id=alert_id)
            alert.delete()
            return Response({'message': 'Alert deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except CrisisAlert.DoesNotExist:
            return Response(
                {'error': 'Alert not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error deleting alert: {str(e)}")
            return Response(
                {'error': 'Failed to delete alert'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CrisisAlertAdminDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = CrisisAlert.objects.all()
    serializer_class = CrisisAlertSerializer

    def destroy(self, request, *args, **kwargs):
        try:
            alert = self.get_object()
            alert.delete()
            return Response({'message': 'Alert deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except CrisisAlert.DoesNotExist:
            return Response(
                {'error': 'Alert not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error deleting alert: {str(e)}")
            return Response(
                {'error': 'Failed to delete alert'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CrisisAlertUserView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CrisisAlertSerializer

    def get_queryset(self):
        # Return all active crisis alerts that the user hasn't dismissed
        return CrisisAlert.objects.filter(
            is_active=True
        ).exclude(
            dismissed_by_users__user=self.request.user
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'alerts': serializer.data
        })

class CrisisAlertAdminActionView(generics.GenericAPIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, alert_id, action):
        try:
            alert = CrisisAlert.objects.get(id=alert_id)
            
            if action == 'dismiss':
                alert.is_dismissed = True
                alert.save()
                return Response({'status': 'dismissed'})
            elif action == 'mark_read':
                alert.is_read = True
                alert.save()
                return Response({'status': 'marked_read'})
            else:
                return Response(
                    {'error': 'Invalid action'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except CrisisAlert.DoesNotExist:
            return Response(
                {'error': 'Alert not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CrisisAlertUserActionView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, alert_id, action):
        try:
            # Get the alert (crisis alerts are global, not user-specific)
            alert = CrisisAlert.objects.get(id=alert_id, is_active=True)
            
            if action == 'dismiss':
                # Create a dismiss record for this user
                UserAlertDismiss.objects.get_or_create(
                    user=request.user,
                    alert=alert
                )
                return Response({'status': 'dismissed'})
            elif action == 'mark_read':
                # For now, we'll just return success since we don't have user-specific read tracking
                return Response({'status': 'marked_read'})
            else:
                return Response(
                    {'error': 'Invalid action'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except CrisisAlert.DoesNotExist:
            return Response(
                {'error': 'Alert not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f'Error in CrisisAlertUserActionView: {str(e)}')
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CrisisAlertAdminSendView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    serializer_class = CrisisAlertSerializer

    def create(self, request, *args, **kwargs):
        title = request.data.get('title')
        message = request.data.get('message')  # Frontend sends 'message'
        description = request.data.get('description')  # Also check for 'description'
        alert_type = request.data.get('alert_type', 'admin_alert')
        severity = request.data.get('severity', 'medium')
        affected_areas = request.data.get('affected_areas', [])
        source_url = request.data.get('source_url', '')
        
        try:
            if not title or not (message or description):
                return Response(
                    {'error': 'Title and message are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Use message if provided, otherwise use description
            alert_message = message or description

            # Debug logging
            print('Creating alert with title:', title)
            print('Alert message:', alert_message)
            print('Alert type:', alert_type)
            print('Severity:', severity)

            # Create the alert
            alert = CrisisAlert.objects.create(
                title=title,
                message=alert_message,
                alert_type=alert_type,
                severity=severity,
                affected_areas=affected_areas if isinstance(affected_areas, list) else [],
                source_url=source_url,
                is_active=True,
                is_system_generated=False
            )

            # Debug logging
            print('Created alert:', alert.__dict__)

            serializer = self.get_serializer(alert)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f'Error creating alert: {str(e)}')
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CrisisAlertRefreshSystemView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request):
        try:
            from .services import DisasterDataService
            
            # Create system alerts from external data
            created_alerts = DisasterDataService.create_system_alerts()
            
            return Response({
                'message': f'Successfully refreshed system alerts. Created {len(created_alerts)} new alerts.',
                'created_count': len(created_alerts)
            })
        except Exception as e:
            print(f'Error refreshing system alerts: {str(e)}')
            return Response(
                {'error': f'Failed to refresh system alerts: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CrisisAlertUserSendView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CrisisAlertSerializer

    def create(self, request, *args, **kwargs):
        title = request.data.get('title')
        message = request.data.get('message')
        description = request.data.get('description')
        alert_type = request.data.get('alert_type', 'admin_alert')
        severity = request.data.get('severity', 'medium')
        affected_areas = request.data.get('affected_areas', [])
        source_url = request.data.get('source_url', '')
        
        try:
            if not title or not (message or description):
                return Response(
                    {'error': 'Title and message are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Use message if provided, otherwise use description
            alert_message = message or description

            # Create the alert
            alert = CrisisAlert.objects.create(
                title=title,
                message=alert_message,
                alert_type=alert_type,
                severity=severity,
                affected_areas=affected_areas if isinstance(affected_areas, list) else [],
                source_url=source_url,
                is_active=True,
                is_system_generated=False
            )

            serializer = self.get_serializer(alert)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

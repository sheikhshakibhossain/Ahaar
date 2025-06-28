from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    UserDetailView,
    DonationViewSet,
    DonationFeedbackViewSet,
    CustomTokenObtainPairView,
    AdminBadDonorsView,
    AdminDonorActionView,
    DonorWarningsView,
    AdminSendWarningView,
    WarningDismissView,
    PublicDonationsView
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'donations', DonationViewSet, basename='donation')
router.register(r'feedbacks', DonationFeedbackViewSet, basename='feedback')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
    
    # Public endpoints
    path('public/donations/', PublicDonationsView.as_view(), name='public_donations'),
    
    # Admin endpoints
    path('admin/bad-donors/', AdminBadDonorsView.as_view(), name='admin_bad_donors'),
    path('admin/donors/<int:donor_id>/<str:action>/', AdminDonorActionView.as_view(), name='admin_donor_action'),
    path('donor/warnings/', DonorWarningsView.as_view(), name='donor-warnings'),
    path('donor/warnings/<int:warning_id>/dismiss/', WarningDismissView.as_view(), name='warning-dismiss'),
    path('admin/donors/<int:donor_id>/warn/', AdminSendWarningView.as_view(), name='admin-send-warning'),
] + router.urls 
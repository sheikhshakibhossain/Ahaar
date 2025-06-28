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
    CrisisAlertViewSet,
    CrisisAlertAdminView,
    CrisisAlertUserView,
    CrisisAlertAdminActionView,
    CrisisAlertUserActionView,
    CrisisAlertAdminSendView,
    CrisisAlertUserSendView,
    CrisisAlertRefreshSystemView,
    PublicDonationsView
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'donations', DonationViewSet, basename='donation')
router.register(r'feedbacks', DonationFeedbackViewSet, basename='feedback')
router.register(r'crisis-alerts', CrisisAlertViewSet, basename='crisis-alert')

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
    
    # Crisis Alert endpoints
    path('admin/crisis-alerts/', CrisisAlertAdminView.as_view(), name='admin_crisis_alerts'),
    path('admin/crisis-alerts/<int:alert_id>/<str:action>/', CrisisAlertAdminActionView.as_view(), name='admin_crisis_alert_action'),
    path('admin/crisis-alerts/send/', CrisisAlertAdminSendView.as_view(), name='admin_send_crisis_alert'),
    path('user/crisis-alerts/', CrisisAlertUserView.as_view(), name='user_crisis_alerts'),
    path('user/crisis-alerts/<int:alert_id>/<str:action>/', CrisisAlertUserActionView.as_view(), name='user_crisis_alert_action'),
    path('user/crisis-alerts/send/', CrisisAlertUserSendView.as_view(), name='user_send_crisis_alert'),
    path('admin/crisis-alerts/refresh-system/', CrisisAlertRefreshSystemView.as_view(), name='admin_refresh_crisis_system'),
] + router.urls 
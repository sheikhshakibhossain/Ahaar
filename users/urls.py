from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserDetailView, DonationViewSet, DonationFeedbackViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'donations', DonationViewSet, basename='donation')
router.register(r'feedbacks', DonationFeedbackViewSet, basename='feedback')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
] + router.urls 
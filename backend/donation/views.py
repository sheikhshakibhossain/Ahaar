from rest_framework import viewsets, permissions
from .models import Donation
from .serializers import DonationSerializer
from rest_framework.response import Response
from rest_framework.decorators import action

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(donor=self.request.user)

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        donation = self.get_object()
        if donation.is_claimed:
            return Response({'status': 'already claimed'})
        donation.is_claimed = True
        donation.claimed_by = request.user
        donation.save()
        return Response({'status': 'successfully claimed'})
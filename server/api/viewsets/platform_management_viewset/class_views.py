from ..imports import *
from ..mixin import StandardResultsSetPagination

# Custom viewset
class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser
    
class IsHospitalAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            staff = HospitalStaff.objects.get(user=request.user)
            return staff.role == 'ADMIN'
        except HospitalStaff.DoesNotExist:
            return False    

# ============= Platform Management ViewSets =============
class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    @action(detail=False, methods=['get'])
    def active_plans(self, request):
        queryset = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class HospitalSubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = HospitalSubscriptionSerializer
    permission_classes = [IsAuthenticated, IsHospitalAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return HospitalSubscription.objects.all()
        try:
            staff = HospitalStaff.objects.get(user=user)
            return HospitalSubscription.objects.filter(hospital=staff.hospital)
        except HospitalStaff.DoesNotExist:
            return HospitalSubscription.objects.none()

    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        subscription = self.get_object()
        try:
            subscription.renew()
            return Response({'status': 'subscription renewed'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class PlatformRevenueViewSet(viewsets.ModelViewSet):
    serializer_class = PlatformRevenueSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return PlatformRevenue.objects.all()

    @action(detail=False, methods=['get'])
    def revenue_statistics(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = self.get_queryset()
        if start_date:
            queryset = queryset.filter(transaction_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(transaction_date__lte=end_date)

        stats = queryset.aggregate(
            total_revenue=Sum('platform_earning'),
            average_revenue=Avg('platform_earning'),
            total_transactions=Count('id')
        )
        return Response(stats)

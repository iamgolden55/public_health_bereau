from ..imports import *

#===========Device Management ViewSets ================
class MedicalDeviceViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalDeviceSerializer
    permission_classes = [IsAuthenticated, IsHospitalStaff]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return MedicalDevice.objects.all()
        return MedicalDevice.objects.filter(
            hospital=user.hospitalstaff.hospital
        )

    @action(detail=True, methods=['post'])
    def schedule_maintenance(self, request, pk=None):
        device = self.get_object()
        maintenance_date = request.data.get('maintenance_date')
        if maintenance_date:
            device.next_maintenance = maintenance_date
            device.status = 'MAINTENANCE'
            device.save()
            return Response({'status': 'maintenance scheduled'})
        return Response(
            {'error': 'maintenance date required'},
            status=status.HTTP_400_BAD_REQUEST
        )

class DeviceReadingViewSet(viewsets.ModelViewSet):
    serializer_class = DeviceReadingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'medicalprofessional'):
            return DeviceReading.objects.filter(
                device__hospital=user.medicalprofessional.hospital
            )
        return DeviceReading.objects.filter(patient=user)

    @action(detail=False, methods=['get'])
    def abnormal_readings(self, request):
        queryset = self.get_queryset().filter(is_abnormal=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

from ..imports import *
# Mixins
from ..mixin import StandardResultsSetPagination
class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['patient__first_name', 'patient__last_name', 'reason']
    ordering_fields = ['appointment_date', 'status']
    def get_queryset(self):
        user = self.request.user
        base_queryset = Appointment.objects.select_related(
            'patient', 
            'provider', 
            'hospital', 
            'gp', 
            'practice'
        )  # Performance optimization
        
        if hasattr(user, 'medicalprofessional'):
            return base_queryset.filter(
                Q(provider=user.medicalprofessional) |
                Q(gp=user.medicalprofessional.generalpartitioner)
            )
        return base_queryset.filter(patient=user)

    # Add new actions
    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """Get available appointment slots for a GP/practice"""
        practice_id = request.query_params.get('practice_id')
        gp_id = request.query_params.get('gp_id')
        date = request.query_params.get('date')
        
        if not practice_id:
            return Response(
                {"error": "Practice ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            practice = GPPractice.objects.get(id=practice_id)
            slots = practice.get_available_slots(date, gp_id)
            return Response(slots)
        except GPPractice.DoesNotExist:
            return Response(
                {"error": "Practice not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        """Reschedule an existing appointment"""
        appointment = self.get_object()
        new_date = request.data.get('new_date')
        
        if not new_date:
            return Response(
                {"error": "New date is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            appointment.appointment_date = new_date
            appointment.save()
            return Response(self.get_serializer(appointment).data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'medicalprofessional'):
            return Appointment.objects.filter(provider=user.medicalprofessional)
        return Appointment.objects.filter(patient=user)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        queryset = self.get_queryset().filter(
            appointment_date__gte=timezone.now(),
            status='SCHEDULED'
        ).order_by('appointment_date')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'CANCELLED'
        appointment.save()
        return Response({'status': 'appointment cancelled'})

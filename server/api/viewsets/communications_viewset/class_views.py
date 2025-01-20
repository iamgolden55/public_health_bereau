from ..imports import *

# ============ Communication ViewSets ============
# custom viewset
class IsHospitalAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            staff = HospitalStaff.objects.get(user=request.user)
            return staff.role == 'ADMIN'
        except HospitalStaff.DoesNotExist:
            return False
# Communication ViewSets
class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user) | Q(recipient=user)
        )

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        message = self.get_object()
        if message.recipient == request.user:
            message.is_read = True
            message.save()
            return Response({'status': 'message marked as read'})
        return Response(
            {'error': 'unauthorized'},
            status=status.HTTP_403_FORBIDDEN
        )

class TelemedicineSessionViewSet(viewsets.ModelViewSet):
    serializer_class = TelemedicineSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'medicalprofessional'):
            return TelemedicineSession.objects.filter(doctor=user.medicalprofessional)
        return TelemedicineSession.objects.filter(patient=user)

    @action(detail=True, methods=['post'])
    def start_session(self, request, pk=None):
        session = self.get_object()
        if session.status == 'SCHEDULED':
            session.status = 'IN_PROGRESS'
            session.save()
            return Response({'session_url': session.session_url})
        return Response(
            {'error': 'Invalid session status'},
            status=status.HTTP_400_BAD_REQUEST
        )

# Task Management ViewSets
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(
            Q(assigned_to=user) | Q(created_by=user)
        )

    @action(detail=True, methods=['post'])
    def complete_task(self, request, pk=None):
        task = self.get_object()
        task.status = 'COMPLETED'
        task.completed_at = timezone.now()
        task.save()
        return Response({'status': 'task completed'})

class ProtocolViewSet(viewsets.ModelViewSet):
    serializer_class = ProtocolSerializer
    permission_classes = [IsAuthenticated, IsHospitalAdmin]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Protocol.objects.all()
        return Protocol.objects.filter(
            department=self.request.user.hospitalstaff.department
        )

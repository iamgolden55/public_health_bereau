from ..imports import *
from rest_framework.pagination import PageNumberPagination

# Mixins
from ..mixin import StandardResultsSetPagination

# ============= Financial Management ViewSets =============
class InsuranceViewSet(viewsets.ModelViewSet):
    serializer_class = InsuranceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Insurance.objects.all()
        return Insurance.objects.filter(Q(bills__patient=user)).distinct()

class BillViewSet(viewsets.ModelViewSet):
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'medicalprofessional'):
            return Bill.objects.filter(provider=user.medicalprofessional)
        return Bill.objects.filter(patient=user)

    @action(detail=False, methods=['get'])
    def outstanding(self, request):
        queryset = self.get_queryset().filter(
            status__in=['PENDING', 'OVERDUE']
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        bill = self.get_object()
        payment_amount = request.data.get('amount')
        payment_method = request.data.get('method')

        try:
            if payment_amount:
                bill.process_payment(float(payment_amount), payment_method)
                return Response({'status': 'payment processed'})
            return Response(
                {'error': 'Payment amount required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class BusinessRules:
    @staticmethod
    def can_schedule_surgery(user: Any, surgery_type: Any) -> bool:
        """
        Determines if a user can schedule a surgery
        """
        if not hasattr(user, 'medicalprofessional'):
            return False
            
        if surgery_type.risk_level == 'HIGH' and not user.medicalprofessional.is_senior:
            return False
            
        return True

    @staticmethod
    def requires_additional_approval(surgery: Any) -> bool:
        """
        Determines if surgery requires additional approval
        """
        conditions = [
            surgery.priority == 'EMERGENCY',
            surgery.surgery_type.risk_level == 'HIGH',
            surgery.patient.is_high_risk,
            surgery.estimated_duration > timedelta(hours=6)
        ]
        return any(conditions)

    @staticmethod
    def calculate_resource_requirements(surgery: Any) -> Dict[str, Any]:
        """
        Calculates required resources for surgery
        """
        base_requirements = surgery.surgery_type.equipment_needed
        additional_requirements = []

        if surgery.patient.is_high_risk:
            additional_requirements.extend(['monitoring_equipment', 'backup_power'])
            
        if surgery.surgery_type.risk_level == 'HIGH':
            additional_requirements.extend(['specialized_tools', 'backup_equipment'])

        return {
            'equipment': base_requirements + additional_requirements,
            'staff': {
                'surgeons': 2 if surgery.surgery_type.risk_level == 'HIGH' else 1,
                'nurses': 3 if surgery.patient.is_high_risk else 2,
                'anesthesiologists': 1
            },
            'operating_room': 'specialized' if surgery.surgery_type.risk_level == 'HIGH' else 'standard'
        }

    @staticmethod
    def check_scheduling_conflicts(new_surgery: Any) -> List[Dict[str, Any]]:
        """
        Checks for scheduling conflicts
        """
        conflicts = []
        buffer_time = timedelta(minutes=30)
        
        # Check operating room availability
        room_conflicts = SurgerySchedule.objects.filter(
            operating_room=new_surgery.operating_room,
            scheduled_date__range=(
                new_surgery.scheduled_date - buffer_time,
                new_surgery.scheduled_date + new_surgery.estimated_duration + buffer_time
            )
        )
        
        if room_conflicts.exists():
            conflicts.append({
                'type': 'operating_room',
                'details': 'Operating room is not available'
            })

        # Check team availability
        for team_member in new_surgery.team_members.all():
            member_conflicts = SurgerySchedule.objects.filter(
                surgicalteam__member=team_member,
                scheduled_date__range=(
                    new_surgery.scheduled_date - buffer_time,
                    new_surgery.scheduled_date + new_surgery.estimated_duration + buffer_time
                )
            )
            
            if member_conflicts.exists():
                conflicts.append({
                    'type': 'team_member',
                    'details': f'{team_member.user.get_full_name()} is not available'
                })

        return conflicts

    @staticmethod
    def get_priority_score(surgery: Any) -> int:
        """
        Calculates priority score for surgery scheduling
        """
        score = 0
        
        # Base priority
        priority_scores = {
            'EMERGENCY': 100,
            'URGENT': 50,
            'ELECTIVE': 10
        }
        score += priority_scores[surgery.priority]
        
        # Risk factors
        if surgery.patient.is_high_risk:
            score += 20
        
        if surgery.surgery_type.risk_level == 'HIGH':
            score += 15
            
        # Wait time
        days_waiting = (timezone.now() - surgery.created_at).days
        score += min(days_waiting, 30)  # Cap at 30 days
        
        return score        
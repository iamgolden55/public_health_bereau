from ..imports import *

# Mixins
from ..mixin import StandardResultsSetPagination

# Custom viewset
# ============= Surgery Management ViewSets =============

class SurgeryTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing surgery types.
    Only hospital admins can create/update, others can view.
    """
    queryset = SurgeryType.objects.all()
    serializer_class = SurgeryTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsHospitalAdmin()]
        return [permissions.IsAuthenticated()]

class SurgeryScheduleViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing surgery schedules.
    Provides different views based on user role.
    """
    serializer_class = SurgeryScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # If user is a patient
        if not hasattr(user, 'medicalprofessional'):
            return SurgerySchedule.objects.filter(patient=user)
        
        # If user is a medical professional
        professional = user.medicalprofessional
        return SurgerySchedule.objects.filter(
            Q(lead_surgeon=professional) |
            Q(surgicalteam__member=professional)
        ).distinct()

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming surgeries"""
        queryset = self.get_queryset().filter(
            scheduled_date__gte=timezone.now(),
            status__in=['SCHEDULED', 'PREPARATION']
        ).order_by('scheduled_date')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's surgeries"""
        today = timezone.now().date()
        queryset = self.get_queryset().filter(
            scheduled_date__date=today
        ).order_by('scheduled_date')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def emergency(self, request):
        """Get emergency surgeries"""
        queryset = self.get_queryset().filter(
            priority='EMERGENCY',
            status__in=['SCHEDULED', 'PREPARATION']
        ).order_by('scheduled_date')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update surgery status"""
        surgery = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(SurgerySchedule.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        surgery.status = new_status
        surgery.save()
        return Response(self.get_serializer(surgery).data)

class SurgicalTeamViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing surgical teams.
    """
    serializer_class = SurgicalTeamSerializer
    permission_classes = [permissions.IsAuthenticated, IsMedicalProfessional]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return SurgicalTeam.objects.all()
            
        professional = user.medicalprofessional
        return SurgicalTeam.objects.filter(
            Q(member=professional) |
            Q(surgery__lead_surgeon=professional)
        )

    @action(detail=True, methods=['post'])
    def confirm_availability(self, request, pk=None):
        """Team member confirms availability for surgery"""
        team_member = self.get_object()
        
        if team_member.member != request.user.medicalprofessional:
            return Response(
                {'error': 'Unauthorized'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        team_member.is_confirmed = True
        team_member.save()
        return Response(self.get_serializer(team_member).data)

class PreOpAssessmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing pre-operative assessments.
    """
    serializer_class = PreOpAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsMedicalProfessional]

    def get_queryset(self):
        if self.request.user.is_staff:
            return PreOpAssessment.objects.all()
            
        professional = self.request.user.medicalprofessional
        return PreOpAssessment.objects.filter(
            Q(assessed_by=professional) |
            Q(surgery__lead_surgeon=professional)
        )

    @action(detail=True, methods=['post'])
    def update_clearance(self, request, pk=None):
        """Update surgery clearance status"""
        assessment = self.get_object()
        new_status = request.data.get('clearance_status')
        
        if new_status not in dict(PreOpAssessment.CLEARANCE_CHOICES):
            return Response(
                {'error': 'Invalid clearance status'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        assessment.clearance_status = new_status
        assessment.save()
        return Response(self.get_serializer(assessment).data)

class SurgeryReportViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing surgery reports.
    """
    serializer_class = SurgeryReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsMedicalProfessional]

    def get_queryset(self):
        user = self.request.user
        
        # If user is a patient
        if not hasattr(user, 'medicalprofessional'):
            return SurgeryReport.objects.filter(surgery__patient=user)
            
        # If user is a medical professional
        professional = user.medicalprofessional
        return SurgeryReport.objects.filter(
            Q(recorded_by=professional) |
            Q(surgery__lead_surgeon=professional)
        )

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user.medicalprofessional)

class PostOpCareViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing post-operative care.
    """
    serializer_class = PostOpCareSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # If user is a patient
        if not hasattr(user, 'medicalprofessional'):
            return PostOpCare.objects.filter(surgery__patient=user)
            
        # If user is a medical professional
        professional = user.medicalprofessional
        return PostOpCare.objects.filter(
            Q(surgery__lead_surgeon=professional) |
            Q(surgery__surgicalteam__member=professional)
        ).distinct()

    @action(detail=True, methods=['post'])
    def update_vital_signs(self, request, pk=None):
        """Update patient's vital signs"""
        post_op_care = self.get_object()
        vital_signs = request.data.get('vital_signs')
        
        if not vital_signs:
            return Response(
                {'error': 'Vital signs data required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        post_op_care.vital_signs_log.append({
            'timestamp': timezone.now().isoformat(),
            'values': vital_signs
        })
        post_op_care.save()
        return Response(self.get_serializer(post_op_care).data)

class SurgeryConsentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing surgery consents.
    """
    serializer_class = SurgeryConsentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # If user is a patient
        if not hasattr(user, 'medicalprofessional'):
            return SurgeryConsent.objects.filter(patient=user)
            
        # If user is a medical professional
        professional = user.medicalprofessional
        return SurgeryConsent.objects.filter(
            surgery__lead_surgeon=professional
        )

    @action(detail=True, methods=['post'])
    def verify_consent(self, request, pk=None):
        """Verify patient's surgery consent"""
        consent = self.get_object()
        consent.is_valid = True
        consent.signed_at = timezone.now()
        consent.save()
        return Response(self.get_serializer(consent).data)

class SurgeryValidators:
    @staticmethod
    def validate_surgery_schedule(data: Dict[str, Any]) -> None:
        """
        Validates surgery scheduling requirements
        """
        scheduled_date = data.get('scheduled_date')
        duration = data.get('estimated_duration')
        surgery_type = data.get('surgery_type')
        operating_room = data.get('operating_room')

        # Time validation
        if scheduled_date < timezone.now():
            raise ValidationError("Cannot schedule surgery in the past")

        # Business hours validation (except emergency)
        if data.get('priority') != 'EMERGENCY':
            schedule_time = scheduled_date.time()
            if schedule_time.hour < 8 or schedule_time.hour > 17:
                raise ValidationError("Regular surgeries must be scheduled between 8 AM and 5 PM")

        # Weekend validation (except emergency)
        if data.get('priority') != 'EMERGENCY' and scheduled_date.weekday() in [5, 6]:
            raise ValidationError("Regular surgeries cannot be scheduled on weekends")

        # Duration validation
        if duration > timedelta(hours=12):
            raise ValidationError("Surgery duration cannot exceed 12 hours")

        # Equipment validation
        required_equipment = surgery_type.equipment_needed
        if not all(equipment in operating_room.available_equipment for equipment in required_equipment):
            raise ValidationError("Operating room does not have required equipment")

    @staticmethod
    def validate_surgical_team(data: Dict[str, Any]) -> None:
        """
        Validates surgical team composition and availability
        """
        team_members = data.get('team_members', [])
        surgery_type = data.get('surgery_type')
        surgery_date = data.get('scheduled_date')

        # Required roles validation
        required_roles = {
            'SURGEON': 1,
            'ANESTHESIOLOGIST': 1,
            'SCRUB_NURSE': 1,
            'CIRCULATING_NURSE': 1
        }

        team_roles = {}
        for member in team_members:
            role = member.get('role')
            team_roles[role] = team_roles.get(role, 0) + 1

        for role, count in required_roles.items():
            if team_roles.get(role, 0) < count:
                raise ValidationError(f"Team must have at least {count} {role}")

        # Specialization validation
        lead_surgeon = next(m for m in team_members if m['role'] == 'SURGEON')
        if surgery_type.specialization_required not in lead_surgeon.specializations:
            raise ValidationError("Lead surgeon does not have required specialization")

        # Availability validation
        for member in team_members:
            if not member.is_available(surgery_date):
                raise ValidationError(f"Team member {member.user.get_full_name()} is not available")

    @staticmethod
    def validate_pre_op_assessment(data: Dict[str, Any]) -> None:
        """
        Validates pre-operative assessment requirements
        """
        surgery_date = data['surgery'].scheduled_date
        assessment_date = data.get('assessment_date')
        vital_signs = data.get('vital_signs', {})

        # Timing validation
        time_until_surgery = surgery_date - timezone.now()
        if time_until_surgery < timedelta(days=1):
            raise ValidationError("Pre-op assessment must be completed at least 24 hours before surgery")

        # Required vital signs validation
        required_vitals = {'blood_pressure', 'heart_rate', 'temperature', 'oxygen_saturation'}
        if not all(vital in vital_signs for vital in required_vitals):
            raise ValidationError("All required vital signs must be recorded")

        # Vital signs range validation
        if not (60 <= vital_signs.get('heart_rate', 0) <= 100):
            raise ValidationError("Heart rate out of normal range")
        
        if not (35.5 <= vital_signs.get('temperature', 0) <= 37.5):
            raise ValidationError("Temperature out of normal range")
        
        if not (95 <= vital_signs.get('oxygen_saturation', 0) <= 100):
            raise ValidationError("Oxygen saturation out of normal range")

    @staticmethod
    def validate_post_op_care(data: Dict[str, Any]) -> None:
        """
        Validates post-operative care requirements
        """
        surgery_end = data['surgery'].report.end_time
        vital_signs_log = data.get('vital_signs_log', [])
        
        # Minimum monitoring period
        if surgery_end + timedelta(hours=24) > timezone.now():
            required_interval = 15  # minutes
        else:
            required_interval = 60  # minutes

        # Validate monitoring frequency
        last_check = None
        for log in vital_signs_log:
            current_check = datetime.fromisoformat(log['timestamp'])
            if last_check and (current_check - last_check).minutes > required_interval:
                raise ValidationError(f"Vital signs must be checked every {required_interval} minutes")
            last_check = current_check
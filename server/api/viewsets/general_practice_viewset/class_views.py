from ..imports import *

#mixins
from ..mixin import StandardResultsSetPagination

class GPPracticeViewSet(viewsets.ModelViewSet):
    serializer_class = GPPracticeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = GPPractice.objects.all()
        
        # Filter by postcode if provided
        postcode = self.request.query_params.get('postcode', None)
        if postcode:
            queryset = queryset.filter(postcode__startswith=postcode)
        
        # Filter by city
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__icontains=city)
            
        # Filter accepting patients
        accepting = self.request.query_params.get('accepting', None)
        if accepting:
            queryset = queryset.filter(is_accepting_patients=accepting.lower() == 'true')
            
        return queryset

    @action(detail=True, methods=['post'])
    def register_patient(self, request, pk=None):
        practice = self.get_object()
        patient = request.user
        
        # Check if practice is accepting patients
        if not practice.is_accepting_patients:
            return Response(
                {"error": "This practice is not accepting new patients"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Check if patient already registered
        if PatientGPRegistration.objects.filter(
            patient=patient,
            status='ACTIVE'
        ).exists():
            return Response(
                {"error": "Patient already registered with a GP practice"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Create registration
            registration = PatientGPRegistration.objects.create(
                patient=patient,
                practice=practice,
                status='PENDING'
            )
            
            return Response({
                "message": "Registration request submitted successfully",
                "registration_id": registration.id
            })
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def available_appointments(self, request, pk=None):
        practice = self.get_object()
        start_date = request.query_params.get('start_date', datetime.now().date())
        end_date = request.query_params.get('end_date', datetime.now().date() + timedelta(days=14))
        
        available_slots = []
        for gp in practice.gp_doctors.filter(is_accepting_appointments=True):
            slots = gp.get_available_slots(start_date, end_date)
            available_slots.extend(slots)
            
        return Response(available_slots)

class GeneralPractitionerViewSet(viewsets.ModelViewSet):
    serializer_class = GeneralPractitionerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = GeneralPractitioner.objects.all()
        
        # Filter by practice
        practice_id = self.request.query_params.get('practice_id', None)
        if practice_id:
            queryset = queryset.filter(practice_id=practice_id)
            
        # Filter by specialization
        specialization = self.request.query_params.get('specialization', None)
        if specialization:
            queryset = queryset.filter(specializations__contains=[specialization])
            
        return queryset

    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        gp = self.get_object()
        start_date = request.query_params.get('start_date', datetime.now().date())
        end_date = request.query_params.get('end_date', datetime.now().date() + timedelta(days=7))
        
        schedule = gp.get_schedule(start_date, end_date)
        return Response(schedule)

    @action(detail=True, methods=['get'])
    def patient_list(self, request, pk=None):
        gp = self.get_object()
        if request.user != gp.user and not request.user.is_staff:
            return Response(
                {"error": "Not authorized to view patient list"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        patients = gp.assigned_patients.all()
        serializer = PatientSerializer(patients, many=True)
        return Response(serializer.data)

class PatientGPRegistrationViewSet(viewsets.ModelViewSet):
    serializer_class = PatientGPRegistrationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return PatientGPRegistration.objects.all()
        return PatientGPRegistration.objects.filter(patient=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        registration = self.get_object()
        
        # Check if user has permission to approve
        if not request.user.has_perm('api.approve_gpregistration'):
            return Response(
                {"error": "Not authorized to approve registrations"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            # Update registration status
            registration.status = 'ACTIVE'
            registration.save()
            
            # Update patient's GP information
            patient = registration.patient
            patient.has_registered_gp = True
            patient.current_gp_practice = registration.practice
            patient.save()
            
            return Response({"message": "Registration approved successfully"})
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def transfer(self, request, pk=None):
        registration = self.get_object()
        new_practice_id = request.data.get('new_practice_id')
        
        if not new_practice_id:
            return Response(
                {"error": "New practice ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            new_practice = GPPractice.objects.get(id=new_practice_id)
            
            # Create new registration
            PatientGPRegistration.objects.create(
                patient=registration.patient,
                practice=new_practice,
                status='PENDING',
                previous_practice=registration.practice
            )
            
            # Update old registration
            registration.status = 'TRANSFERRED'
            registration.save()
            
            return Response({"message": "Transfer request submitted successfully"})
            
        except GPPractice.DoesNotExist:
            return Response(
                {"error": "Invalid practice ID"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
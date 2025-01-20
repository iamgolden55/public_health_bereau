from ..imports import *

#mixins
from ..mixin import StandardResultsSetPagination
 
# ============= Medical Management ViewSets ================

class SpecialtyClinicViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = MedicalCase.objects.all()
    serializer_class = MedicalCaseSerializer

    def get_queryset(self):
        """Filter cases based on user's department/role"""
        user = self.request.user
        
        if user.is_superuser:
            return MedicalCase.objects.all()
        
        try:
            professional = user.medicalprofessional
            return MedicalCase.objects.filter(department=professional.department)
        except MedicalProfessional.DoesNotExist:
            return MedicalCase.objects.none()

    @action(detail=True, methods=['post'])
    def rotate_3d(self, request, pk=None):
        """Handle 3D image rotation"""
        try:
            image = self.get_object()
            angles = request.data.get('angles', [0, 0, 0])
            
            # Validate angles
            if not all(isinstance(angle, (int, float)) for angle in angles):
                raise ValidationError("Invalid angle values")
            
            # Load image data and apply rotation
            image_data = np.frombuffer(image.image_data, dtype=np.float32)
            image_data = image_data.reshape(image.metadata['dimensions'])
            
            # Apply 3D rotation using scipy
            rotated_data = image_data
            axes_pairs = [(1, 2), (0, 2), (0, 1)]
            
            for angle, axes in zip(angles, axes_pairs):
                rotated_data = rotate(rotated_data, angle, axes=axes, reshape=False)
            
            return Response({
                'data': rotated_data.tobytes(),
                'dimensions': rotated_data.shape
            })
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def export_case(self, request, pk=None):
        """Export medical case data"""
        try:
            case = self.get_object()
            
            # Create ZIP file in memory
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                # Add case metadata
                metadata = {
                    'title': case.title,
                    'patient_id': case.patient.id,
                    'department': case.department,
                    'findings': case.findings,
                    'annotations': case.annotations,
                    'exported_at': datetime.now().isoformat(),
                    'exported_by': request.user.get_full_name()
                }
                zip_file.writestr('metadata.json', json.dumps(metadata))
                
                # Add images
                for i, image in enumerate(case.images.all()):
                    # Handle different image formats
                    if image.metadata.get('format') == 'DICOM':
                        # Save as DICOM
                        dcm = pydicom.Dataset()
                        # Set DICOM attributes
                        dcm.PixelData = image.image_data
                        zip_file.writestr(f'image_{i}.dcm', dcm.to_bytes())
                    else:
                        # Save as raw data with metadata
                        zip_file.writestr(f'image_{i}.raw', image.image_data)
                        zip_file.writestr(
                            f'image_{i}_metadata.json',
                            json.dumps(image.metadata)
                        )
            
            # Prepare response
            zip_buffer.seek(0)
            response = FileResponse(
                zip_buffer,
                content_type='application/zip',
                as_attachment=True,
                filename=f'case_{pk}.zip'
            )
            
            # Log export
            case.export_logs.create(
                user=request.user,
                timestamp=datetime.now()
            )
            
            return response
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def share_case(self, request, pk=None):
        """Share case with other medical professionals"""
        try:
            case = self.get_object()
            recipients = request.data.get('recipients', [])
            
            if not recipients:
                raise ValidationError("No recipients provided")
            
            # Validate recipients
            valid_recipients = []
            for recipient in recipients:
                try:
                    professional = MedicalProfessional.objects.get(
                        user__email=recipient,
                        is_verified=True
                    )
                    valid_recipients.append(recipient)
                except MedicalProfessional.DoesNotExist:
                    continue
            
            if not valid_recipients:
                raise ValidationError("No valid recipients found")
            
            # Generate secure sharing links
            sharing_links = []
            for recipient in valid_recipients:
                link = generate_secure_link(case, recipient)
                sharing_links.append(link)
                
                # Send notification
                send_case_share_notification(recipient, case, link)
            
            return Response({
                'status': 'success',
                'sharing_links': sharing_links
            })
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def department_stats(self, request, pk=None):
        """Get department statistics and cases"""
        try:
            department = self.get_object()
            
            # Get active cases count
            active_cases = department.medicalcase_set.filter(
                status__in=['OPEN', 'IN_PROGRESS']
            ).count()
            
            # Get specialists
            specialists = department.specialists.filter(
                is_verified=True
            ).select_related('user')
            
            # Get recent cases
            recent_cases = department.medicalcase_set.all()\
                .order_by('-created_at')[:5]
            
            return Response({
                'active_cases': active_cases,
                'specialists': BasicDepartmentSerializer(
                    specialists,
                    many=True,
                    context={'request': request}
                ).data,
                'recent_cases': MedicalCaseSerializer(
                    recent_cases,
                    many=True,
                    context={'request': request}
                ).data,
                'statistics': {
                    'total_patients': department.medicalcase_set.values(
                        'patient'
                    ).distinct().count(),
                    'avg_case_duration': department.get_avg_case_duration(),
                    'success_rate': department.get_success_rate()
                }
            })
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['patient__first_name', 'patient__last_name', 'reason']
    ordering_fields = ['appointment_date', 'status']

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

class MedicalRecordViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated, IsMedicalProfessional]

    def get_queryset(self):
        user = self.request.user
        
        # If user is a medical professional
        try:
            medical_professional = user.medicalprofessional
            return MedicalRecord.objects.filter(
                Q(hospital=medical_professional.hospital) |
                Q(recorded_by=medical_professional)
            )
        except:
            # If user is a patient
            return MedicalRecord.objects.filter(patient__id=user.id)

    def perform_create(self, serializer):
        try:
            medical_professional = self.request.user.medicalprofessional
            serializer.save(
                recorded_by=medical_professional,
                hospital=medical_professional.hospital
            )
        except:
            raise PermissionDenied("Only medical professionals can create records")

class PatientAccessViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(id=self.request.user.id)

    @action(detail=True, methods=['get'])
    def medical_records(self, request, pk=None):
        """Get all medical records for the patient"""
        patient = self.get_object()
        records = MedicalRecord.objects.filter(patient=patient)
        return Response(MedicalRecordSerializer(records, many=True).data)

    @action(detail=True, methods=['get'])
    def access_logs(self, request, pk=None):
        """Get access history for the patient"""
        patient = self.get_object()
        logs = AccessLog.objects.filter(patient=patient)
        return Response(AccessLogSerializer(logs, many=True).data)

    @action(detail=True, methods=['post'])
    def update_preferences(self, request, pk=None):
        """Update patient's medical access preferences"""
        patient = self.get_object()
        serializer = UserProfileSerializer(
            patient,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)        
class DiagnosisViewSet(viewsets.ModelViewSet):
    serializer_class = DiagnosisSerializer
    permission_classes = [IsAuthenticated, IsMedicalProfessional]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        medical_professional = user.medicalprofessional
        return Diagnosis.objects.filter(diagnosed_by=medical_professional)

    @action(detail=False, methods=['get'])
    def by_patient(self, request):
        patient_id = request.query_params.get('patient_id')
        if patient_id:
            queryset = self.get_queryset().filter(
                medical_record__patient_id=patient_id
            )
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "Patient ID is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

class MedicalProfessionalViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalProfessionalSerializer
    permission_classes = [permissions.IsAuthenticated, IsVerifiedMedicalProfessional]

    def get_queryset(self):
        if self.request.user.is_staff:
            return MedicalProfessional.objects.all()
        return MedicalProfessional.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def access_patient_records(self, request, pk=None):
        """Quick access to patient records with proper verification"""
        medical_professional = self.get_object()
        patient_hpn = request.data.get('patient_hpn')
        access_type = request.data.get('access_type', 'REGULAR')
        
        try:
            patient = UserProfile.objects.get(hpn=patient_hpn)
            
            # Log access attempt
            AccessLog.objects.create(
                medical_professional=medical_professional,
                patient=patient,
                hospital=medical_professional.hospital,
                access_type=access_type,
                reason=request.data.get('reason', 'Regular medical access'),
                ip_address=request.META.get('REMOTE_ADDR')
            )

            # Get patient's medical records
            medical_records = MedicalRecord.objects.filter(patient=patient)
            record_data = MedicalRecordSerializer(medical_records, many=True).data

            return Response({
                'message': 'Access granted',
                'patient_data': {
                    'personal_info': UserProfileSerializer(patient).data,
                    'medical_records': record_data
                }
            })
            
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Invalid HPN number'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], url_path='search-patients')
    def search_patients(self, request):
        """Search patients by HPN number with pagination"""
        try:
            hpn = request.query_params.get('hpn', '')
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))

            if not hpn:
                return Response(
                    {"error": "HPN number is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check professional access
            if not request.user.has_professional_access():
                return Response(
                    {"error": "Unauthorized to access patient records"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Build query with multiple search fields
            patients = UserProfile.objects.filter(
                Q(hpn__icontains=hpn) |
                Q(first_name__icontains=hpn) |
                Q(last_name__icontains=hpn),
                is_verified=True
            ).exclude(
                is_staff=True
            ).order_by('last_name', 'first_name')

            # Calculate pagination
            start = (page - 1) * page_size
            end = start + page_size
            total_count = patients.count()
            patients_page = patients[start:end]

            # Log search attempt
            AccessLog.objects.create(
                medical_professional=request.user.medicalprofessional,
                access_type='SEARCH',
                reason=f'Patient search: {hpn}',
                ip_address=request.META.get('REMOTE_ADDR')
            )

            # Serialize and return results
            serializer = UserProfileSerializer(patients_page, many=True)
            
            return Response({
                "results": serializer.data,
                "count": total_count,
                "page": page,
                "total_pages": (total_count + page_size - 1) // page_size,
                "has_next": end < total_count,
                "has_previous": page > 1
            })

        except Exception as e:
            print(f"Patient search error: {str(e)}")
            return Response(
                {"error": "Failed to search patients"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @action(detail=False, methods=['get'], url_path='patient-details/(?P<hpn>[^/.]+)')
    def patient_details(self, request, hpn=None):
        """Get detailed patient information by HPN"""
        try:
            # Verify professional access
            if not request.user.has_professional_access():
                return Response(
                    {"error": "Unauthorized to access patient details"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get patient
            patient = UserProfile.objects.get(hpn=hpn)

            # Log access attempt
            AccessLog.objects.create(
                medical_professional=request.user.medicalprofessional,
                patient=patient,
                hospital=request.user.medicalprofessional.hospital,
                access_type='VIEW',
                record_type='PROFILE',
                record_id=patient.id,
                ip_address=request.META.get('REMOTE_ADDR')
            )

            # Get related data
            medical_records = MedicalRecord.objects.filter(patient=patient)
            appointments = Appointment.objects.filter(patient=patient)

            # Serialize all data
            response_data = {
                'id': str(patient.id),
                'hpn': patient.hpn,
                'first_name': patient.first_name,
                'last_name': patient.last_name,
                'date_of_birth': patient.date_of_birth,
                'blood_type': patient.blood_type,
                'allergies': patient.allergies,
                'chronic_conditions': patient.chronic_conditions,
                'is_high_risk': patient.is_high_risk,
                'last_visit_date': patient.last_visit_date,
                'emergency_contact_name': patient.emergency_contact_name,
                'emergency_contact_phone': patient.emergency_contact_phone,
                'medical_records': MedicalRecordSerializer(medical_records, many=True).data,
                'appointments': AppointmentSerializer(appointments, many=True).data
            }

            return Response(response_data)

        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Patient not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error fetching patient details: {str(e)}")
            return Response(
                {'error': 'Failed to fetch patient details'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )    
class MedicationViewSet(viewsets.ModelViewSet):
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated, IsMedicalProfessional]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'medicalprofessional'):
            return Medication.objects.filter(prescribed_by=user.medicalprofessional)
        return Medication.objects.filter(
            medical_record__patient=user
        ).filter(Q(end_date__gte=timezone.now()) | Q(end_date=None))

    @action(detail=False, methods=['get'])
    def active_prescriptions(self, request):
        patient_id = request.query_params.get('patient_id')
        if patient_id:
            queryset = Medication.objects.filter(
                medical_record__patient_id=patient_id,
                is_active=True
            )
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "Patient ID is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

class ProcedureViewSet(viewsets.ModelViewSet):
    serializer_class = ProcedureSerializer
    permission_classes = [IsAuthenticated, IsMedicalProfessional]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        medical_professional = user.medicalprofessional
        return Procedure.objects.filter(performed_by=medical_professional)

    @action(detail=False, methods=['get'])
    def scheduled(self, request):
        return Response(
            self.get_serializer(
                self.get_queryset().filter(status='SCHEDULED'),
                many=True
            ).data
        )

class LabResultViewSet(viewsets.ModelViewSet):
    serializer_class = LabResultSerializer
    permission_classes = [IsAuthenticated, IsMedicalProfessional]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'medicalprofessional'):
            return LabResult.objects.filter(performed_by=user.medicalprofessional)
        return LabResult.objects.filter(medical_record__patient=user)

    @action(detail=False, methods=['get'])
    def abnormal_results(self, request):
        patient_id = request.query_params.get('patient_id')
        if patient_id:
            queryset = self.get_queryset().filter(
                medical_record__patient_id=patient_id,
                is_abnormal=True
            )
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "Patient ID is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

# ================RECORD SHARING===========================
class ShareMedicalRecordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RecordShareSerializer(data=request.data)
        if serializer.is_valid():
            # Ensure the patient is the one making the request
            if serializer.validated_data['patient'] != request.user:
                return Response({"error": "You do not have permission to share this record."}, status=status.HTTP_403_FORBIDDEN)

            # Create the RecordShare instance
            record_share = serializer.save()
            return Response({"message": "Record shared successfully.", "record_share_id": record_share.id}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ================END OF RECORD SHARING===========================
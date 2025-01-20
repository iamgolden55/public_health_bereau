from ..imports import *

# Mixins
from ..mixin import StandardResultsSetPagination
# Custom viewset
class IsHospitalAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            staff = HospitalStaff.objects.get(user=request.user)
            return staff.role == 'ADMIN'
        except HospitalStaff.DoesNotExist:
            return False
class IsHospitalStaff(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        try:
            return request.user.hospitalstaff.hospital == obj.hospital
        except:
            return False        
# ============= Hospital Management ViewSets =============
class HospitalRegistrationViewSet(viewsets.ModelViewSet):
    queryset = HospitalRegistration.objects.all()
    serializer_class = HospitalRegistrationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        instance = serializer.save()
        self.send_registration_notification(instance)

    def send_registration_notification(self, registration):
        context = {
            'hospital_name': registration.name,
            'admin_name': f"{registration.admin_first_name} {registration.admin_last_name}",
            'registration_date': registration.created_at
        }
        
        # Notify platform admins
        subject = f"New Hospital Registration: {registration.name}"
        send_mail(
            subject=subject,
            message=render_to_string('emails/new_hospital_registration.txt', context),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            html_message=render_to_string('emails/new_hospital_registration.html', context)
        )

class HospitalStaffViewSet(viewsets.ModelViewSet):
    serializer_class = HospitalStaffSerializer
    permission_classes = [IsAuthenticated, IsHospitalAdmin]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return HospitalStaff.objects.all()
        try:
            staff = HospitalStaff.objects.get(user=user)
            return HospitalStaff.objects.filter(hospital=staff.hospital)
        except HospitalStaff.DoesNotExist:
            return HospitalStaff.objects.none()

    @action(detail=False, methods=['get'])
    def department_staff(self, request):
        department = request.query_params.get('department')
        queryset = self.get_queryset().filter(department=department)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class HospitalAffiliationViewSet(viewsets.ModelViewSet):
    serializer_class = HospitalAffiliationSerializer
    permission_classes = [IsAuthenticated, IsHospitalAdmin]

class HospitalViewSet(viewsets.ModelViewSet):
    serializer_class = HospitalSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalStaff]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Hospital.objects.all()
        try:
            medical_professional = self.request.user.medicalprofessional
            return Hospital.objects.filter(id=medical_professional.hospital.id)
        except:
            return Hospital.objects.none()

    @action(detail=True, methods=['get'])
    def medical_professionals(self, request, pk=None):
        """Get all medical professionals in this hospital"""
        hospital = self.get_object()
        professionals = MedicalProfessional.objects.filter(hospital=hospital)
        serializer = MedicalProfessionalSerializer(professionals, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def patients(self, request, pk=None):
        """Get all patients who have records in this hospital"""
        hospital = self.get_object()
        patients = UserProfile.objects.filter(
            medical_records__hospital=hospital
        ).distinct()
        return Response(UserProfileSerializer(patients, many=True).data)
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return HospitalAffiliation.objects.all()
        try:
            staff = HospitalStaff.objects.get(user=user)
            return HospitalAffiliation.objects.filter(hospital=staff.hospital)
        except HospitalStaff.DoesNotExist:
            return HospitalAffiliation.objects.none()

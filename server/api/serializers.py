from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from .models import GPPractice, GeneralPractitioner, PatientGPRegistration
from .models import (
    Department, MedicalCase, MedicalImage, UserProfile, Hospital, MedicalProfessional, MedicalRecord, AccessLog,
    HospitalRegistration, HospitalStaff, HospitalAffiliation, Appointment,
    Diagnosis, Medication, Procedure, LabResult, Insurance, Bill, BillItem,
    Subscription, HospitalSubscription, PlatformRevenue, PlatformStatistics,
    ResearchProject, ResearchCriteria, ResearchCohort, CohortMembership,
    DataPoint, AnalyticsReport, ResearchPublication, AIModel, HospitalAudit, Message, TelemedicineSession, AnalyticsMetric, MetricLog,
    Task, Protocol, ExternalSystem, IntegrationLog,
    MedicalDevice, DeviceReading, SurgeryType, SurgerySchedule, SurgicalTeam, PreOpAssessment,
    SurgeryReport, PostOpCare, SurgeryConsent, ResearchCriteria, RecordShare, Resource,
    Immunization, MentalHealthAssessment, FamilyHistory,
    MenstrualCycle, FertilityAssessment, HormonePanel, GynecologicalExam, CustomUser
)
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

# First, let's create a serializer for professional details
class BasicUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'first_name', 'last_name', 'hpn', 'is_verified']

class BasicDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'icon']

class BasicHospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = ['id', 'name', 'facility_type']

class BasicMedicalProfessionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalProfessional
        fields = ['id', 'license_number', 'professional_type', 'specialization', 'is_verified']

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        """
        Custom create method to properly handle password hashing
        and any other special field processing during user creation.
        """
        validated_data['password'] = make_password(validated_data['password'])
        validated_data['username'] = validated_data['email']  # Use email as username
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Custom update method to handle password updates
        and any other special field processing during user updates.
        """
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    has_professional_access = serializers.SerializerMethodField()
    professional_details = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = (
            # User identification fields
            'id', 'email', 'password', 'first_name', 'last_name',
            
            # Basic profile fields
            'date_of_birth', 'gender', 'phone_number', 'country', 'city',
            
            # Health-related fields
            'blood_type', 'allergies', 'chronic_conditions',
            'emergency_contact_name', 'emergency_contact_phone',
            'is_high_risk',
            
            # Medical system fields
            'hpn', 'is_verified', 'last_active_view',
            
            # Professional access fields
            'has_professional_access', 'professional_details',
            
            # GP registration fields
            'has_registered_gp', 'current_gp_practice', 'current_gp'
        )
        read_only_fields = (
            'id', 'hpn', 'is_verified', 'last_active_view',
            'has_professional_access', 'professional_details',
            'is_high_risk'
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'hpn': {'read_only': True},
            'is_verified': {'read_only': True}
        }

    def get_has_professional_access(self, obj):
        """
        Determine if user has professional access rights.
        This calls our custom method from the model.
        """
        return obj.has_professional_access()

    def get_professional_details(self, obj):
        try:
            if obj.has_professional_access():
                return BasicMedicalProfessionalSerializer(obj.medicalprofessional).data
        except MedicalProfessional.DoesNotExist:
            return None
        return None

    def create(self, validated_data):
        # Extract user-specific data
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')

        # Create CustomUser instance
        user = CustomUser.objects.create_user(
            email=email,
            username=email,  # Make sure username is explicitly set
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        # Create UserProfile instance
        user_profile = UserProfile.objects.create(
            user=user,
            first_name=first_name,
            last_name=last_name,
            **validated_data
        )

        return user_profile

    def update(self, instance, validated_data):
        user_data = {}
        for field in ['email', 'password', 'first_name', 'last_name']:
            if field in validated_data:
                value = validated_data.pop(field)
                if field == 'password':
                    value = make_password(value)
                if field == 'email':
                    user_data['username'] = value
                user_data[field] = value
        
        if user_data:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            instance.user.save()

        return super().update(instance, validated_data)

    def to_representation(self, instance):
        """
        Custom method to control the final serialized representation
        of the user data, including conditionally adding professional details.
        """
        representation = super().to_representation(instance)
        
        # Add user data to response
        representation.update({
            'email': instance.user.email,
            'first_name': instance.first_name,
            'last_name': instance.last_name,
        })
        
        # Add professional-specific data if applicable
        if representation['has_professional_access']:
            representation['can_switch_dashboard'] = True
        
        return representation

    def validate_email(self, value):
        # Use transaction.atomic() to prevent race conditions
        from django.db import transaction
        with transaction.atomic():
            if CustomUser.objects.filter(email=value).exists():
                raise serializers.ValidationError("Email already exists")
        return value

    def validate_gender(self, value):
        if value not in ['M', 'F', 'O']:
            raise serializers.ValidationError("Invalid gender value")
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def validate_date_of_birth(self, value):
        if value and value > timezone.now().date():
            raise serializers.ValidationError("Date of birth cannot be in the future")
        return value

    def validate_phone_number(self, value):
        if value and not value.replace('+', '').isdigit():
            raise serializers.ValidationError("Invalid phone number format")
        return value

    def validate(self, data):
        # Validate password first
        password = data.get('password')
        if password:
            self.validate_password(password)
        required_fields = ['email', 'password', 'first_name', 'last_name', 'gender']
        for field in required_fields:
            if field not in data:
                raise serializers.ValidationError(f"{field} is required")
        return data

class RecordShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecordShare
        fields = ['patient', 'medical_record', 'external_provider_name', 'expires_at']

    def create(self, validated_data):
        # Custom logic to validate the expiration date
        expires_at = validated_data.get('expires_at')
        if expires_at and expires_at <= timezone.now():
            raise serializers.ValidationError("Expiration date must be in the future.")

        # Check if a record share already exists
        existing_share = RecordShare.objects.filter(
            patient=validated_data['patient'],
            medical_record=validated_data['medical_record'],
            external_provider_name=validated_data['external_provider_name']
        ).first()

        if existing_share:
            raise serializers.ValidationError("This medical record has already been shared with this provider.")

        return super().create(validated_data)

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = '__all__'
        read_only_fields = ['is_verified']

# Professional Management Tools

class MedicalImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalImage
        fields = '__all__'

class MedicalCaseSerializer(serializers.ModelSerializer):
    images = MedicalImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = MedicalCase
        fields = '__all__'

# Hospital Management Serializers
class HospitalRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalRegistration
        fields = '__all__'
        read_only_fields = ['registration_status']

class HospitalStaffSerializer(serializers.ModelSerializer):
    user_details = UserProfileSerializer(source='user', read_only=True)

    class Meta:
        model = HospitalStaff
        fields = '__all__'


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'  # You can specify the fields you want to include
class HospitalAffiliationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalAffiliation
        fields = '__all__'

class MedicalProfessionalSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(write_only=True)
    user_password = serializers.CharField(write_only=True)
    user = BasicUserProfileSerializer(read_only=True)
    department = BasicDepartmentSerializer(read_only=True)
    hospital = BasicHospitalSerializer(read_only=True)

    class Meta:
        model = MedicalProfessional
        fields = [
            'id', 'user', 'user_email', 'user_password', 'license_number',
            'professional_type', 'specialization', 'department', 'hospital',
            'is_verified', 'verification_document'
        ]
        read_only_fields = ['is_verified']

    def create(self, validated_data):
        email = validated_data.pop('user_email')
        password = validated_data.pop('user_password')
        user = UserProfile.objects.create_user(
            email=email,
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return MedicalProfessional.objects.create(user=user, **validated_data)

# Medical Records Serializers
class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    provider_name = serializers.CharField(source='provider.user.get_full_name', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'

class DiagnosisSerializer(serializers.ModelSerializer):
    diagnosed_by_name = serializers.CharField(source='diagnosed_by.user.get_full_name', read_only=True)

    class Meta:
        model = Diagnosis
        fields = '__all__'

class MedicationSerializer(serializers.ModelSerializer):
    prescribed_by_name = serializers.CharField(source='prescribed_by.user.get_full_name', read_only=True)

    class Meta:
        model = Medication
        fields = '__all__'

class ProcedureSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.user.get_full_name', read_only=True)

    class Meta:
        model = Procedure
        fields = '__all__'

class LabResultSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.user.get_full_name', read_only=True)

    class Meta:
        model = LabResult
        fields = '__all__'

# Add these serializers before MedicalRecordSerializer
class ImmunizationSerializer(serializers.ModelSerializer):
    administered_by_name = serializers.CharField(source='administered_by.user.get_full_name', read_only=True)

    class Meta:
        model = Immunization
        fields = '__all__'

class MentalHealthAssessmentSerializer(serializers.ModelSerializer):
    assessed_by_name = serializers.CharField(source='assessed_by.user.get_full_name', read_only=True)

    class Meta:
        model = MentalHealthAssessment
        fields = '__all__'

class FamilyHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyHistory
        fields = '__all__'

# Add these right after FamilyHistorySerializer and before MedicalRecordSerializer
class MenstrualCycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenstrualCycle
        fields = '__all__'

class FertilityAssessmentSerializer(serializers.ModelSerializer):
    assessed_by_name = serializers.CharField(source='assessed_by.user.get_full_name', read_only=True)
    class Meta:
        model = FertilityAssessment
        fields = '__all__'

class HormonePanelSerializer(serializers.ModelSerializer):
    class Meta:
        model = HormonePanel
        fields = '__all__'

class GynecologicalExamSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.user.get_full_name', read_only=True)
    class Meta:
        model = GynecologicalExam
        fields = '__all__'

# Then the MedicalRecordSerializer can use these serializers
class MedicalRecordSerializer(serializers.ModelSerializer):
    diagnoses = DiagnosisSerializer(many=True, read_only=True)
    medications = MedicationSerializer(many=True, read_only=True)
    procedures = ProcedureSerializer(many=True, read_only=True)
    lab_results = LabResultSerializer(many=True, read_only=True)
    # Add new related fields
    immunizations = ImmunizationSerializer(many=True, read_only=True)
    mental_health_assessments = MentalHealthAssessmentSerializer(many=True, read_only=True)
    family_histories = FamilyHistorySerializer(many=True, read_only=True)
    menstrual_cycles = MenstrualCycleSerializer(many=True, read_only=True)
    fertility_assessments = FertilityAssessmentSerializer(many=True, read_only=True)
    hormone_panels = HormonePanelSerializer(many=True, read_only=True)
    gynecological_exams = GynecologicalExamSerializer(many=True, read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'patient', 'provider', 'hospital', 'appointment',
            'record_date', 'chief_complaint', 'present_illness',
            'vital_signs', 'assessment', 'plan', 'is_confidential',
            'created_at', 'updated_at',
            # Include all related fields
            'diagnoses', 'medications', 'procedures', 'lab_results',
            'immunizations', 'mental_health_assessments', 'family_histories',
            'menstrual_cycles', 'fertility_assessments', 'hormone_panels',
            'gynecological_exams'
        ]

# Financial Serializers
class InsuranceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insurance
        fields = '__all__'

class BillItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillItem
        fields = '__all__'

class BillSerializer(serializers.ModelSerializer):
    items = BillItemSerializer(many=True, read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)

    class Meta:
        model = Bill
        fields = '__all__'

# Platform Management Serializers
class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'

class HospitalSubscriptionSerializer(serializers.ModelSerializer):
    subscription_details = SubscriptionSerializer(source='subscription', read_only=True)

    class Meta:
        model = HospitalSubscription
        fields = '__all__'

class PlatformRevenueSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)

    class Meta:
        model = PlatformRevenue
        fields = '__all__'

class PlatformStatisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformStatistics
        fields = '__all__'

class HospitalAuditSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)

    class Meta:
        model = HospitalAudit
        fields = '__all__'

# Research Serializers
class ResearchProjectSerializer(serializers.ModelSerializer):
    principal_investigator_name = serializers.CharField(
        source='principal_investigator.user.get_full_name',
        read_only=True
    )

    class Meta:
        model = ResearchProject
        fields = '__all__'

class ResearchCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchCriteria
        fields = '__all__'

class CohortMembershipSerializer(serializers.ModelSerializer):
    patient_details = UserProfileSerializer(source='patient', read_only=True)

    class Meta:
        model = CohortMembership
        fields = '__all__'

class ResearchCohortSerializer(serializers.ModelSerializer):
    memberships = CohortMembershipSerializer(many=True, read_only=True)

    class Meta:
        model = ResearchCohort
        fields = '__all__'

class DataPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataPoint
        fields = '__all__'

class AnalyticsReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsReport
        fields = '__all__'

class ResearchPublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchPublication
        fields = '__all__'

class AIModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIModel
        fields = '__all__'

class AccessLogSerializer(serializers.ModelSerializer):
    medical_professional_name = serializers.CharField(
        source='medical_professional.user.get_full_name',
        read_only=True
    )
    patient_name = serializers.CharField(
        source='patient.get_full_name',
        read_only=True
    )

    class Meta:
        model = AccessLog
        fields = '__all__'
        read_only_fields = ['access_timestamp', 'ip_address']

# GP Management Serializers

class GPPracticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GPPractice
        fields = '__all__'

class GeneralPractitionerSerializer(serializers.ModelSerializer):
    user_details = UserProfileSerializer(source='user', read_only=True)
    practice_details = GPPracticeSerializer(source='practice', read_only=True)

    class Meta:
        model = GeneralPractitioner
        fields = '__all__'

class PatientGPRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientGPRegistration
        fields = '__all__'

# Communication Serializers
class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)

    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['sender', 'created_at', 'updated_at']

class TelemedicineSessionSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)

    class Meta:
        model = TelemedicineSession
        fields = '__all__'
        read_only_fields = ['session_url', 'recording_url', 'duration']

# Analytics Serializers
class AnalyticsMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsMetric
        fields = '__all__'

class MetricLogSerializer(serializers.ModelSerializer):
    metric_name = serializers.CharField(source='metric.name', read_only=True)

    class Meta:
        model = MetricLog
        fields = '__all__'

# Workflow Serializers
class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['completed_at']

class ProtocolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Protocol
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

# Integration Serializers
class ExternalSystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalSystem
        fields = '__all__'
        extra_kwargs = {
            'api_key': {'write_only': True},
            'api_secret': {'write_only': True}
        }

class IntegrationLogSerializer(serializers.ModelSerializer):
    system_name = serializers.CharField(source='system.name', read_only=True)

    class Meta:
        model = IntegrationLog
        fields = '__all__'
        read_only_fields = ['timestamp']

# IoT Device Serializers
class MedicalDeviceSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)

    class Meta:
        model = MedicalDevice
        fields = '__all__'
        read_only_fields = ['last_maintenance']

class DeviceReadingSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)

    class Meta:
        model = DeviceReading
        fields = '__all__'
        read_only_fields = ['timestamp']
  
# Surgery Management Serializers

class SurgeryTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurgeryType
        fields = '__all__'

class SurgicalTeamSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.user.get_full_name', read_only=True)
    
    class Meta:
        model = SurgicalTeam
        fields = '__all__'

class PreOpAssessmentSerializer(serializers.ModelSerializer):
    assessed_by_name = serializers.CharField(
        source='assessed_by.user.get_full_name',
        read_only=True
    )

    class Meta:
        model = PreOpAssessment
        fields = '__all__'

class SurgeryReportSerializer(serializers.ModelSerializer):
    duration = serializers.SerializerMethodField()
    recorded_by_name = serializers.CharField(
        source='recorded_by.user.get_full_name',
        read_only=True
    )

    class Meta:
        model = SurgeryReport
        fields = '__all__'

    def get_duration(self, obj):
        if obj.start_time and obj.end_time:
            return str(obj.end_time - obj.start_time)
        return None

class PostOpCareSerializer(serializers.ModelSerializer):
    recovery_duration = serializers.SerializerMethodField()

    class Meta:
        model = PostOpCare
        fields = '__all__'

    def get_recovery_duration(self, obj):
        if obj.discharge_time:
            return str(obj.discharge_time - obj.admission_time)
        return None

class SurgeryConsentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    
    class Meta:
        model = SurgeryConsent
        fields = '__all__'

class SurgeryScheduleSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    surgery_type_name = serializers.CharField(source='surgery_type.name', read_only=True)
    lead_surgeon_name = serializers.CharField(
        source='lead_surgeon.user.get_full_name',
        read_only=True
    )
    team_members = SurgicalTeamSerializer(many=True, read_only=True)
    pre_op = PreOpAssessmentSerializer(read_only=True)
    report = SurgeryReportSerializer(read_only=True)
    post_op = PostOpCareSerializer(read_only=True)
    consent = SurgeryConsentSerializer(read_only=True)

    class Meta:
        model = SurgerySchedule
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['hospital_name'] = instance.hospital.name
        return representation
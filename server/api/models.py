from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import uuid
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from django.core.exceptions import ValidationError
import json
from django.db.models import JSONField

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.files.storage import default_storage
import numpy as np
from django.http import FileResponse
import io
import zipfile


RESOURCE_CATEGORIES = [
    ('CLINICAL_GUIDELINES', 'Clinical Guidelines'),
    ('TREATMENT_PROTOCOLS', 'Treatment Protocols'),
    ('RESEARCH_PAPERS', 'Research Papers'),
    ('MEDICAL_ALGORITHMS', 'Medical Algorithms'),
    ('PATIENT_EDUCATION', 'Patient Education'),
    ('REGULATORY_COMPLIANCE', 'Regulatory Compliance')
]

MEDICAL_SPECIALTIES = [
    ('CARDIOLOGY', 'Cardiology'),
    ('NEUROLOGY', 'Neurology'),
    ('ONCOLOGY', 'Oncology'),
    ('PEDIATRICS', 'Pediatrics'),
    ('EMERGENCY_MEDICINE', 'Emergency Medicine'),
    ('INTERNAL_MEDICINE', 'Internal Medicine'),
    ('SURGERY', 'Surgery'),
    ('PSYCHIATRY', 'Psychiatry'),
    ('OBSTETRICS_GYNECOLOGY', 'Obstetrics & Gynecology')
]

EVIDENCE_LEVELS = [
    ('LEVEL_1', 'Level 1 - Systematic Review'),
    ('LEVEL_2', 'Level 2 - Randomized Control'),
    ('LEVEL_3', 'Level 3 - Cohort Studies'),
    ('LEVEL_4', 'Level 4 - Case Studies'),
    ('LEVEL_5', 'Level 5 - Expert Opinion')
]


# ============= User Management System =============
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('username', email)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'  # Use email for login instead of username
    REQUIRED_FIELDS = ['first_name', 'last_name']  # Required fields when creating a superuser
    
    def __str__(self):
        return self.email

class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=[
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other')
    ])
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    
    # Authentication and Verification
    is_verified = models.BooleanField(default=False)
    verification_token = models.UUIDField(default=uuid.uuid4, unique=True)
    password_reset_token = models.CharField(max_length=64, null=True, blank=True)
    social_provider = models.CharField(max_length=20, blank=True, null=True)
    social_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Hospital and Dashboard Preferences
    primary_hospital = models.ForeignKey('Hospital', on_delete=models.SET_NULL, null=True, blank=True)
    last_active_view = models.CharField(
        max_length=20,
        choices=[('patient', 'Patient Dashboard'), ('professional', 'Professional Dashboard')],
        default='patient'
    )
    
    # GP Registration Fields
    has_registered_gp = models.BooleanField(default=False)
    current_gp_practice = models.ForeignKey(
        'GPPractice', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='current_patients'
    )
    current_gp = models.ForeignKey(
        'GeneralPractitioner',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_patients'
    )

    # Medical Information
    blood_type = models.CharField(
        max_length=5,
        choices=[
            ('A+', 'A+'), ('A-', 'A-'),
            ('B+', 'B+'), ('B-', 'B-'),
            ('AB+', 'AB+'), ('AB-', 'AB-'),
            ('O+', 'O+'), ('O-', 'O-'),
        ],
        null=True, blank=True
    )
    allergies = models.TextField(null=True, blank=True)
    chronic_conditions = models.TextField(null=True, blank=True)
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=100, null=True, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, null=True, blank=True)
    
    # Risk and Visit Tracking
    is_high_risk = models.BooleanField(default=False)
    last_visit_date = models.DateTimeField(null=True, blank=True)
    
    # Health Profile Number
    hpn = models.CharField(max_length=50, unique=True, editable=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.hpn:
            state_code = self.city[:3].upper() if self.city else "UNK"
            unique_number = str(uuid.uuid4().int)[:10]
            # Format with spaces: XXX XXX XXX XXXX
            self.hpn = f"{state_code} {unique_number[:3]} {unique_number[3:6]} {unique_number[6:]}"
        super().save(*args, **kwargs)

    def has_professional_access(self):
        """Check if user has verified professional status"""
        try:
            return (hasattr(self, 'medicalprofessional') and 
                   self.medicalprofessional.is_verified)
        except MedicalProfessional.DoesNotExist:
            return False

    def get_professional_details(self):
        """Get professional details if they exist"""
        if self.has_professional_access():
            return {
                'license_number': self.medicalprofessional.license_number,
                'type': self.medicalprofessional.professional_type,
                'specialization': self.medicalprofessional.specialization,
                'hospital': self.medicalprofessional.hospital.name if self.medicalprofessional.hospital else None,
                'is_verified': self.medicalprofessional.is_verified
            }
        return None

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.hpn})"

    def update_dashboard_preference(self, view_type):
        """Update user's last active dashboard view"""
        if view_type in ['patient', 'professional']:
            self.last_active_view = view_type
            self.save(update_fields=['last_active_view'])

    def get_default_dashboard(self):
        """Returns the user's last active dashboard or default based on role"""
        if self.last_active_view:
            return self.last_active_view
        return 'professional' if self.has_professional_access() else 'patient'


# ============= General Practice System =================
# 
# This system is used to manage general practice clinics and patient registration
class GPPractice(models.Model):
    name = models.CharField(max_length=200)
    registration_number = models.CharField(max_length=50, unique=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    postcode = models.CharField(max_length=20)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField()
    capacity = models.IntegerField(help_text="Maximum number of registered patients")
    is_accepting_patients = models.BooleanField(default=True)
    opening_hours = models.JSONField(help_text="Store opening hours for each day")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.city}"

    class Meta:
        verbose_name = "GP Practice"
        verbose_name_plural = "GP Practices"

class GeneralPractitioner(models.Model):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE)
    practice = models.ForeignKey(GPPractice, on_delete=models.CASCADE, related_name='gp_doctors')
    license_number = models.CharField(max_length=50, unique=True)
    specializations = JSONField(default=list)
    availability_schedule = models.JSONField(default=dict)
    max_daily_appointments = models.IntegerField(default=20)
    is_accepting_appointments = models.BooleanField(default=True)
    qualification = models.TextField()
    years_of_experience = models.IntegerField()
    biography = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.practice.name}"

class PatientGPRegistration(models.Model):
    patient = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='gp_registrations')
    practice = models.ForeignKey(GPPractice, on_delete=models.CASCADE, related_name='registered_patients')
    gp = models.ForeignKey(GeneralPractitioner, on_delete=models.SET_NULL, null=True, related_name='assigned_patients')
    registration_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', 'Active'),
            ('PENDING', 'Pending'),
            ('TRANSFERRED', 'Transferred'),
            ('INACTIVE', 'Inactive')
        ],
        default='PENDING'
    )
    previous_practice = models.ForeignKey(
        GPPractice, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='transferred_patients'
    )
    notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ['patient', 'practice', 'status']

    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.practice.name}"

# ============= Professional Profile Tools =============

class MedicalImage(models.Model):
    case = models.ForeignKey('MedicalCase', on_delete=models.CASCADE, related_name='images')
    image_data = models.BinaryField()  # Store 3D image data
    metadata = models.JSONField()  # Store image metadata including dimensions, orientation
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

class MedicalCase(models.Model):
    title = models.CharField(max_length=200)
    patient = models.ForeignKey('UserProfile', on_delete=models.CASCADE)
    department = models.CharField(max_length=100)
    type = models.CharField(max_length=50)
    status = models.CharField(max_length=50)
    findings = models.JSONField()
    annotations = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

class Department(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50)
    hospital = models.ForeignKey('Hospital', on_delete=models.CASCADE, related_name='departments', null=True)
    active_cases = models.IntegerField(default=0)
    specialists = models.ManyToManyField(
        'MedicalProfessional',
        related_name='specializations'
    )

    def __str__(self):
        return self.name

# ============= Hospital System =============
class Hospital(models.Model):
    name = models.CharField(max_length=255)
    facility_type = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField()
    website = models.URLField(blank=True, null=True)
    license_number = models.CharField(max_length=50, blank=True, null=True)
    accreditation_status = models.CharField(max_length=50, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    has_emergency = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.facility_type})"

class HospitalRegistration(models.Model):
    name = models.CharField(max_length=200)
    registration_number = models.CharField(max_length=50, unique=True)
    facility_type = models.CharField(max_length=50)
    address = models.TextField()
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    
    # Registration specific fields
    admin_first_name = models.CharField(max_length=100)
    admin_last_name = models.CharField(max_length=100)
    admin_email = models.EmailField()
    admin_phone = models.CharField(max_length=20)
    registration_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('APPROVED', 'Approved'),
            ('REJECTED', 'Rejected')
        ],
        default='PENDING'
    )
    documents = models.FileField(upload_to='hospital_registrations/')
    verification_notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class HospitalStaff(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='hospital_staff')
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE)
    role = models.CharField(
        max_length=20,
        choices=[
            ('ADMIN', 'Hospital Administrator'),
            ('MANAGER', 'Department Manager'),
            ('STAFF', 'Staff Member'),
            ('RECEPTIONIST', 'Receptionist')
        ]
    )
    department = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    join_date = models.DateField()
    access_level = models.IntegerField(default=1)  # 1-5 access levels
    created_by = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, related_name='staff_created')

class MedicalProfessional(models.Model):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE)
    license_number = models.CharField(max_length=50, unique=True)
    professional_type = models.CharField(
        max_length=50,
        choices=[
            ('DOCTOR', 'Medical Doctor'),
            ('NURSE', 'Registered Nurse'),
            ('SPECIALIST', 'Medical Specialist'),
            ('EMERGENCY', 'Emergency Staff')
        ]
    )
    specialization = models.CharField(max_length=100, null=True, blank=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, related_name='staff')
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_professionals'
    )
    is_verified = models.BooleanField(default=False)
    verification_document = models.FileField(upload_to='verifications/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    departments = models.ManyToManyField(Department, related_name='professionals')

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.specialization}"

class HospitalAffiliation(models.Model):
    medical_professional = models.ForeignKey(MedicalProfessional, on_delete=models.CASCADE)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE)
    is_primary = models.BooleanField(default=False)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    schedule = models.JSONField(null=True)  # Store working hours/days
    department = models.CharField(max_length=100)
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', 'Active'),
            ('ON_LEAVE', 'On Leave'),
            ('INACTIVE', 'Inactive')
        ],
        default='ACTIVE'
    )
    
    class Meta:
        unique_together = ['medical_professional', 'hospital', 'department']

    def __str__(self):
        return f"{self.medical_professional} at {self.hospital}"

# ============= Insurance System =============
class Insurance(models.Model):
    company_name = models.CharField(max_length=100)
    policy_number = models.CharField(max_length=50, unique=True)
    coverage_details = models.TextField()
    contact_number = models.CharField(max_length=20)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company_name} - {self.policy_number}"

# ============= Appointment System =============
class Appointment(models.Model):
    patient = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='appointments')
    provider = models.ForeignKey(MedicalProfessional, on_delete=models.CASCADE)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE)
    appointment_date = models.DateTimeField()
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('SCHEDULED', 'Scheduled'),
            ('COMPLETED', 'Completed'),
            ('CANCELLED', 'Cancelled'),
            ('NO_SHOW', 'No Show')
        ],
        default='SCHEDULED'
    )
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    gp = models.ForeignKey(
        'GeneralPractitioner', 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='appointments'
    )
    practice = models.ForeignKey(
        'GPPractice',
        on_delete=models.CASCADE,
        related_name='appointments',
        null=True,  # Add this
        blank=True  # Add this
    )
    appointment_type = models.CharField(
        max_length=50,
        choices=[
            ('GP_ROUTINE', 'GP Routine'),
            ('GP_FOLLOWUP', 'GP Follow-up'),
            ('SPECIALIST', 'Specialist'),
            ('EMERGENCY', 'Emergency'),
            ('VACCINATION', 'Vaccination'),
            ('SCREENING', 'Screening')
        ],
        default='GP_ROUTINE'
    )
    priority = models.CharField(
        max_length=20,
        choices=[
            ('ROUTINE', 'Routine'),
            ('URGENT', 'Urgent'),
            ('EMERGENCY', 'Emergency')
        ],
        default='ROUTINE'
    )
    duration = models.DurationField(
        default=timedelta(minutes=15),
        help_text="Expected duration of appointment"
    )
    reminders_enabled = models.BooleanField(default=True)
    last_reminder_sent = models.DateTimeField(null=True, blank=True)
    check_in_time = models.DateTimeField(null=True, blank=True)
    actual_duration = models.DurationField(null=True, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['appointment_date', 'status']),
            models.Index(fields=['patient', 'status']),
            models.Index(fields=['practice', 'appointment_date']),
        ]
        ordering = ['-appointment_date']

    def clean(self):
        # Validate appointment rules
        if self.appointment_date and self.appointment_date < timezone.now():
            raise ValidationError("Cannot book appointments in the past")
            
        if self.appointment_type == 'SPECIALIST' and not self.provider:
            raise ValidationError("Specialist appointments require a provider")

    def send_reminder(self):
        """Send appointment reminder to patient"""
        if not self.reminders_enabled:
            return
            
        # Implementation for sending reminders
        pass

    @property
    def is_upcoming(self):
        return self.appointment_date > timezone.now() and self.status == 'SCHEDULED'

    @property
    def can_cancel(self):
        return self.is_upcoming and self.appointment_date > (timezone.now() + timedelta(hours=24))
    
# ============= Referral System =================
class Referral(models.Model):
    patient = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    referring_gp = models.ForeignKey(GeneralPractitioner, on_delete=models.CASCADE)
    referral_type = models.CharField(
        max_length=50,
        choices=[
            ('SPECIALIST', 'Specialist'),
            ('LABORATORY', 'Laboratory'),
            ('PHARMACY', 'Pharmacy'),
            ('HOSPITAL', 'Hospital')
        ]
    )
    priority = models.CharField(
        max_length=20,
        choices=[
            ('ROUTINE', 'Routine'),
            ('URGENT', 'Urgent'),
            ('EMERGENCY', 'Emergency')
        ]
    )
    reason = models.TextField()
    notes = models.TextField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('ACCEPTED', 'Accepted'),
            ('COMPLETED', 'Completed'),
            ('REJECTED', 'Rejected')
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class WaitingList(models.Model):
    patient = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    service_type = models.CharField(max_length=100)
    priority = models.CharField(
        max_length=20,
        choices=[
            ('ROUTINE', 'Routine'),
            ('URGENT', 'Urgent'),
            ('EMERGENCY', 'Emergency')
        ]
    )
    added_date = models.DateTimeField(auto_now_add=True)
    estimated_wait_time = models.DurationField()
    notes = models.TextField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', 'Active'),
            ('SCHEDULED', 'Scheduled'),
            ('CANCELLED', 'Cancelled'),
            ('COMPLETED', 'Completed')
        ]
    )
    scheduled_date = models.DateTimeField(null=True, blank=True)
    scheduled_by = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.service_type}"

# ============= Medical Records System =================
class MedicalRecord(models.Model):
    patient = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='medical_records')
    provider = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True)
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True)
    record_date = models.DateTimeField(auto_now_add=True)
    chief_complaint = models.TextField()
    present_illness = models.TextField()
    vital_signs = models.JSONField(default=dict, blank=True)
    assessment = models.TextField()
    plan = models.TextField()
    is_confidential = models.BooleanField(default=False)
    mental_health_status = models.CharField(max_length=50, blank=True)
    mental_health_assessment = models.TextField(blank=True)
    mood_evaluation = models.CharField(max_length=100, blank=True)
    anxiety_level = models.CharField(max_length=50, blank=True)
    therapy_notes = models.TextField(blank=True)
    sleep_quality = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.hpn} - {self.record_date}"
    
class RecordShare(models.Model):
    patient = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='shared_records')
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='record_shares')
    external_provider_name = models.CharField(max_length=255)  # Name of the external provider
    shared_at = models.DateTimeField(auto_now_add=True)  # Timestamp when the record was shared
    expires_at = models.DateTimeField()  # Expiration time for the access

    def save(self, *args, **kwargs):
        # Set the expiration time to 7 days from now by default
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    def is_active(self):
        """Check if the sharing is still active based on the expiration time."""
        return timezone.now() < self.expires_at

    def __str__(self):
        return f"{self.patient.hpn} - {self.external_provider_name} - {self.medical_record.id}"

# ============= Diagnostic System =============
class Diagnosis(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='diagnoses')
    diagnosis_code = models.CharField(max_length=20)  # ICD-10 code
    description = models.TextField()
    diagnosis_type = models.CharField(
        max_length=20,
        choices=[
            ('PRIMARY', 'Primary'),
            ('SECONDARY', 'Secondary'),
            ('DIFFERENTIAL', 'Differential')
        ]
    )
    diagnosed_by = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)
    diagnosis_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.diagnosis_code} - {self.description[:50]}"

class Medication(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='medications')
    name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    route = models.CharField(
        max_length=20,
        choices=[
            ('ORAL', 'Oral'),
            ('IV', 'Intravenous'),
            ('IM', 'Intramuscular'),
            ('SC', 'Subcutaneous'),
            ('TOPICAL', 'Topical')
        ]
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    prescribed_by = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    instructions = models.TextField()
    side_effects = models.TextField(null=True, blank=True)
    purpose = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.dosage}"

class Procedure(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='procedures')
    procedure_code = models.CharField(max_length=20)  # CPT code
    name = models.CharField(max_length=200)
    description = models.TextField()
    performed_by = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)
    procedure_date = models.DateTimeField()
    location = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('SCHEDULED', 'Scheduled'),
            ('IN_PROGRESS', 'In Progress'),
            ('COMPLETED', 'Completed'),
            ('CANCELLED', 'Cancelled')
        ],
        default='SCHEDULED'
    )
    notes = models.TextField(null=True, blank=True)
    complications = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.procedure_code} - {self.name}"

class LabResult(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='lab_results')
    test_name = models.CharField(max_length=200)
    test_code = models.CharField(max_length=50)  # LOINC code
    category = models.CharField(max_length=100)
    result_value = models.CharField(max_length=100)
    unit = models.CharField(max_length=50)
    reference_range = models.CharField(max_length=100)
    is_abnormal = models.BooleanField(default=False)
    performed_by = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)
    test_date = models.DateTimeField()
    result_date = models.DateTimeField()
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.test_name} - {self.result_value} {self.unit}"

# ============= Billing System =============
class Bill(models.Model):
    patient = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='bills')
    provider = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True)
    appointment = models.OneToOneField(Appointment, on_delete=models.SET_NULL, null=True)
    insurance = models.ForeignKey(Insurance, on_delete=models.SET_NULL, null=True)
    bill_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    insurance_covered = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    patient_responsibility = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('SUBMITTED', 'Submitted to Insurance'),
            ('PARTIALLY_PAID', 'Partially Paid'),
            ('PAID', 'Paid'),
            ('OVERDUE', 'Overdue'),
            ('CANCELLED', 'Cancelled')
        ],
        default='PENDING'
    )
    due_date = models.DateField()
    payment_method = models.CharField(
        max_length=20,
        choices=[
            ('CASH', 'Cash'),
            ('CARD', 'Credit/Debit Card'),
            ('INSURANCE', 'Insurance'),
            ('BANK_TRANSFER', 'Bank Transfer')
        ],
        null=True,
        blank=True
    )
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bill #{self.id} - {self.patient.get_full_name()} - ${self.total_amount}"

class BillItem(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=200)
    code = models.CharField(max_length=50)  # Billing code (CPT/ICD)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} - ${self.total_price}"

# ============= Access Logging System =============
class AccessLog(models.Model):
    medical_professional = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)
    patient = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True, blank=True)  # Made optional
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True)
    access_timestamp = models.DateTimeField(auto_now_add=True)
    access_type = models.CharField(
        max_length=20,
        choices=[
            ('VIEW', 'View Record'),
            ('CREATE', 'Create Record'),
            ('UPDATE', 'Update Record'),
            ('DELETE', 'Delete Record'),
            ('PRINT', 'Print Record'),
            ('EXPORT', 'Export Record'),
            ('SEARCH', 'Search Records')  # Added new choice for search
        ]
    )
    record_type = models.CharField(max_length=50)  # Type of record accessed
    record_id = models.IntegerField(null=True, blank=True)  # Made optional
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    success = models.BooleanField(default=True)
    reason = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-access_timestamp']
        indexes = [
            models.Index(fields=['patient', 'access_timestamp']),
            models.Index(fields=['medical_professional', 'access_timestamp']),
        ]

    def __str__(self):
        # Updated string representation to handle null patient
        if self.patient:
            return f"{self.medical_professional} accessed {self.patient.hpn} - {self.access_type}"
        return f"{self.medical_professional} performed {self.access_type} - {self.reason}"

 # ============= Platform Management System =============
class Subscription(models.Model):
    name = models.CharField(max_length=100)  # e.g., Basic, Premium, Enterprise
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.IntegerField()
    features = models.JSONField()  # Store features as JSON
    max_users = models.IntegerField()  # Maximum number of staff accounts
    max_storage_gb = models.IntegerField()  # Storage limit in GB
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - ${self.price}/{self.duration_days} days"

class HospitalSubscription(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='subscriptions')
    subscription = models.ForeignKey(Subscription, on_delete=models.PROTECT)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', 'Active'),
            ('EXPIRED', 'Expired'),
            ('CANCELLED', 'Cancelled'),
            ('PENDING', 'Pending Payment')
        ],
        default='PENDING'
    )
    auto_renew = models.BooleanField(default=True)
    payment_method = models.CharField(max_length=100)
    last_payment_date = models.DateTimeField(null=True, blank=True)
    next_payment_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.hospital.name} - {self.subscription.name}"

class PlatformRevenue(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE)
    consultation = models.ForeignKey('Appointment', on_delete=models.CASCADE)
    bill = models.ForeignKey('Bill', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    percentage_cut = models.DecimalField(max_digits=5, decimal_places=2)  # Platform's percentage
    platform_earning = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('PROCESSED', 'Processed'),
            ('PAID', 'Paid to Platform'),
            ('FAILED', 'Failed')
        ],
        default='PENDING'
    )
    transaction_date = models.DateTimeField(auto_now_add=True)
    payout_date = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Calculate platform earnings
        self.platform_earning = (self.amount * self.percentage_cut) / 100
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.hospital.name} - ${self.platform_earning}"

class PlatformSettings(models.Model):
    default_percentage_cut = models.DecimalField(max_digits=5, decimal_places=2)
    platform_name = models.CharField(max_length=100)
    platform_email = models.EmailField()
    support_phone = models.CharField(max_length=20)
    support_email = models.EmailField()
    terms_conditions = models.TextField()
    privacy_policy = models.TextField()
    maintenance_mode = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Platform Settings"

    def __str__(self):
        return f"{self.platform_name} Settings"

class PlatformStatistics(models.Model):
    date = models.DateField(unique=True)
    total_hospitals = models.IntegerField(default=0)
    active_subscriptions = models.IntegerField(default=0)
    total_consultations = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    platform_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    new_registrations = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Platform Statistics"
        ordering = ['-date']

    def __str__(self):
        return f"Statistics for {self.date}"

class HospitalAudit(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE)
    total_patients = models.IntegerField(default=0)
    total_staff = models.IntegerField(default=0)
    total_consultations = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    platform_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    storage_used_gb = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    audit_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['hospital', 'audit_date']
        ordering = ['-audit_date']

    def __str__(self):
        return f"Audit - {self.hospital.name} - {self.audit_date}"

# ============= Surgery Management System =============

class SurgeryType(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)  # Standard surgery code
    description = models.TextField()
    typical_duration = models.DurationField()
    risk_level = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Low Risk'),
            ('MODERATE', 'Moderate Risk'),
            ('HIGH', 'High Risk'),
            ('CRITICAL', 'Critical')
        ]
    )
    specialization_required = models.CharField(max_length=100)
    pre_requisites = models.JSONField(default=dict)  # Required tests, conditions
    post_op_care = models.JSONField(default=dict)  # Standard post-op care instructions
    equipment_needed = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

class SurgerySchedule(models.Model):
    patient = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='surgeries')
    surgery_type = models.ForeignKey(SurgeryType, on_delete=models.PROTECT)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE)
    lead_surgeon = models.ForeignKey(
        MedicalProfessional, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='lead_surgeries'
    )
    scheduled_date = models.DateTimeField()
    estimated_duration = models.DurationField()
    operating_room = models.CharField(max_length=50)
    status = models.CharField(
        max_length=20,
        choices=[
            ('SCHEDULED', 'Scheduled'),
            ('PREPARATION', 'In Preparation'),
            ('IN_PROGRESS', 'In Progress'),
            ('COMPLETED', 'Completed'),
            ('CANCELLED', 'Cancelled'),
            ('POSTPONED', 'Postponed')
        ],
        default='SCHEDULED'
    )
    priority = models.CharField(
        max_length=20,
        choices=[
            ('ELECTIVE', 'Elective'),
            ('URGENT', 'Urgent'),
            ('EMERGENCY', 'Emergency')
        ],
        default='ELECTIVE'
    )
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['scheduled_date', 'status']),
            models.Index(fields=['hospital', 'operating_room']),
        ]

    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.surgery_type.name}"

class SurgicalTeam(models.Model):
    surgery = models.ForeignKey(SurgerySchedule, on_delete=models.CASCADE, related_name='team_members')
    member = models.ForeignKey(MedicalProfessional, on_delete=models.CASCADE)
    role = models.CharField(
        max_length=50,
        choices=[
            ('SURGEON', 'Surgeon'),
            ('ASSISTANT_SURGEON', 'Assistant Surgeon'),
            ('ANESTHESIOLOGIST', 'Anesthesiologist'),
            ('SCRUB_NURSE', 'Scrub Nurse'),
            ('CIRCULATING_NURSE', 'Circulating Nurse')
        ]
    )
    is_confirmed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['surgery', 'member', 'role']

    def __str__(self):
        return f"{self.member.user.get_full_name()} - {self.role}"

class PreOpAssessment(models.Model):
    surgery = models.OneToOneField(SurgerySchedule, on_delete=models.CASCADE, related_name='pre_op')
    assessed_by = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)
    assessment_date = models.DateTimeField()
    vital_signs = models.JSONField()
    medical_history = models.TextField()
    medications = models.TextField()
    allergies = models.TextField()
    physical_examination = models.JSONField()
    lab_results = models.JSONField()
    anesthesia_plan = models.TextField()
    risk_assessment = models.TextField()
    clearance_status = models.CharField(
        max_length=20,
        choices=[
            ('CLEARED', 'Cleared for Surgery'),
            ('PENDING', 'Pending Additional Tests'),
            ('NOT_CLEARED', 'Not Cleared'),
            ('CONDITIONAL', 'Conditional Clearance')
        ]
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class SurgeryReport(models.Model):
    surgery = models.OneToOneField(SurgerySchedule, on_delete=models.CASCADE, related_name='report')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    procedure_details = models.TextField()
    complications = models.TextField(blank=True)
    anesthesia_notes = models.TextField()
    estimated_blood_loss = models.CharField(max_length=50)
    specimens_collected = models.TextField(blank=True)
    implants_used = models.JSONField(default=list)
    surgical_findings = models.TextField()
    post_op_instructions = models.TextField()
    recorded_by = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PostOpCare(models.Model):
    surgery = models.OneToOneField(SurgerySchedule, on_delete=models.CASCADE, related_name='post_op')
    recovery_room = models.CharField(max_length=50)
    admission_time = models.DateTimeField()
    discharge_time = models.DateTimeField(null=True, blank=True)
    vital_signs_log = models.JSONField(default=list)
    pain_management = models.TextField()
    medications_given = models.JSONField(default=list)
    complications = models.TextField(blank=True)
    nursing_notes = models.TextField()
    discharge_criteria = models.JSONField(default=list)
    follow_up_instructions = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('IN_RECOVERY', 'In Recovery'),
            ('OBSERVATION', 'Under Observation'),
            ('DISCHARGED', 'Discharged'),
            ('TRANSFERRED', 'Transferred to Ward')
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class SurgeryConsent(models.Model):
    surgery = models.OneToOneField(SurgerySchedule, on_delete=models.CASCADE, related_name='consent')
    patient = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    signed_by = models.CharField(max_length=100)  # Name of person who signed
    relationship_to_patient = models.CharField(  # If not patient
        max_length=50,
        blank=True
    )
    consent_document = models.FileField(upload_to='surgery_consents/')
    risks_discussed = models.JSONField(default=list)
    alternatives_discussed = models.TextField()
    witness = models.CharField(max_length=100)
    signed_at = models.DateTimeField()
    is_valid = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Consent for {self.surgery.surgery_type.name} - {self.patient.get_full_name()}"

# ============= RESOURCES, Research & Analytics System =================

class Resource(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=RESOURCE_CATEGORIES)
    specialty = models.CharField(max_length=50, choices=MEDICAL_SPECIALTIES)
    evidence_level = models.CharField(max_length=20, choices=EVIDENCE_LEVELS)
    file = models.FileField(upload_to='resources/')
    uploaded_by = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    institution = models.CharField(max_length=200)
    keywords = models.TextField()  # Modified from JSONField to TextField for compatibility
    citations = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Adjusted max_digits for compatibility
    reviews_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def set_keywords(self, keywords):
        """Method to save keywords as a JSON string."""
        self.keywords = json.dumps(keywords)

    def get_keywords(self):
        """Method to retrieve keywords as a Python list."""
        return json.loads(self.keywords)

class ResearchProject(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    principal_investigator = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PROPOSED', 'Proposed'),
            ('APPROVED', 'Approved'),
            ('IN_PROGRESS', 'In Progress'),
            ('COMPLETED', 'Completed'),
            ('PUBLISHED', 'Published'),
            ('ARCHIVED', 'Archived')
        ]
    )
    ethics_approval_number = models.CharField(max_length=100, null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_ai_enabled = models.BooleanField(default=True)
    keywords = models.JSONField()  # Store research keywords
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.hospital.name}"
class ResearchField(models.Model):
    """Dynamic research fields created by admin"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    required_qualifications = models.JSONField()
    ethical_guidelines = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

class ResearchMethodology(models.Model):
    """Research methodologies for different fields"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    field = models.ForeignKey(ResearchField, on_delete=models.CASCADE)
    steps = models.JSONField()
    required_resources = models.JSONField()
    validation_criteria = models.JSONField()

class ResearchEthicsApproval(models.Model):
    """Track ethics approvals for research projects"""
    project = models.OneToOneField(ResearchProject, on_delete=models.CASCADE)
    application_date = models.DateTimeField(auto_now_add=True)
    approval_status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending Review'),
            ('APPROVED', 'Approved'),
            ('REJECTED', 'Rejected'),
            ('REVISIONS', 'Needs Revisions')
        ]
    )
    committee_feedback = models.TextField(null=True, blank=True)
    approval_date = models.DateTimeField(null=True, blank=True)
    expiry_date = models.DateTimeField(null=True, blank=True)

class ResearchFunding(models.Model):
    """Track research funding and grants"""
    project = models.ForeignKey(ResearchProject, on_delete=models.CASCADE)
    funding_source = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    requirements = models.JSONField()
    reporting_schedule = models.JSONField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', 'Active'),
            ('PENDING', 'Pending'),
            ('COMPLETED', 'Completed'),
            ('TERMINATED', 'Terminated')
        ]
    )

class ResearchCollaboration(models.Model):
    """Track collaborations between institutions"""
    project = models.ForeignKey(ResearchProject, on_delete=models.CASCADE)
    institution = models.ForeignKey(Hospital, on_delete=models.CASCADE)
    collaboration_type = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    responsibilities = models.JSONField()
    resources_committed = models.JSONField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', 'Active'),
            ('PENDING', 'Pending'),
            ('COMPLETED', 'Completed'),
            ('TERMINATED', 'Terminated')
        ]
    )
class ResearchCriteria(models.Model):
    """Defines inclusion/exclusion criteria for research"""
    project = models.ForeignKey(ResearchProject, on_delete=models.CASCADE, related_name='criteria')
    criteria_type = models.CharField(
        max_length=20,
        choices=[
            ('INCLUSION', 'Inclusion'),
            ('EXCLUSION', 'Exclusion')
        ]
    )
    category = models.CharField(
        max_length=20,
        choices=[
            ('AGE', 'Age Range'),
            ('GENDER', 'Gender'),
            ('DIAGNOSIS', 'Diagnosis'),
            ('MEDICATION', 'Medication'),
            ('LAB_RESULT', 'Lab Result'),
            ('PROCEDURE', 'Procedure'),
            ('CUSTOM', 'Custom')
        ]
    )
    condition = models.JSONField()  # Store complex criteria as JSON
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project.title} - {self.criteria_type} - {self.category}"

class ResearchCohort(models.Model):
    """Groups of patients meeting research criteria"""
    project = models.ForeignKey(ResearchProject, on_delete=models.CASCADE, related_name='cohorts')
    name = models.CharField(max_length=100)
    description = models.TextField()
    patients = models.ManyToManyField(UserProfile, through='CohortMembership')
    is_control_group = models.BooleanField(default=False)
    size = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project.title} - {self.name}"

class CohortMembership(models.Model):
    """Tracks patient participation in research cohorts"""
    cohort = models.ForeignKey(ResearchCohort, on_delete=models.CASCADE)
    patient = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    joined_date = models.DateTimeField(auto_now_add=True)
    consent_date = models.DateTimeField(null=True, blank=True)
    withdrawn_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('ELIGIBLE', 'Eligible'),
            ('CONSENTED', 'Consented'),
            ('ACTIVE', 'Active'),
            ('COMPLETED', 'Completed'),
            ('WITHDRAWN', 'Withdrawn')
        ],
        default='ELIGIBLE'
    )

    def __str__(self):
        return f"{self.patient.hpn} - {self.cohort.name}"

class DataPoint(models.Model):
    """Stores research-specific data points"""
    cohort = models.ForeignKey(ResearchCohort, on_delete=models.CASCADE)
    patient = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    category = models.CharField(max_length=50)  # Type of data point
    value = models.JSONField()  # Flexible storage for different types of data
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['category', 'timestamp']),
        ]

class AnalyticsReport(models.Model):
    """AI-generated analytics and insights"""
    project = models.ForeignKey(ResearchProject, on_delete=models.CASCADE, related_name='reports')
    title = models.CharField(max_length=255)
    report_type = models.CharField(
        max_length=20,
        choices=[
            ('TREND', 'Trend Analysis'),
            ('CORRELATION', 'Correlation Analysis'),
            ('PREDICTION', 'Predictive Analysis'),
            ('COMPARATIVE', 'Comparative Analysis'),
            ('OUTCOME', 'Outcome Analysis')
        ]
    )
    parameters = models.JSONField()  # Analysis parameters
    results = models.JSONField()  # Analysis results
    visualizations = models.JSONField(null=True, blank=True)  # Visualization configs
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2)
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project.title} - {self.report_type}"

class ResearchPublication(models.Model):
    """Track research publications and outcomes"""
    project = models.ForeignKey(ResearchProject, on_delete=models.CASCADE, related_name='publications')
    title = models.CharField(max_length=255)
    authors = models.JSONField()  # List of authors and affiliations
    abstract = models.TextField()
    publication_date = models.DateField()
    journal = models.CharField(max_length=255, null=True, blank=True)
    doi = models.CharField(max_length=100, null=True, blank=True)
    url = models.URLField(null=True, blank=True)
    citation_count = models.IntegerField(default=0)
    keywords = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.publication_date})"

class AIModel(models.Model):
    """Track AI models used in research"""
    name = models.CharField(max_length=100)
    version = models.CharField(max_length=20)
    description = models.TextField()
    model_type = models.CharField(
        max_length=20,
        choices=[
            ('DIAGNOSTIC', 'Diagnostic'),
            ('PREDICTIVE', 'Predictive'),
            ('CLASSIFICATION', 'Classification'),
            ('REGRESSION', 'Regression'),
            ('NLP', 'Natural Language Processing')
        ]
    )
    training_data = models.JSONField()  # Training data specifications
    performance_metrics = models.JSONField()  # Model performance metrics
    is_active = models.BooleanField(default=True)
    last_trained = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} v{self.version}"  

# ============= Communication System =============
# Communication System
class Message(models.Model):
    sender = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=200)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    attachment = models.FileField(upload_to='message_attachments/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

class TelemedicineSession(models.Model):
    patient = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='telemedicine_sessions')
    doctor = models.ForeignKey(MedicalProfessional, on_delete=models.CASCADE)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE)
    session_url = models.URLField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('SCHEDULED', 'Scheduled'),
            ('IN_PROGRESS', 'In Progress'),
            ('COMPLETED', 'Completed'),
            ('CANCELLED', 'Cancelled')
        ],
        default='SCHEDULED'
    )
    notes = models.TextField(null=True, blank=True)
    recording_url = models.URLField(null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)

# Advanced Analytics
class AnalyticsMetric(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(
        max_length=20,
        choices=[
            ('PATIENT', 'Patient Metrics'),
            ('HOSPITAL', 'Hospital Metrics'),
            ('STAFF', 'Staff Metrics'),
            ('FINANCIAL', 'Financial Metrics')
        ]
    )
    calculation_method = models.TextField()  # JSON containing calculation logic
    is_active = models.BooleanField(default=True)

class MetricLog(models.Model):
    metric = models.ForeignKey(AnalyticsMetric, on_delete=models.CASCADE)
    entity_type = models.CharField(max_length=50)  # e.g., 'patient', 'doctor', 'department'
    entity_id = models.IntegerField()
    value = models.JSONField()  # Store complex metric data
    timestamp = models.DateTimeField(auto_now_add=True)

#================ Workflow Management =================
class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    assigned_to = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='assigned_tasks')
    created_by = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='created_tasks')
    department = models.CharField(max_length=100, null=True, blank=True)
    priority = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Low'),
            ('MEDIUM', 'Medium'),
            ('HIGH', 'High'),
            ('URGENT', 'Urgent')
        ],
        default='MEDIUM'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING', 'Pending'),
            ('IN_PROGRESS', 'In Progress'),
            ('COMPLETED', 'Completed'),
            ('CANCELLED', 'Cancelled')
        ],
        default='PENDING'
    )
    due_date = models.DateTimeField()
    completed_at = models.DateTimeField(null=True, blank=True)

class Protocol(models.Model):
    name = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    steps = models.JSONField()  # Ordered list of steps
    required_role = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

#================= Integration Systems =================
class ExternalSystem(models.Model):
    name = models.CharField(max_length=100)
    system_type = models.CharField(
        max_length=20,
        choices=[
            ('LAB', 'Laboratory System'),
            ('PHARMACY', 'Pharmacy System'),
            ('INSURANCE', 'Insurance System'),
            ('DEVICE', 'Medical Device')
        ]
    )
    api_key = models.CharField(max_length=255)
    api_secret = models.CharField(max_length=255)
    endpoint_url = models.URLField()
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(null=True, blank=True)

class IntegrationLog(models.Model):
    system = models.ForeignKey(ExternalSystem, on_delete=models.CASCADE)
    action = models.CharField(max_length=100)
    request_data = models.JSONField()
    response_data = models.JSONField(null=True, blank=True)
    success = models.BooleanField()
    error_message = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

#================== IoT Device Management =================
class MedicalDevice(models.Model):
    name = models.CharField(max_length=100)
    device_type = models.CharField(max_length=50)
    serial_number = models.CharField(max_length=100, unique=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE)
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    last_maintenance = models.DateTimeField(null=True, blank=True)
    next_maintenance = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', 'Active'),
            ('MAINTENANCE', 'Under Maintenance'),
            ('INACTIVE', 'Inactive'),
            ('FAULTY', 'Faulty')
        ],
        default='ACTIVE'
    )

class DeviceReading(models.Model):
    device = models.ForeignKey(MedicalDevice, on_delete=models.CASCADE)
    patient = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True, blank=True)
    reading_type = models.CharField(max_length=50)
    value = models.JSONField()
    unit = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_abnormal = models.BooleanField(default=False)
    notes = models.TextField(null=True, blank=True)

# ============= System Payments =============
class PaymentMethod(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    # Store payment processor token, not actual card details
    processor_token = models.CharField(max_length=255)
    last_four = models.CharField(max_length=4)  # Last 4 digits for display
    card_type = models.CharField(max_length=20)  # visa, mastercard, etc.
    exp_month = models.CharField(max_length=2)   # MM format
    exp_year = models.CharField(max_length=2)    # YY format
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payment_methods'
        indexes = [
            models.Index(fields=['user', 'is_default']),
        ]

class PaymentTransaction(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.PROTECT)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20)
    processor_reference = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

# ============= Preventive Care System =============
class Immunization(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='immunizations')
    vaccine_name = models.CharField(max_length=200)
    vaccine_code = models.CharField(max_length=50)  # CVX code
    dose_number = models.IntegerField()
    date_administered = models.DateTimeField()
    next_due_date = models.DateTimeField(null=True, blank=True)
    administered_by = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)
    manufacturer = models.CharField(max_length=100)
    lot_number = models.CharField(max_length=50)
    site = models.CharField(max_length=50)  # Body site where vaccine was administered
    route = models.CharField(max_length=50)  # How vaccine was administered
    status = models.CharField(
        max_length=20,
        choices=[
            ('COMPLETED', 'Completed'),
            ('OVERDUE', 'Overdue'),
            ('UPCOMING', 'Upcoming')
        ]
    )
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vaccine_name} - Dose {self.dose_number}"

# ============= Mental Health System =============
class MentalHealthAssessment(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='mental_health_assessments')
    assessment_type = models.CharField(
        max_length=50,
        choices=[
            ('PHQ9', 'Depression Screening'),
            ('GAD7', 'Anxiety Assessment'),
            ('MOOD', 'Mood Assessment'),
            ('COGNITIVE', 'Cognitive Assessment')
        ]
    )
    score = models.IntegerField()
    severity = models.CharField(
        max_length=20,
        choices=[
            ('MINIMAL', 'Minimal'),
            ('MILD', 'Mild'),
            ('MODERATE', 'Moderate'),
            ('SEVERE', 'Severe')
        ]
    )
    assessed_by = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)
    assessment_date = models.DateTimeField()
    next_assessment_date = models.DateTimeField(null=True, blank=True)
    recommendations = models.TextField()
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.assessment_type} - {self.assessment_date}"

# ============= Family History System =============
class FamilyHistory(models.Model):
    medical_record = models.OneToOneField(MedicalRecord, on_delete=models.CASCADE, related_name='family_history')
    mother = models.TextField(blank=True)
    father = models.TextField(blank=True)
    siblings = models.TextField(blank=True)
    maternal_history = models.TextField(blank=True)
    paternal_history = models.TextField(blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.relation} - {self.condition}"

# ============= Reproductive Health System =============
class MenstrualCycle(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='menstrual_cycles')
    cycle_startdate = models.DateField()
    cycle_enddate = models.DateField(null=True, blank=True)
    cycle_length = models.IntegerField()
    flow_intensity = models.CharField(
        max_length=20,
        choices=[
            ('LIGHT', 'Light'),
            ('MODERATE', 'Moderate'),
            ('HEAVY', 'Heavy')
        ]
    )
    symptoms = models.JSONField(default=list)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cycle starting {self.cycle_startdate}"

class FertilityAssessment(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='fertility_assessments')
    assessment_date = models.DateTimeField()
    assessed_by = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)
    amh_level = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    follicle_count = models.IntegerField(null=True, blank=True)
    uterine_findings = models.TextField(null=True, blank=True)
    ovarian_findings = models.TextField(null=True, blank=True)
    recommendations = models.TextField()
    next_assessment = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Fertility Assessment - {self.assessment_date}"

class HormonePanel(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='hormone_panels')
    test_date = models.DateField()
    estrogen_level = models.CharField(max_length=50)
    progesterone_level = models.CharField(max_length=50)
    fsh_level = models.CharField(max_length=50)
    lh_level = models.CharField(max_length=50)
    testosterone_level = models.CharField(max_length=50)
    prolactin_level = models.CharField(max_length=50)
    is_abnormal = models.BooleanField(default=False)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Hormone Panel - {self.test_date}"

class GynecologicalExam(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='gynecological_exams')
    exam_date = models.DateTimeField()
    performed_by = models.ForeignKey(MedicalProfessional, on_delete=models.SET_NULL, null=True)
    exam_type = models.CharField(
        max_length=50,
        choices=[
            ('ROUTINE', 'Routine Checkup'),
            ('PROBLEM', 'Problem-Focused'),
            ('FOLLOWUP', 'Follow-up'),
            ('EMERGENCY', 'Emergency')
        ]
    )
    findings = models.TextField()
    pap_smear_done = models.BooleanField(default=False)
    pap_smear_result = models.CharField(
        max_length=50,
        choices=[
            ('NORMAL', 'Normal'),
            ('ABNORMAL', 'Abnormal'),
            ('PENDING', 'Pending')
        ],
        null=True,
        blank=True
    )
    breast_exam_done = models.BooleanField(default=False)
    breast_exam_findings = models.TextField(null=True, blank=True)
    recommendations = models.TextField()
    next_exam_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Gynecological Exam - {self.exam_date}"

class PregnancyHistory(models.Model):
    medical_record = models.OneToOneField(MedicalRecord, on_delete=models.CASCADE, related_name='pregnancy_history')
    total_pregnancies = models.IntegerField(default=0)
    live_births = models.IntegerField(default=0)
    miscarriages = models.IntegerField(default=0)
    complications = models.TextField(blank=True)

class ChronicCondition(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='chronic_conditions')
    condition = models.CharField(max_length=200)
    diagnosed_date = models.DateField()
    status = models.CharField(max_length=50)
    treatment = models.TextField()
    notes = models.TextField(blank=True)

class DiagnosticImage(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='diagnostic_images')
    type = models.CharField(max_length=100)
    date = models.DateField()
    facility = models.CharField(max_length=200)
    ordering_doctor = models.CharField(max_length=200)
    findings = models.TextField()
    recommendations = models.TextField()
    image_url = models.URLField(max_length=500)  # Store URL to image in cloud storage

class SurgicalProcedure(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='surgical_procedures')
    procedure = models.CharField(max_length=255)
    date = models.DateTimeField()
    surgeon = models.CharField(max_length=255)
    facility = models.CharField(max_length=255)
    complications = models.TextField(null=True, blank=True)
    operative_findings = models.TextField()
    pathology_report = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.procedure} - {self.date}"

class OncologyTreatmentPlan(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='oncology_treatment_plans')
    diagnosis_details = models.TextField()
    treatment_intent = models.CharField(max_length=100)
    chemotherapy_protocol = models.TextField()
    response_assessment = models.TextField()
    toxicity_monitoring = models.TextField()
    supportive_care = models.TextField()
    follow_up_plan = models.TextField()
    genetic_counseling_notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Treatment Plan for {self.medical_record.patient}"
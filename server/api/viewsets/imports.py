# Standard library imports
import json
import urllib.parse
from datetime import date, datetime, timedelta
import io
import zipfile
from typing import List

# Django imports
from django.conf import settings
from django.core.mail import send_mail, EmailMultiAlternatives
from django.db.models import Count, Case, When, IntegerField, Q, Sum, Avg
from django.http import HttpResponseRedirect
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.http import FileResponse
from django.utils.html import strip_tags
from django.db.models import (
    Count, F, Q, Avg, Sum, FloatField, Case, When, 
    IntegerField, ExpressionWrapper, DurationField, CharField
)

# Scientific computing
from scipy.ndimage import rotate

# Django REST Framework imports
from rest_framework import status, viewsets, permissions, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.pagination import PageNumberPagination

# AI/ML imports (for demonstration purposes)
from django.db.models import Count, Avg, Sum, F
from django.db.models.functions import TruncDate, ExtractMonth, ExtractYear
import pandas as pd
import pytz
from typing import Dict, Any, List

from django.db.models import (
    Count, F, Q, Avg, Sum, FloatField, Case, When, 
    IntegerField, ExpressionWrapper
)
from django.db.models.functions import (
    TruncDate, 
    ExtractYear, 
    ExtractMonth,
    Cast
)
from django.utils import timezone
from datetime import datetime, timedelta
from typing import Dict, Any, List
import numpy as np

# Local imports
from api.models import (
    MedicalCase, Department, MedicalImage, UserProfile, Hospital, MedicalProfessional, RecordShare, MedicalRecord, AccessLog,
    HospitalRegistration, HospitalStaff, HospitalAffiliation, Appointment,
    Diagnosis, Medication, Procedure, LabResult, Insurance, Bill, BillItem,
    Subscription, HospitalSubscription, PlatformRevenue, PlatformStatistics,
    ResearchProject, ResearchCriteria, ResearchCohort, CohortMembership,
    DataPoint, AnalyticsReport, AIModel, HospitalAudit,SurgeryType, SurgerySchedule, SurgicalTeam, PreOpAssessment,
    SurgeryReport, PostOpCare, SurgeryConsent, Message, TelemedicineSession, Resource, GPPractice, GeneralPractitioner, PatientGPRegistration,
    Immunization, MentalHealthAssessment, FamilyHistory,
    MenstrualCycle, FertilityAssessment, HormonePanel, GynecologicalExam, CustomUser
)


from api.serializers import (
    BasicDepartmentSerializer, BasicHospitalSerializer, MedicalCaseSerializer, MedicalImageSerializer, UserProfileSerializer, HospitalSerializer, MedicalProfessionalSerializer,
    MedicalRecordSerializer, AccessLogSerializer, HospitalRegistrationSerializer,
    HospitalStaffSerializer, HospitalAffiliationSerializer, AppointmentSerializer,
    DiagnosisSerializer, MedicationSerializer, ProcedureSerializer,
    LabResultSerializer, InsuranceSerializer, BillSerializer, BillItemSerializer,
    SubscriptionSerializer, HospitalSubscriptionSerializer,
    PlatformRevenueSerializer, PlatformStatisticsSerializer,
    ResearchProjectSerializer, ResearchCriteriaSerializer,
    ResearchCohortSerializer, AnalyticsReportSerializer,
    ResearchPublicationSerializer, AIModelSerializer, HospitalAuditSerializer, MessageSerializer, TelemedicineSessionSerializer,
    AnalyticsMetricSerializer, MetricLogSerializer,
    TaskSerializer, ProtocolSerializer,
    ExternalSystemSerializer, IntegrationLogSerializer,
    MedicalDeviceSerializer, DeviceReadingSerializer, SurgeryTypeSerializer, SurgeryScheduleSerializer, SurgicalTeamSerializer,
    PreOpAssessmentSerializer, SurgeryReportSerializer, PostOpCareSerializer,
    SurgeryConsentSerializer, RecordShareSerializer, ResourceSerializer, GPPracticeSerializer, GeneralPractitionerSerializer, PatientGPRegistrationSerializer,
    ImmunizationSerializer, MentalHealthAssessmentSerializer, FamilyHistorySerializer,
    MenstrualCycleSerializer, FertilityAssessmentSerializer, HormonePanelSerializer, GynecologicalExamSerializer
)
from api.utils.social_auth import verify_google_token, verify_apple_token

def generate_secure_link(case: MedicalCase, recipient: str) -> str:
    """Generate a secure, time-limited sharing link"""
    token = get_random_string(64)
    expiry = datetime.now() + settings.SHARING_LINK_EXPIRY
    
    # Store sharing token in database
    case.sharing_tokens.create(
        token=token,
        recipient=recipient,
        expires_at=expiry
    )
    
    return f"{settings.BASE_URL}/shared/case/{token}"

def send_case_share_notification(recipient: str, case: MedicalCase, link: str):
    """Send email notification for shared case"""
    subject = f"Medical Case Shared: {case.title}"
    message = f"""
    A medical case has been shared with you.
    
    Case: {case.title}
    Department: {case.department}
    Patient ID: {case.patient_id}
    
    View the case here: {link}
    
    This link will expire in {settings.SHARING_LINK_EXPIRY.days} days.
    """
    
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient],
        fail_silently=False
    )
# Global functions

class LoggingMixin:
    def log_action(self, action_type, description, success=True):
        try:
            AccessLog.objects.create(
                user=self.request.user,
                action_type=action_type,
                description=description,
                success=success,
                ip_address=self.request.META.get('REMOTE_ADDR')
            )
        except Exception as e:
            print(f"Logging failed: {str(e)}")

class NotificationMixin:
    def send_notification(self, recipient, subject, template_name, context):
        try:
            html_message = render_to_string(
                f'notifications/{template_name}.html',
                context
            )
            send_mail(
                subject=subject,
                message=strip_tags(html_message),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient.email],
                html_message=html_message
            )
        except Exception as e:
            print(f"Notification failed: {str(e)}")

# Utility Functions
def calculate_timeframe(timeframe: str) -> datetime:
    """Calculate the start date based on the timeframe parameter."""
    now = timezone.now()
    timeframe_map = {
        '1M': timedelta(days=30),
        '3M': timedelta(days=90),
        '6M': timedelta(days=180),
        '1Y': timedelta(days=365),
        'ALL': timedelta(days=3650)
    }
    return now - timeframe_map.get(timeframe, timeframe_map['1M'])

def process_analytics_data(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Process and transform raw database records into analytics format."""
    processed_data = []
    
    for record in records:
        region_data = {
            'region': record['region'],
            'caseCount': record['case_count'],
            'prevalence': calculate_prevalence(record),
            'riskLevel': determine_risk_level(record),
            'conditions': process_conditions(record.get('conditions', [])),
            'demographics': calculate_demographics(record['region']),
            'trends': calculate_trends(record['region']),
        }
        processed_data.append(region_data)
    
    return {
        'data': processed_data,
        'metadata': {
            'totalCases': sum(r['caseCount'] for r in processed_data),
            'averagePrevalence': np.mean([r['prevalence'] for r in processed_data]),
            'updatedAt': timezone.now().isoformat()
        }
    }

def calculate_prevalence(record: Dict[str, Any]) -> float:
    """Calculate disease prevalence for a region."""
    total_population = Hospital.objects.filter(
        city=record['region']
    ).aggregate(
        total_patients=Count('medical_records__patient', distinct=True)
    )['total_patients'] or 1
    
    return (record['case_count'] / total_population) * 100

def determine_risk_level(record: Dict[str, Any]) -> str:
    """Determine risk level based on metrics."""
    prevalence = calculate_prevalence(record)
    return (
        'High' if prevalence >= 10 
        else 'Medium' if prevalence >= 5 
        else 'Low'
    )

def process_conditions(conditions: List[str]) -> List[Dict[str, Any]]:
    """Process and group conditions by frequency."""
    from collections import Counter
    
    if not conditions:
        return []
    
    condition_counts = Counter(conditions)
    total_conditions = sum(condition_counts.values())
    
    return [
        {
            'name': condition,
            'count': count,
            'percentage': (count / total_conditions) * 100
        }
        for condition, count in condition_counts.most_common(10)
    ]

def calculate_demographics(region: str) -> Dict[str, Any]:
    """Calculate demographic information for a region."""
    now = timezone.now()
    
    demographics = MedicalRecord.objects.filter(
        hospital__city=region
    ).aggregate(
        total_patients=Count('patient', distinct=True),
        avg_age=Avg(
            ExpressionWrapper(
                now.year - ExtractYear('patient__date_of_birth'),
                output_field=IntegerField()
            )
        ),
        high_risk_ratio=Cast(
            Count('patient', filter=Q(patient__is_high_risk=True)),
            FloatField()
        ) / Cast(Count('patient'), FloatField())
    )
    
    # Get age distribution
    age_groups = MedicalRecord.objects.filter(
        hospital__city=region
    ).annotate(
        age_group=Case(
            When(patient__date_of_birth__year__gte=now.year-18, then='0-18'),
            When(patient__date_of_birth__year__gte=now.year-35, then='19-35'),
            When(patient__date_of_birth__year__gte=now.year-50, then='36-50'),
            When(patient__date_of_birth__year__gte=now.year-65, then='51-65'),
            default='65+',
            output_field=CharField(),
        )
    ).values('age_group').annotate(
        count=Count('id')
    ).order_by('age_group')
    
    return {
        'summary': demographics,
        'ageGroups': list(age_groups),
    }

def calculate_trends(region: str) -> List[Dict[str, Any]]:
    """Calculate health trends over time."""
    return list(MedicalRecord.objects.filter(
        hospital__city=region
    ).annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        value=Count('id')
    ).order_by('date'))

# Custom Permissions
class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser

class IsHospitalAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            staff = HospitalStaff.objects.get(user=request.user)
            return staff.role == 'ADMIN'
        except HospitalStaff.DoesNotExist:
            return False

class IsDepartmentManager(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            staff = HospitalStaff.objects.get(user=request.user)
            return staff.role == 'MANAGER'
        except HospitalStaff.DoesNotExist:
            return False

class IsMedicalProfessional(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'medicalprofessional')

class IsVerifiedMedicalProfessional(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            return request.user.medicalprofessional.is_verified
        except:
            return False

class IsPatientOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.patient.id == request.user.id

class IsHospitalStaff(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        try:
            return request.user.hospitalstaff.hospital == obj.hospital
        except:
            return False

class IsResearchTeamMember(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            return request.user.medicalprofessional.researchprojects.exists()
        except:
            return False

# Mixins
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000

class LoggingMixin:
    def log_action(self, action_type, description, success=True):
        try:
            AccessLog.objects.create(
                user=self.request.user,
                action_type=action_type,
                description=description,
                success=success,
                ip_address=self.request.META.get('REMOTE_ADDR')
            )
        except Exception as e:
            print(f"Logging failed: {str(e)}")

class NotificationMixin:
    def send_notification(self, recipient, subject, template_name, context):
        try:
            html_message = render_to_string(
                f'notifications/{template_name}.html',
                context
            )
            send_mail(
                subject=subject,
                message=strip_tags(html_message),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient.email],
                html_message=html_message
            )
        except Exception as e:
            print(f"Notification failed: {str(e)}")

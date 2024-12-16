
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
import pydicom  # For DICOM file handling

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
from .models import (
    MedicalCase, Department, MedicalImage, UserProfile, Hospital, MedicalProfessional, RecordShare, MedicalRecord, AccessLog,
    HospitalRegistration, HospitalStaff, HospitalAffiliation, Appointment,
    Diagnosis, Medication, Procedure, LabResult, Insurance, Bill, BillItem,
    Subscription, HospitalSubscription, PlatformRevenue, PlatformStatistics,
    ResearchProject, ResearchCriteria, ResearchCohort, CohortMembership,
    DataPoint, AnalyticsReport, AIModel, HospitalAudit,SurgeryType, SurgerySchedule, SurgicalTeam, PreOpAssessment,
    SurgeryReport, PostOpCare, SurgeryConsent, Message, TelemedicineSession, Resource
)


from .serializers import (
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
    SurgeryConsentSerializer, RecordShareSerializer, ResourceSerializer
)
from .utils.social_auth import verify_google_token, verify_apple_token

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
# Update the HealthAnalyticsViewSet
# Add these functions to your existing views.py

class HealthAnalyticsViewSet(viewsets.ViewSet):
    """ViewSet for comprehensive health analytics data."""
    permission_classes = [IsAuthenticated]

    def get_regional_data(self, request):
        """Get regional health analytics data."""
        try:
            timeframe = request.query_params.get('timeframe', '1M')
            
            # Calculate start date based on timeframe
            now = timezone.now()
            start_date = now - {
                '1M': timedelta(days=30),
                '3M': timedelta(days=90),
                '6M': timedelta(days=180),
                '1Y': timedelta(days=365),
            }.get(timeframe, timedelta(days=30))

            # Aggregate medical records data with comprehensive metrics
            records = MedicalRecord.objects.filter(
                created_at__gte=start_date
            ).annotate(
                region=F('hospital__city')
            ).values('region').annotate(
                case_count=Count('id'),
                high_risk_count=Count(
                    'patient',
                    filter=Q(patient__is_high_risk=True)
                ),
                unique_patients=Count('patient', distinct=True),
                avg_recovery_time=Avg('recovery_duration'),
                satisfaction_score=Avg('patient_satisfaction'),
                treatment_success_rate=ExpressionWrapper(
                    Count('id', filter=Q(status='IMPROVED')) * 100.0 / Count('id'),
                    output_field=FloatField()
                )
            )
            
            return Response({
                'data': self.process_regional_data(records),
                'metadata': {
                    'timeframe': timeframe,
                    'total_regions': records.count(),
                    'updated_at': timezone.now().isoformat()
                }
            })
            
        except Exception as e:
            print(f"Analytics error: {str(e)}")  # For debugging
            return Response(
                {'error': 'Failed to process regional analytics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def process_regional_data(self, records):
        """Process and transform regional data for frontend consumption."""
        processed_data = []
        
        for record in records:
            processed_data.append({
                'region': record['region'],
                'metrics': {
                    'caseCount': record['case_count'],
                    'highRiskPatients': record['high_risk_count'],
                    'uniquePatients': record['unique_patients'],
                    'avgRecoveryTime': record['avg_recovery_time'],
                    'satisfactionScore': record['satisfaction_score'],
                    'successRate': record['treatment_success_rate']
                },
                'trends': self.calculate_trends(record['region']),
                'insights': self.generate_insights(record)
            })
        
        return processed_data

    def calculate_trends(self, region):
        """Calculate trends for a specific region."""
        last_month = timezone.now() - timedelta(days=30)
        
        return MedicalRecord.objects.filter(
            hospital__city=region,
            created_at__gte=last_month
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            daily_cases=Count('id'),
            success_rate=ExpressionWrapper(
                Count('id', filter=Q(status='IMPROVED')) * 100.0 / Count('id'),
                output_field=FloatField()
            )
        ).order_by('date')

    def generate_insights(self, record):
        """Generate AI-driven insights from regional data."""
        return {
            'riskLevel': self.determine_risk_level(record),
            'recommendations': self.generate_recommendations(record),
            'alerts': self.generate_alerts(record)
        }

    def determine_risk_level(self, record):
        """Determine overall risk level for a region."""
        high_risk_ratio = record['high_risk_count'] / record['case_count']
        
        if high_risk_ratio >= 0.15:
            return 'HIGH'
        elif high_risk_ratio >= 0.05:
            return 'MEDIUM'
        return 'LOW'

    def generate_recommendations(self, record):
        """Generate data-driven recommendations."""
        recommendations = []
        
        # Example recommendation logic
        if record['high_risk_count'] / record['case_count'] > 0.1:
            recommendations.append({
                'type': 'PREVENTIVE',
                'action': 'Increase preventive care programs',
                'priority': 'HIGH'
            })
            
        if record['satisfaction_score'] < 4.0:
            recommendations.append({
                'type': 'SERVICE',
                'action': 'Review patient satisfaction factors',
                'priority': 'MEDIUM'
            })
            
        return recommendations

    def generate_alerts(self, record):
        """Generate alerts based on metrics."""
        alerts = []
        
        # Example alert logic
        if record['high_risk_count'] > record['case_count'] * 0.2:
            alerts.append({
                'type': 'RISK',
                'message': 'High proportion of high-risk patients',
                'severity': 'HIGH'
            })
            
        if record['treatment_success_rate'] < 70:
            alerts.append({
                'type': 'PERFORMANCE',
                'message': 'Treatment success rate below target',
                'severity': 'MEDIUM'
            })
            
        return alerts

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_dashboard(request):
    """
    Main dashboard endpoint aggregating all analytics data.
    """
    try:
        # Get date range from query parameters
        start_date = parse_date(request.GET.get('start_date'))
        end_date = parse_date(request.GET.get('end_date'))
        
        if not start_date:
            start_date = timezone.now() - timedelta(days=30)
        if not end_date:
            end_date = timezone.now()

        # Get basic metrics
        basic_metrics = MedicalRecord.objects.filter(
            created_at__range=(start_date, end_date)
        ).aggregate(
            total_patients=Count('patient', distinct=True),
            total_visits=Count('id'),
            avg_satisfaction=Avg('patient_satisfaction'),
            success_rate=ExpressionWrapper(
                Count('id', filter=Q(status='IMPROVED')) * 100.0 / Count('id'),
                output_field=FloatField()
            )
        )

        # Get AI insights
        ai_insights = generate_ai_insights(start_date, end_date)

        # Compile response data
        response_data = {
            'quickStats': {
                'totalPatients': basic_metrics['total_patients'],
                'totalVisits': basic_metrics['total_visits'],
                'avgSatisfaction': round(basic_metrics['avg_satisfaction'] or 0, 2),
                'successRate': round(basic_metrics['success_rate'] or 0, 2)
            },
            'aiInsights': ai_insights,
            'trends': calculate_trends(start_date, end_date),
            'performanceMetrics': calculate_performance_metrics(start_date, end_date)
        }

        return Response(response_data)

    except Exception as e:
        print(f"Analytics dashboard error: {str(e)}")  # For debugging
        return Response(
            {'error': 'Failed to generate analytics dashboard'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def parse_date(date_str):
    """Parse date string to datetime object."""
    if not date_str:
        return None
    try:
        return timezone.datetime.fromisoformat(date_str)
    except (ValueError, TypeError):
        return None

def calculate_department_performance(start_date, end_date):
    """
    Calculate performance metrics for each department.
    
    Args:
        start_date (datetime): Start date for metrics calculation
        end_date (datetime): End date for metrics calculation
        
    Returns:
        dict: Department-wise performance metrics
    """
    try:
        return MedicalRecord.objects.filter(
            created_at__range=(start_date, end_date)
        ).values('provider__department').annotate(
            total_cases=Count('id'),
            success_rate=ExpressionWrapper(
                Count('id', filter=Q(status='IMPROVED')) * 100.0 / Cast(Count('id'), FloatField()),
                output_field=FloatField()
            ),
            avg_treatment_duration=Avg('recovery_duration'),
            patient_satisfaction=Avg('patient_satisfaction'),
            readmission_rate=ExpressionWrapper(
                Count(
                    'patient',
                    filter=Q(
                        patient__medical_records__created_at__range=(
                            F('created_at'),
                            F('created_at') + timedelta(days=30)
                        )
                    )
                ) * 100.0 / Cast(Count('id'), FloatField()),
                output_field=FloatField()
            )
        ).order_by('-total_cases')
    except Exception as e:
        print(f"Error calculating department performance: {str(e)}")
        return {}

def calculate_resource_utilization(start_date, end_date):
    """
    Calculate resource utilization metrics across the system.
    
    Args:
        start_date (datetime): Start date for metrics calculation
        end_date (datetime): End date for metrics calculation
        
    Returns:
        dict: Resource utilization metrics
    """
    try:
        # Calculate room utilization
        room_utilization = Appointment.objects.filter(
            appointment_date__range=(start_date, end_date)
        ).aggregate(
            total_slots=Count('id'),
            used_slots=Count('id', filter=~Q(status='CANCELLED')),
            cancellation_rate=ExpressionWrapper(
                Count('id', filter=Q(status='CANCELLED')) * 100.0 / Cast(Count('id'), FloatField()),
                output_field=FloatField()
            )
        )

        # Calculate staff utilization
        staff_utilization = MedicalProfessional.objects.annotate(
            appointments_count=Count(
                'appointment',
                filter=Q(appointment__appointment_date__range=(start_date, end_date))
            ),
            avg_daily_patients=ExpressionWrapper(
                F('appointments_count') / Cast(
                    (end_date - start_date).days + 1,
                    FloatField()
                ),
                output_field=FloatField()
            )
        ).aggregate(
            avg_utilization=Avg('avg_daily_patients'),
            max_utilization=Max('avg_daily_patients'),
            min_utilization=Min('avg_daily_patients')
        )

        # Calculate equipment utilization
        equipment_utilization = MedicalDevice.objects.filter(
            devicereading__timestamp__range=(start_date, end_date)
        ).annotate(
            usage_hours=Count('devicereading') / 60.0,  # Assuming one reading per minute
            utilization_rate=ExpressionWrapper(
                F('usage_hours') * 100.0 / Cast(
                    (end_date - start_date).total_seconds() / 3600,
                    FloatField()
                ),
                output_field=FloatField()
            )
        ).aggregate(
            avg_equipment_utilization=Avg('utilization_rate')
        )

        return {
            'roomUtilization': room_utilization,
            'staffUtilization': staff_utilization,
            'equipmentUtilization': equipment_utilization
        }
    except Exception as e:
        print(f"Error calculating resource utilization: {str(e)}")
        return {}

def calculate_patient_outcomes(start_date, end_date):
    """
    Calculate comprehensive patient outcome metrics.
    
    Args:
        start_date (datetime): Start date for metrics calculation
        end_date (datetime): End date for metrics calculation
        
    Returns:
        dict: Patient outcome metrics
    """
    try:
        # Calculate general outcome metrics
        general_outcomes = MedicalRecord.objects.filter(
            created_at__range=(start_date, end_date)
        ).aggregate(
            total_patients=Count('patient', distinct=True),
            improved_count=Count('id', filter=Q(status='IMPROVED')),
            recovery_time_avg=Avg('recovery_duration'),
            satisfaction_score=Avg('patient_satisfaction')
        )

        # Calculate condition-specific outcomes
        condition_outcomes = Diagnosis.objects.filter(
            medical_record__created_at__range=(start_date, end_date)
        ).values('diagnosis_code', 'description').annotate(
            case_count=Count('id'),
            success_rate=ExpressionWrapper(
                Count('medical_record', filter=Q(medical_record__status='IMPROVED')) * 100.0 /
                Cast(Count('id'), FloatField()),
                output_field=FloatField()
            ),
            avg_treatment_duration=Avg('medical_record__recovery_duration')
        ).order_by('-case_count')

        # Calculate readmission rates
        readmission_data = MedicalRecord.objects.filter(
            created_at__range=(start_date, end_date)
        ).values('patient').annotate(
            readmission_count=Count('id')
        ).aggregate(
            total_readmissions=Count('patient', filter=Q(readmission_count__gt=1)),
            readmission_rate=ExpressionWrapper(
                Count('patient', filter=Q(readmission_count__gt=1)) * 100.0 /
                Cast(Count('patient'), FloatField()),
                output_field=FloatField()
            )
        )

        return {
            'generalOutcomes': general_outcomes,
            'conditionOutcomes': list(condition_outcomes),
            'readmissionMetrics': readmission_data
        }
    except Exception as e:
        print(f"Error calculating patient outcomes: {str(e)}")
        return {}
    
def calculate_readmission_predictions(start_date, end_date):
    """
    Predict potential readmissions based on historical patient data and risk factors.
    Uses a simplified predictive model based on key risk indicators.
    
    Args:
        start_date (datetime): Start date for analysis
        end_date (datetime): End date for analysis
        
    Returns:
        dict: Readmission predictions and risk factors
    """
    try:
        # Get patients with multiple visits
        readmission_patterns = MedicalRecord.objects.filter(
            created_at__range=(start_date, end_date)
        ).values('patient').annotate(
            visit_count=Count('id'),
            avg_time_between_visits=Avg(
                ExpressionWrapper(
                    F('created_at') - F('patient__medical_records__created_at'),
                    output_field=DurationField()
                )
            ),
            has_chronic_condition=Case(
                When(patient__chronic_conditions__isnull=False, then=True),
                default=False,
                output_field=BooleanField()
            )
        ).filter(visit_count__gt=1)

        # Calculate risk scores
        high_risk_count = readmission_patterns.filter(
            Q(visit_count__gt=3) |
            Q(has_chronic_condition=True)
        ).count()

        # Identify common factors in readmissions
        risk_factors = Diagnosis.objects.filter(
            medical_record__patient__in=readmission_patterns.values('patient'),
            medical_record__created_at__range=(start_date, end_date)
        ).values('description').annotate(
            frequency=Count('id')
        ).order_by('-frequency')[:5]

        return {
            'predictedReadmissions': {
                'high_risk_count': high_risk_count,
                'total_monitored': readmission_patterns.count(),
                'risk_factors': list(risk_factors),
                'prediction_confidence': 0.85  # Placeholder for actual ML model confidence
            }
        }
    except Exception as e:
        print(f"Error calculating readmission predictions: {str(e)}")
        return {}

def calculate_treatment_effectiveness(start_date, end_date):
    """
    Analyze treatment effectiveness across different conditions and approaches.
    
    Args:
        start_date (datetime): Start date for analysis
        end_date (datetime): End date for analysis
        
    Returns:
        dict: Treatment effectiveness metrics and insights
    """
    try:
        # Calculate overall treatment effectiveness
        treatment_stats = MedicalRecord.objects.filter(
            created_at__range=(start_date, end_date)
        ).aggregate(
            total_treatments=Count('id'),
            successful_treatments=Count('id', filter=Q(status='IMPROVED')),
            avg_recovery_time=Avg('recovery_duration'),
            avg_satisfaction=Avg('patient_satisfaction')
        )

        # Analyze effectiveness by condition
        condition_effectiveness = Diagnosis.objects.filter(
            medical_record__created_at__range=(start_date, end_date)
        ).values('description').annotate(
            total_cases=Count('id'),
            success_rate=ExpressionWrapper(
                Count('medical_record', filter=Q(medical_record__status='IMPROVED')) * 100.0 /
                Cast(Count('id'), FloatField()),
                output_field=FloatField()
            ),
            avg_recovery_time=Avg('medical_record__recovery_duration')
        ).order_by('-success_rate')

        # Calculate improvement trends
        improvement_trend = MedicalRecord.objects.filter(
            created_at__range=(start_date, end_date)
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            success_rate=ExpressionWrapper(
                Count('id', filter=Q(status='IMPROVED')) * 100.0 /
                Cast(Count('id'), FloatField()),
                output_field=FloatField()
            )
        ).order_by('month')

        return {
            'overallEffectiveness': {
                'success_rate': (treatment_stats['successful_treatments'] / 
                               treatment_stats['total_treatments'] * 100) 
                               if treatment_stats['total_treatments'] > 0 else 0,
                'avg_recovery_time': treatment_stats['avg_recovery_time'],
                'patient_satisfaction': treatment_stats['avg_satisfaction']
            },
            'conditionEffectiveness': list(condition_effectiveness),
            'monthlyTrends': list(improvement_trend)
        }
    except Exception as e:
        print(f"Error calculating treatment effectiveness: {str(e)}")
        return {}

def generate_recommendations(start_date, end_date):
    """
    Generate AI-driven recommendations based on patient data analysis.
    
    Args:
        start_date (datetime): Start date for analysis
        end_date (datetime): End date for analysis
        
    Returns:
        list: Prioritized recommendations with supporting data
    """
    try:
        recommendations = []
        
        # Analyze areas needing attention
        department_metrics = calculate_department_performance(start_date, end_date)
        resource_metrics = calculate_resource_utilization(start_date, end_date)
        outcome_metrics = calculate_patient_outcomes(start_date, end_date)

        # Generate staffing recommendations
        if resource_metrics.get('staffUtilization', {}).get('avg_utilization', 0) > 80:
            recommendations.append({
                'type': 'STAFFING',
                'priority': 'HIGH',
                'recommendation': 'Consider increasing staff in high-utilization departments',
                'supporting_data': {
                    'current_utilization': resource_metrics['staffUtilization']['avg_utilization'],
                    'affected_departments': [
                        dept for dept, metrics in department_metrics.items()
                        if metrics.get('total_cases', 0) > 100
                    ]
                }
            })

        # Generate treatment protocol recommendations
        low_performing_conditions = [
            condition for condition in outcome_metrics.get('conditionOutcomes', [])
            if condition.get('success_rate', 100) < 70
        ]
        
        if low_performing_conditions:
            recommendations.append({
                'type': 'TREATMENT_PROTOCOL',
                'priority': 'MEDIUM',
                'recommendation': 'Review treatment protocols for conditions with low success rates',
                'affected_conditions': low_performing_conditions
            })

        # Generate preventive care recommendations
        high_readmission_conditions = Diagnosis.objects.filter(
            medical_record__created_at__range=(start_date, end_date),
            medical_record__patient__medical_records__count__gt=1
        ).values('description').annotate(
            readmission_rate=Count('medical_record__patient', distinct=True)
        ).filter(readmission_rate__gt=5)

        if high_readmission_conditions.exists():
            recommendations.append({
                'type': 'PREVENTIVE_CARE',
                'priority': 'HIGH',
                'recommendation': 'Implement enhanced follow-up protocols for high-readmission conditions',
                'conditions': list(high_readmission_conditions)
            })

        return recommendations
    except Exception as e:
        print(f"Error generating recommendations: {str(e)}")
        return []    

def generate_ai_insights(start_date, end_date):
    """Generate AI-driven insights from medical data."""
    high_risk_patients = UserProfile.objects.filter(
        is_high_risk=True,
        medical_records__created_at__range=(start_date, end_date)
    ).distinct().count()

    return {
        'highRiskPatients': high_risk_patients,
        'predictedReadmissions': calculate_readmission_predictions(start_date, end_date),
        'treatmentEffectiveness': calculate_treatment_effectiveness(start_date, end_date),
        'recommendations': generate_recommendations(start_date, end_date)
    }

def calculate_trends(start_date, end_date):
    """Calculate various trends over time."""
    return MedicalRecord.objects.filter(
        created_at__range=(start_date, end_date)
    ).annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        patient_count=Count('patient', distinct=True),
        visit_count=Count('id'),
        success_rate=ExpressionWrapper(
            Count('id', filter=Q(status='IMPROVED')) * 100.0 / Count('id'),
            output_field=FloatField()
        )
    ).order_by('date')

def calculate_performance_metrics(start_date, end_date):
    """Calculate detailed performance metrics."""
    return {
        'departmentPerformance': calculate_department_performance(start_date, end_date),
        'resourceUtilization': calculate_resource_utilization(start_date, end_date),
        'patientOutcomes': calculate_patient_outcomes(start_date, end_date)
    }
    
def handle_api_error(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionDenied as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    return wrapper

# ============= Authentication Views =============
class RegisterView(APIView):
    def post(self, request):
        print("Registration data received:", request.data)  # Debug log
        serializer = UserProfileSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                print(f"User created successfully: {user.email}")  # Debug log
                
                # Generate the verification link
                verification_link = f"http://127.0.0.1:8000/api/verify-email/{user.verification_token}/"
                
                # HTML Email Template
                html_message = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Email Verification</title>
                    <style>
                        body {{
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            margin: 0;
                            padding: 20px;
                            background-color: #f4f4f4;
                        }}
                        .container {{
                            max-width: 600px;
                            margin: 0 auto;
                            background: white;
                            padding: 20px;
                            border-radius: 10px;
                            box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        }}
                        .header {{
                            text-align: center;
                            padding: 20px;
                            background: #1a73e8;
                            color: white;
                            border-radius: 5px 5px 0 0;
                        }}
                        .content {{
                            padding: 20px;
                            text-align: center;
                        }}
                        .button {{
                            display: inline-block;
                            padding: 12px 24px;
                            background: #1a73e8;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                        }}
                        .button:hover {{
                            background: #1557b0;
                        }}
                        .footer {{
                            text-align: center;
                            padding: 20px;
                            color: #666;
                            font-size: 12px;
                        }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to Our Platform!</h1>
                        </div>
                        <div class="content">
                            <h2>Verify Your Email Address</h2>
                            <p>Thank you for registering with us. To complete your registration, please verify your email address by clicking the button below:</p>
                            <a href="{verification_link}" class="button">Verify Email</a>
                            <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
                            <p style="word-break: break-all; color: #666;">
                                {verification_link}
                            </p>
                            <p>This link will expire in 24 hours.</p>
                        </div>
                        <div class="footer">
                            <p>If you didn't create an account, you can safely ignore this email.</p>
                            <p>&copy; {datetime.now().year} Your Company Name. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                
                # Plain text version for email clients that don't support HTML
                plain_message = f"""
                Welcome to Our Platform!

                Please verify your email address by clicking the following link:
                {verification_link}

                If you didn't create an account, you can safely ignore this email.
                """
                
                subject = "Verify Your Email"
                from_email = settings.DEFAULT_FROM_EMAIL
                to_email = [user.email]
                
                try:
                    # Send email with both HTML and plain text versions
                    send_mail(
                        subject,
                        plain_message,
                        from_email,
                        to_email,
                        html_message=html_message
                    )
                    print(f"Verification email sent to: {user.email}")  # Debug log
                except Exception as e:
                    print(f"Email sending failed: {str(e)}")  # Debug log
                    return Response(
                        {"error": f"Failed to send email: {str(e)}"}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                return Response(
                    {"message": "Account created. Please verify your email."}, 
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                print(f"User creation failed: {str(e)}")  # Debug log
                return Response(
                    {"error": f"Failed to create account: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        print("Validation errors:", serializer.errors)  # Debug log
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    def get(self, request, token=None):  # Add token parameter
        try:
            if not token:
                token = request.GET.get('token')  # Get token from query params
                
            user = UserProfile.objects.get(verification_token=token)
            
            if user.is_verified:
                return HttpResponseRedirect("http://localhost:3000/[role]/patient")
            
            user.is_verified = True
            user.save()
            print(f"User verified successfully: {user.email}")
            
            # Generate JWT token
            refresh = RefreshToken.for_user(user)
            jwt_token = str(refresh.access_token)
            print("Generated JWT token:", jwt_token)

            # Add user data to the URL
            import urllib.parse
            import json
            
            user_data = {
                'user_id': user.id,
                'email': user.email,
                'is_verified': user.is_verified,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'hpn': user.hpn  # Add HPN number
            }
            
            encoded_data = urllib.parse.quote(json.dumps(user_data))
            redirect_url = f"http://localhost:3000/auth/verify-email?token={jwt_token}&userData={encoded_data}&status=success"
            print("Redirecting to:", redirect_url)
            return HttpResponseRedirect(redirect_url)
            
        except UserProfile.DoesNotExist:
            print("User not found for token:", token)
            return HttpResponseRedirect("http://localhost:3000/auth/verify-email?error=invalid_token")
        except Exception as e:
            print(f"Verification error: {str(e)}")
            return HttpResponseRedirect("http://localhost:3000/auth/verify-email?error=verification_failed")
        

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        print(f"Login attempt for email: {email}")  # Debug log

        try:
            # Get user with related medical professional data
            user = UserProfile.objects.select_related('medicalprofessional').get(email=email)
            print(f"Found user: {user.email}, verified: {user.is_verified}")
            
            # Debug log for professional status
            print(f"Medical Professional relation exists: {hasattr(user, 'medicalprofessional')}")
            if hasattr(user, 'medicalprofessional'):
                print(f"Professional details: {user.medicalprofessional.__dict__}")

            if not user.is_verified:
                return Response(
                    {"error": "Please verify your email before logging in"},
                    status=status.HTTP_403_FORBIDDEN
                )

            if not user.check_password(password):
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # At this point, user is authenticated. Prepare response data
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            # Determine professional status
            is_professional = False
            professional_details = None
            try:
                if hasattr(request.user, 'medicalprofessional'):
                    professional = request.user.medicalprofessional
                    professional_data = {
                        'license_number': professional.license_number,
                        'professional_type': professional.professional_type,
                        'specialization': professional.specialization,
                        'department': BasicDepartmentSerializer(professional.department).data if professional.department else None,
                        'is_verified': professional.is_verified,
                    }
            except Exception as e:
                print(f"Error getting professional details: {str(e)}")

            # Prepare user data
            user_data = {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_verified': user.is_verified,
                'hpn': user.hpn,
                'is_staff': user.is_staff,
                'has_professional_access': is_professional,
                'professional_details': professional_details,
                'last_active_view': 'professional' if is_professional else 'patient',
                'role': 'professional' if is_professional else 'patient',
                
                # Basic health data
                'blood_type': user.blood_type,
                'allergies': user.allergies,
                'chronic_conditions': user.chronic_conditions,
                'emergency_contact_name': user.emergency_contact_name,
                'emergency_contact_phone': user.emergency_contact_phone,
                'is_high_risk': user.is_high_risk
            }

            print(f"Prepared user data: {user_data}")  # Debug log

            return Response({
                'access': access_token,
                'refresh': str(refresh),
                'user': user_data
            })

        except UserProfile.DoesNotExist:
            print(f"No user found with email: {email}")
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            print(f"Login error: {str(e)}")
            return Response(
                {"error": "Login failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PasswordResetView(APIView):
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = UserProfile.objects.get(email=email)
            
            # Generate password reset token
            reset_token = get_random_string(64)
            user.password_reset_token = reset_token
            user.save()
            
            # Create reset link
            reset_link = f"http://localhost:3000/auth/reset-password/{reset_token}"
            
            # Send email
            html_message = f"""
            <h1>Reset Your Password</h1>
            <p>Click the link below to reset your password:</p>
            <a href="{reset_link}">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
            """
            
            send_mail(
                subject="Reset Your Password",
                message=f"Reset your password: {reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message
            )
            
            return Response({"message": "Password reset email sent"})
            
        except UserProfile.DoesNotExist:
            # Still return success to prevent email enumeration
            return Response({"message": "If an account exists, a reset email will be sent"})

class VerifyResetTokenView(APIView):
    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not token or not new_password:
            return Response(
                {"error": "Token and new password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = UserProfile.objects.get(password_reset_token=token)
            user.set_password(new_password)
            user.password_reset_token = None  # Clear the token
            user.save()
            
            return Response({"message": "Password reset successful"})
            
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "Invalid or expired reset token"},
                status=status.HTTP_400_BAD_REQUEST
            )

class ResendVerificationView(APIView):
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = UserProfile.objects.get(email=email)
            
            if user.is_verified:
                return Response(
                    {"error": "Email is already verified"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate new verification token
            user.verification_token = get_random_string(64)
            user.save()
            
            # Generate verification link
            verification_link = f"http://127.0.0.1:8000/api/verify-email/{user.verification_token}/"
            
            # Send verification email (using your existing email template)
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Verify Your Email</title>
            </head>
            <body>
                <h1>Verify Your Email Address</h1>
                <p>Click the link below to verify your email:</p>
                <a href="{verification_link}">Verify Email</a>
            </body>
            </html>
            """
            
            send_mail(
                subject="Verify Your Email",
                message=f"Verify your email: {verification_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_message
            )
            
            return Response({"message": "Verification email resent"})
            
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "No account found with this email"},
                status=status.HTTP_404_NOT_FOUND
            )


class SocialAuthView(APIView):
    def post(self, request, provider):
        token = request.data.get('token')
        
        if not token:
            return Response({
                "error": "Authentication token required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify token based on provider
            if provider == 'google':
                user_info = verify_google_token(token)
            elif provider == 'apple':
                user_info = verify_apple_token(token)
            else:
                return Response({
                    "error": "Invalid provider"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get or create user
            user, created = UserProfile.objects.get_or_create(
                email=user_info['email'],
                defaults={
                    'username': user_info['email'],  # Use email as username
                    'first_name': user_info.get('first_name', ''),
                    'last_name': user_info.get('last_name', ''),
                    'is_verified': True,  # Social auth users are pre-verified
                    'social_provider': provider,
                    'social_id': user_info.get('sub', '')  # Provider's user ID
                }
            )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            # Log the success
            print(f"Social auth successful: {provider} - {user.email}")

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_verified': user.is_verified
                },
                'created': created  # Indicates if this is a new user
            })

        except ValueError as e:
            print(f"Social auth error: {str(e)}")
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error in social auth: {str(e)}")
            return Response({
                "error": "Authentication failed"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Get the refresh token from request
            refresh_token = request.data.get('refresh_token')
            
            if refresh_token:
                # Blacklist the refresh token
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            print(f"User logged out successfully: {request.user.email}")  # Debug log
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
            
        except TokenError as e:
            print(f"Token error during logout: {str(e)}")  # Debug log
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print(f"Logout error: {str(e)}")  # Debug log
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

# ============= Platform Management ViewSets =============
class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    @action(detail=False, methods=['get'])
    def active_plans(self, request):
        queryset = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class HospitalSubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = HospitalSubscriptionSerializer
    permission_classes = [IsAuthenticated, IsHospitalAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return HospitalSubscription.objects.all()
        try:
            staff = HospitalStaff.objects.get(user=user)
            return HospitalSubscription.objects.filter(hospital=staff.hospital)
        except HospitalStaff.DoesNotExist:
            return HospitalSubscription.objects.none()

    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        subscription = self.get_object()
        try:
            subscription.renew()
            return Response({'status': 'subscription renewed'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class PlatformRevenueViewSet(viewsets.ModelViewSet):
    serializer_class = PlatformRevenueSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return PlatformRevenue.objects.all()

    @action(detail=False, methods=['get'])
    def revenue_statistics(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = self.get_queryset()
        if start_date:
            queryset = queryset.filter(transaction_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(transaction_date__lte=end_date)

        stats = queryset.aggregate(
            total_revenue=Sum('platform_earning'),
            average_revenue=Avg('platform_earning'),
            total_transactions=Count('id')
        )
        return Response(stats)

# ============= Messaging ViewSets =============

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

# Device Management ViewSets
class MedicalDeviceViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalDeviceSerializer
    permission_classes = [IsAuthenticated, IsHospitalStaff]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return MedicalDevice.objects.all()
        return MedicalDevice.objects.filter(
            hospital=user.hospitalstaff.hospital
        )

    @action(detail=True, methods=['post'])
    def schedule_maintenance(self, request, pk=None):
        device = self.get_object()
        maintenance_date = request.data.get('maintenance_date')
        if maintenance_date:
            device.next_maintenance = maintenance_date
            device.status = 'MAINTENANCE'
            device.save()
            return Response({'status': 'maintenance scheduled'})
        return Response(
            {'error': 'maintenance date required'},
            status=status.HTTP_400_BAD_REQUEST
        )

class DeviceReadingViewSet(viewsets.ModelViewSet):
    serializer_class = DeviceReadingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'medicalprofessional'):
            return DeviceReading.objects.filter(
                device__hospital=user.medicalprofessional.hospital
            )
        return DeviceReading.objects.filter(patient=user)

    @action(detail=False, methods=['get'])
    def abnormal_readings(self, request):
        queryset = self.get_queryset().filter(is_abnormal=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ============== RESOURCES, Research and Analytics ViewSets ===================

# views.py
class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        resource_type = self.request.query_params.get('type', 'guidelines')
        queryset = Resource.objects.all()
        
        if resource_type == 'guidelines':
            queryset = queryset.filter(category='CLINICAL_GUIDELINES')
        elif resource_type == 'protocols':
            queryset = queryset.filter(category='TREATMENT_PROTOCOLS')
        elif resource_type == 'research':
            queryset = queryset.filter(category='RESEARCH_PAPERS')
            
        return queryset

    @action(detail=False, methods=['post'])
    def upload(self, request):
        """Allow superusers to upload new resources"""
        if not request.user.is_superuser:
            raise PermissionDenied('Only superusers can upload resources')
            
        serializer = ResourceUploadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class ResearchProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ResearchProjectSerializer
    permission_classes = [IsAuthenticated, IsResearchTeamMember]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return ResearchProject.objects.all()
        return ResearchProject.objects.filter(
            principal_investigator__user=user
        )

    @action(detail=True, methods=['post'])
    def start_project(self, request, pk=None):
        project = self.get_object()
        try:
            project.status = 'IN_PROGRESS'
            project.save()
            return Response({'status': 'project started'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class ResearchCohortViewSet(viewsets.ModelViewSet):
    serializer_class = ResearchCohortSerializer
    permission_classes = [IsAuthenticated, IsResearchTeamMember]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return ResearchCohort.objects.filter(
            project__principal_investigator__user=self.request.user
        )

    @action(detail=True, methods=['post'])
    def add_patients(self, request, pk=None):
        cohort = self.get_object()
        patient_ids = request.data.get('patient_ids', [])
        
        try:
            added_count = 0
            for patient_id in patient_ids:
                CohortMembership.objects.get_or_create(
                    cohort=cohort,
                    patient_id=patient_id,
                    defaults={'status': 'ELIGIBLE'}
                )
                added_count += 1
            
            cohort.size = CohortMembership.objects.filter(cohort=cohort).count()
            cohort.save()
            
            return Response({
                'status': 'patients added',
                'added_count': added_count
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class AnalyticsReportViewSet(viewsets.ModelViewSet):
    serializer_class = AnalyticsReportSerializer
    permission_classes = [IsAuthenticated, IsResearchTeamMember]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return AnalyticsReport.objects.filter(
            project__principal_investigator__user=self.request.user
        )

    @action(detail=False, methods=['post'])
    def generate_report(self, request):
        project_id = request.data.get('project_id')
        report_type = request.data.get('report_type')
        parameters = request.data.get('parameters', {})

        try:
            project = ResearchProject.objects.get(id=project_id)
            report = AnalyticsReport.objects.create(
                project=project,
                report_type=report_type,
                parameters=parameters,
                results=self.generate_analysis(project, report_type, parameters),
                confidence_score=0.95  # Example confidence score
            )
            return Response(self.get_serializer(report).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def generate_analysis(self, project, report_type, parameters):
        # Placeholder for actual analysis logic
        # This would integrate with your AI/ML systems
        return {
            'summary': 'Analysis results would appear here',
            'timestamp': timezone.now().isoformat()
        }

class AIModelViewSet(viewsets.ModelViewSet):
    serializer_class = AIModelSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return AIModel.objects.all()

    @action(detail=True, methods=['post'])
    def train_model(self, request, pk=None):
        model = self.get_object()
        try:
            # Placeholder for model training logic
            model.last_trained = timezone.now()
            model.save()
            return Response({'status': 'model training initiated'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

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
# Add this to your existing get_user view for enhanced user data
# ============= Utility Views =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    try:
        # First check professional status
        has_professional_access = False
        professional_data = None
        last_active_view = 'patient'  # Default view
        
        if hasattr(request.user, 'medicalprofessional'):
            has_professional_access = True
            professional = request.user.medicalprofessional
            professional_data = {
                'license_number': professional.license_number,
                'professional_type': professional.professional_type,
                'specialization': professional.specialization,
                'department': BasicDepartmentSerializer(professional.department).data if professional.department else None,
                'hospital': BasicHospitalSerializer(professional.hospital).data if professional.hospital else None,
                'is_verified': professional.is_verified,
            }
            
            if professional.is_verified:
                last_active_view = getattr(request.user, 'last_active_view', 'patient')

        # Build the basic user data
        user_data = {
            # Basic Info
            "id": request.user.id,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "email": request.user.email,
            "hpn": request.user.hpn,
            "date_of_birth": request.user.date_of_birth,
            "country": request.user.country,
            "city": request.user.city,
            "is_verified": request.user.is_verified,
            
            # Medical Info
            "blood_type": request.user.blood_type,
            "allergies": request.user.allergies,
            "chronic_conditions": request.user.chronic_conditions,
            "emergency_contact_name": request.user.emergency_contact_name,
            "emergency_contact_phone": request.user.emergency_contact_phone,
            "is_high_risk": request.user.is_high_risk,
            "last_visit_date": request.user.last_visit_date,
            
            # Professional Status
            "has_professional_access": has_professional_access,
            "professional_data": professional_data,
            "last_active_view": last_active_view,
            "role": "professional" if has_professional_access and professional_data and professional_data['is_verified'] else "patient"
        }

        # Add basic related data counts
        user_data["medical_records_count"] = request.user.medical_records.count()
        user_data["appointments_count"] = request.user.appointments.count()
        user_data["unread_messages"] = request.user.received_messages.filter(is_read=False).count()

        # Add upcoming appointments (limited to next 5)
        try:
            upcoming_appointments = Appointment.objects.filter(
                patient=request.user,
                appointment_date__gte=timezone.now(),
                status='SCHEDULED'
            ).select_related('provider__user', 'hospital')[:5]
            
            user_data["upcoming_appointments"] = [{
                'id': apt.id,
                'date': apt.appointment_date,
                'provider_name': f"{apt.provider.user.first_name} {apt.provider.user.last_name}",
                'hospital_name': apt.hospital.name if apt.hospital else None,
                'reason': apt.reason,
                'status': apt.status
            } for apt in upcoming_appointments]
        except Exception as e:
            user_data["upcoming_appointments"] = []
            print(f"Error fetching appointments: {str(e)}")

        return Response(user_data)
        
    except Exception as e:
        print(f"Error in get_user: {str(e)}")
        return Response(
            {"error": "Failed to retrieve user data"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_dashboard_preference(request):
    try:
        view_type = request.data.get('view_type')  # Match this parameter name
        
        if view_type not in ['patient', 'professional']:
            return Response(
                {"error": "Invalid view type"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user
        if view_type == 'professional' and not user.has_professional_access():
            return Response(
                {"error": "User does not have professional access"},
                status=status.HTTP_403_FORBIDDEN
            )

        user.update_dashboard_preference(view_type)
        return Response({
            "message": "Dashboard preference updated",
            "last_active_view": view_type
        })

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_medical_record(request):
    """
    API endpoint to share a medical record with an external provider.
    """
    serializer = RecordShareSerializer(data=request.data)
    if serializer.is_valid():
        # Ensure the patient is the one making the request
        if serializer.validated_data['patient'] != request.user:
            return Response({"error": "You do not have permission to share this record."}, status=status.HTTP_403_FORBIDDEN)

        # Create the RecordShare instance
        record_share = serializer.save()
        return Response({"message": "Record shared successfully.", "record_share_id": record_share.id}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request):
       user = request.user  # Get the currently authenticated user (UserProfile instance)
       data = request.data  # Get the data sent in the request

       # Update user fields
       user.first_name = data.get('first_name', user.first_name)
       user.last_name = data.get('last_name', user.last_name)
       user.email = data.get('email', user.email)
       user.date_of_birth = data.get('date_of_birth', user.date_of_birth)
       user.country = data.get('country', user.country)
       user.city = data.get('city', user.city)
       user.allergies = data.get('allergies', user.allergies)
       user.chronic_conditions = data.get('chronic_conditions', user.chronic_conditions)
       user.emergency_contact_name = data.get('emergency_contact_name', user.emergency_contact_name)
       user.emergency_contact_phone = data.get('emergency_contact_phone', user.emergency_contact_phone)

       user.save()  # Save the updated user data to the database

       return Response({
           'message': 'User data updated successfully',
           'user': {
               'first_name': user.first_name,
               'last_name': user.last_name,
               'email': user.email,
               'date_of_birth': user.date_of_birth,
               'country': user.country,
               'city': user.city,
               'allergies': user.allergies,
               'chronic_conditions': user.chronic_conditions,
               'emergency_contact_name': user.emergency_contact_name,
               'emergency_contact_phone': user.emergency_contact_phone,
           }
       })
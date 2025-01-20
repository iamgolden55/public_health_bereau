from django.urls import path, include
from django.conf import settings
from rest_framework.routers import DefaultRouter
from rest_framework.documentation import include_docs_urls
from rest_framework.schemas import get_schema_view
from .viewsets import update_user, get_user, LogoutView, update_dashboard_preference





from .viewsets import (
    # Authentication views
    RegisterView, VerifyEmailView, LoginView,
    PasswordResetView, VerifyResetTokenView,
    ResendVerificationView, SocialAuthView,
    get_user, LogoutView, update_dashboard_preference, update_user,
  
    
    # Existing medical system viewsets
    MedicalProfessionalViewSet,
    HospitalViewSet,
    MedicalRecordViewSet,
    PatientAccessViewSet,

    # Appointment viewsets
    AppointmentViewSet,
    
    # Communication viewsets
    MessageViewSet,
    TelemedicineSessionViewSet,
    
    # Analytics viewsets
    #AnalyticsMetricViewSet,
    #MetricLogViewSet,
    
    # Task management viewsets
    TaskViewSet,
    ProtocolViewSet,
    
    # Device management viewsets
    MedicalDeviceViewSet,
    DeviceReadingViewSet,
    
    # General Practice viewsets
    GPPracticeViewSet,
    GeneralPractitionerViewSet,
    PatientGPRegistrationViewSet,

    # Integration viewsets
    #ExternalSystemViewSet,
    #IntegrationLogViewSet,

    # Surgery viewsets
    SurgeryTypeViewSet,
    SurgeryScheduleViewSet,
    SurgicalTeamViewSet,
    PreOpAssessmentViewSet,
    SurgeryReportViewSet,
    PostOpCareViewSet,
    SurgeryConsentViewSet,
    
    # Analytics views
    #get_hospital_analytics,
    #get_department_analytics,
    
    # Research viewsets
    ResearchProjectViewSet,
    ResearchCohortViewSet,
    AnalyticsReportViewSet,
    HealthAnalyticsViewSet
)

# Create router for viewsets
router = DefaultRouter()

# Existing endpoints
router.register(r'medical-professionals', MedicalProfessionalViewSet, basename='medical-professional')
router.register(r'hospitals', HospitalViewSet, basename='hospital')
router.register(r'medical-records', MedicalRecordViewSet, basename='medical-record')
router.register(r'patient-access', PatientAccessViewSet, basename='patient-access')

# Appointment endpoints
router.register(r'appointments', AppointmentViewSet, basename='appointment')

# General Practice endpoints
router.register(r'gp-practices', GPPracticeViewSet, basename='gp-practice')
router.register(r'general-practitioners', GeneralPractitionerViewSet, basename='general-practitioner')
router.register(r'gp-registrations', PatientGPRegistrationViewSet, basename='gp-registration')

# Communication endpoints
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'telemedicine', TelemedicineSessionViewSet, basename='telemedicine')

# Analytics endpoints
#router.register(r'analytics/metrics', AnalyticsMetricViewSet, basename='analytics-metric')
#router.register(r'analytics/logs', MetricLogViewSet, basename='metric-log')

# Task management endpoints
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'protocols', ProtocolViewSet, basename='protocol')

# Device management endpoints
router.register(r'devices', MedicalDeviceViewSet, basename='medical-device')
router.register(r'device-readings', DeviceReadingViewSet, basename='device-reading')

# Integration endpoints
#router.register(r'external-systems', ExternalSystemViewSet, basename='external-system')
#router.register(r'integration-logs', IntegrationLogViewSet, basename='integration-log')

# Surgery endpoints
router.register(r'surgery-types', SurgeryTypeViewSet)
router.register(r'surgery-schedules', SurgeryScheduleViewSet, basename='surgery-schedule')
router.register(r'surgical-teams', SurgicalTeamViewSet, basename='surgical-team')
router.register(r'pre-op-assessments', PreOpAssessmentViewSet, basename='pre-op-assessment')
router.register(r'surgery-reports', SurgeryReportViewSet, basename='surgery-report')
router.register(r'post-op-care', PostOpCareViewSet, basename='post-op-care')
router.register(r'surgery-consents', SurgeryConsentViewSet, basename='surgery-consent')
# Research endpoints
router.register(r'research-projects', ResearchProjectViewSet, basename='research-project')
router.register(r'research-cohorts', ResearchCohortViewSet, basename='research-cohort')
router.register(r'analytics-reports', AnalyticsReportViewSet, basename='analytics-report')
router.register(r'health-analytics', HealthAnalyticsViewSet, basename='health-analytics')

urlpatterns = [
    # Authentication URLs
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/<uuid:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email-query'),
    path('user/', get_user, name='get_user'),
    path('user/dashboard-preference/', update_dashboard_preference, name='update_dashboard_preference'),
    path("api/user/update", update_user, name="update_user"),  # Defined for the URL update_user view
    path('login/', LoginView.as_view(), name='login'),
    path('reset-password/', PasswordResetView.as_view(), name='reset-password'),
    path('verify-reset-token/', VerifyResetTokenView.as_view(), name='verify-reset-token'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('social-auth/<str:provider>/', SocialAuthView.as_view(), name='social-auth'),
    path('logout/', LogoutView.as_view(), name='logout'),
    # API endpoint for sharing medical records
    

    # Include all router URLs
    path('', include(router.urls)),

    #path('analytics/dashboard/', include([
    #    path('hospital/<int:hospital_id>/', get_hospital_analytics, name='hospital-analytics'),
    #    path('department/<int:department_id>/', get_department_analytics, name='department-analytics'),
  #  ])),
]

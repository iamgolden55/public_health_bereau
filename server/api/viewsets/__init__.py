# Import authentication views
from .authentication_viewset.class_views import (
    LoginView, RegisterView,
    VerifyEmailView, PasswordResetView,
    VerifyResetTokenView, ResendVerificationView,
    SocialAuthView, LogoutView,
)

# Import appointment views
from .appointment_viewset.class_views import (
    AppointmentViewSet,
)

# Import communication views
from .communications_viewset.class_views import (
    MessageViewSet, TelemedicineSessionViewSet,
    TaskViewSet, ProtocolViewSet,
)

# Import device views
from .device_management_viewset.class_views import (
    MedicalDeviceViewSet, DeviceReadingViewSet,
)

# Import financial views
from .financial_management_viewset.class_views import (
    InsuranceViewSet, BillViewSet, BusinessRules,
)

from .general_practice_viewset.class_views import (
    GPPracticeViewSet, GeneralPractitionerViewSet, PatientGPRegistrationViewSet,

)

# Import hospital views
from .hospital_managment_viewset.class_views import (
    HospitalRegistrationViewSet, HospitalStaffViewSet,
    HospitalAffiliationViewSet, HospitalViewSet,
)

# Import medical record views
from .medical_viewset.class_views import (
    SpecialtyClinicViewSet,
    AppointmentViewSet, 
    MedicalRecordViewSet, 
    PatientAccessViewSet, 
    DiagnosisViewSet, 
    MedicalProfessionalViewSet, 
    MedicationViewSet, ProcedureViewSet, LabResultViewSet,
)

# import platform management views
from .platform_management_viewset.class_views import (
    SubscriptionViewSet, HospitalSubscriptionViewSet, PlatformRevenueViewSet
)

# Import research views
from .resources_viewset.class_views import (
    ResourceViewSet, ResearchProjectViewSet,
    ResearchCohortViewSet, AnalyticsReportViewSet, HealthAnalyticsViewSet
)

# Import surgery views
from .surgery_management_viewset.class_views import (
    SurgeryTypeViewSet, SurgeryScheduleViewSet, 
    SurgicalTeamViewSet, PreOpAssessmentViewSet, 
    SurgeryReportViewSet, PostOpCareViewSet, 
    SurgeryConsentViewSet, SurgeryValidators
)

# Export all viewsets

__all__ = [
    # Authentication viewsets
    'LoginView', 'RegisterView', 'VerifyEmailView',
    'PasswordResetView', 'VerifyResetTokenView',
    'ResendVerificationView', 'SocialAuthView',
    'LogoutView',

    # Appointment viewsets
    'AppointmentViewSet',

    # Communication viewsets
    'MessageViewSet', 'TelemedicineSessionViewSet',
    'TaskViewSet', 'ProtocolViewSet',

    # Device viewsets
    'MedicalDeviceViewSet', 'DeviceReadingViewSet',

    # Financial viewsets
    'InsuranceViewSet', 'BillViewSet', 'BusinessRules',

    # General Practice viewsets
    'GPPracticeViewSet', 'GeneralPractitionerViewSet', 'PatientGPRegistrationViewSet',

    # Hospital viewsets
    'HospitalRegistrationViewSet', 'HospitalStaffViewSet',
    'HospitalAffiliationViewSet', 'HospitalViewSet',

    # Medical record viewsets
    'SpecialtyClinicViewSet', 'AppointmentViewSet', 
    'MedicalRecordViewSet', 'PatientAccessViewSet', 
    'DiagnosisViewSet', 'MedicalProfessionalViewSet', 
    'MedicationViewSet', 'ProcedureViewSet', 'LabResultViewSet',

    # Platform management viewsets
    'SubscriptionViewSet', 'HospitalSubscriptionViewSet', 'PlatformRevenueViewSet',

    # Research viewsets
    'ResourceViewSet', 'ResearchProjectViewSet',
    'ResearchCohortViewSet', 'AnalyticsReportViewSet', 'HealthAnalyticsViewSet',

    # Surgery viewsets
    'SurgeryTypeViewSet', 'SurgeryScheduleViewSet',
    'SurgicalTeamViewSet', 'PreOpAssessmentViewSet',
    'SurgeryReportViewSet', 'PostOpCareViewSet',
    'SurgeryConsentViewSet', 'SurgeryValidators',
]

# Import all function-based views
from .authentication_viewset.function_views import (
    get_user, update_dashboard_preference,
    share_medical_record, update_user,
)

# Export all function-based views
__all__.extend([
    'get_user',
    'update_dashboard_preference', 'share_medical_record',
    'update_user',
])

# This is the authentication_viewset/__init__.py
# Import class-based views
from .class_views import LoginView, RegisterView, VerifyEmailView, PasswordResetView, VerifyResetTokenView, ResendVerificationView, SocialAuthView, LogoutView

# Import function-based views
from .function_views import get_user, update_dashboard_preference, share_medical_record, update_user, get_medical_records

# Optionally, you can define what gets imported when using `from authentication_viewset import *`
__all__ = [
    'LoginView', 
    'RegisterView', 
    'VerifyEmailView', 
    'PasswordResetView',  # Use the class-based view
    'PasswordResetView',
    'VerifyResetTokenView',
    'ResendVerificationView',
    'SocialAuthView',
    'LogoutView',
]
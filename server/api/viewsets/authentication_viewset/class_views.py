# This file contains the class-based views for the authentication API endpoints located in the "authentication_viewset/class_views.py" .

from ..imports import *
from django.db import transaction  # Add this import
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from rest_framework.throttling import AnonRateThrottle
from rest_framework.permissions import AllowAny  # Add this import line
from rest_framework_simplejwt.tokens import RefreshToken
from urllib.parse import quote
import json
from django.conf import settings

# ============= Authentication Views =============
class RegisterView(APIView):
    def post(self, request):
        print("Registration data received:", request.data)
        
        try:
            # Validate password first before any other processing
            password = request.data.get('password')
            try:
                # Custom password validation rules
                if len(password) < 8:
                    raise ValidationError('This password is too short')
                if not any(c.isupper() for c in password):
                    raise ValidationError('This password must contain at least 1 uppercase letter')
                if not any(c.isdigit() for c in password):
                    raise ValidationError('This password must contain at least 1 number')
                
                # Django's built-in validation
                validate_password(password)
                
            except ValidationError as e:
                return Response(
                    {'password': [str(e) if isinstance(e, str) else e.messages[0]]},
                    status=status.HTTP_400_BAD_REQUEST
                )

            with transaction.atomic():
                serializer = UserProfileSerializer(data=request.data)
                if serializer.is_valid():
                    user = serializer.save()
                    print(f"User created successfully: {user.user.email}")
                    
                    # Generate verification token and link
                    verification_link = f"http://127.0.0.1:8000/api/verify-email/{user.verification_token}/"
                    
                    # Send verification email
                    try:
                        send_mail(
                            subject="Verify Your Email",
                            message=f"Please verify your email: {verification_link}",
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[user.user.email],
                            html_message=self.get_email_template(verification_link)
                        )
                        print(f"Verification email sent to: {user.user.email}")
                    except Exception as e:
                        print(f"Email sending failed: {str(e)}")
                        raise Exception(f"Email sending failed: {str(e)}")

                    return Response({
                        "message": "Account created. Please verify your email.",
                        "user": {
                            "id": user.id,
                            "email": user.user.email,
                            "first_name": user.first_name,
                            "last_name": user.last_name,
                            "gender": user.gender,
                            "hpn": user.hpn
                        }
                    }, status=status.HTTP_201_CREATED)
            
            print("Validation errors:", serializer.errors)
            return Response(
                serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            print(f"Registration failed: {str(e)}")
            return Response(
                {"error": f"Registration failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_email_template(self, verification_link):
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Verify Your Email</title>
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
                    <p>Click the link below to verify your email:</p>
                    <a href="{verification_link}" class="button">Verify Email</a>
                </div>
            </div>
        </body>
        </html>
        """

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, token):
        try:
            # Find the user profile by verification token
            user_profile = UserProfile.objects.get(verification_token=token)
            
            # Get the CustomUser instance (this is what we need for JWT)
            user = user_profile.user  # Get the actual CustomUser instance
            
            if not user.is_active:
                user.is_active = True
                user.save()
            
            user_profile.is_verified = True
            user_profile.save()
            
            print(f"User verified successfully: {user.email}")
            
            # Create tokens using the CustomUser instance
            refresh = RefreshToken.for_user(user)  # Use CustomUser, not UserProfile
            access_token = str(refresh.access_token)
            
            # Prepare user data for frontend
            user_data = {
                'id': user.id,
                'email': user.email,
                'first_name': user_profile.first_name,
                'last_name': user_profile.last_name,
                'is_verified': user_profile.is_verified
            }
            
            # Encode the data for URL
            encoded_data = quote(json.dumps(user_data))
            
            # Redirect to frontend with success status and data
            redirect_url = (
                f"{settings.FRONTEND_URL}/auth/verify-email"
                f"?status=success&token={access_token}"
                f"&userData={encoded_data}"
            )
            
            return redirect(redirect_url)
            
        except UserProfile.DoesNotExist:
            print(f"Verification error: User profile not found for token {token}")
            return redirect(f"{settings.FRONTEND_URL}/auth/verify-email?error=invalid_token")
        except Exception as e:
            print(f"Verification error: {str(e)}")
            return redirect(f"{settings.FRONTEND_URL}/auth/verify-email?error=verification_failed")

class LoginRateThrottle(AnonRateThrottle):
    rate = '5/minute'

class LoginView(APIView):
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        try:
            user = CustomUser.objects.get(email=email)
            if not user.check_password(password):
                return Response(
                    {'error': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get user profile
            user_profile = UserProfile.objects.get(user=user)
            
            # Check if user has professional access
            has_professional_access = hasattr(user_profile, 'medicalprofessional')
            professional_details = None
            
            if has_professional_access:
                professional = user_profile.medicalprofessional
                professional_details = {
                    'license_number': professional.license_number,
                    'professional_type': professional.professional_type,
                    'specialization': professional.specialization,
                    'is_verified': professional.is_verified,
                    'department': professional.department.id if professional.department else None,
                    'hospital': professional.hospital.id if professional.hospital else None
                }
                
            # Create tokens
            refresh = RefreshToken.for_user(user)
            
            # Add debug logging
            print(f"User profile date of birth: {user_profile.date_of_birth}")
            # Ensure date is formatted as YYYY-MM-DD
            formatted_date_of_birth = user_profile.date_of_birth.strftime('%Y-%m-%d') if user_profile.date_of_birth else None
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user_profile.id,
                    'email': user.email,
                    'first_name': user_profile.first_name,
                    'last_name': user_profile.last_name,
                    'is_verified': user_profile.is_verified,
                    'hpn': user_profile.hpn,
                    'date_of_birth': user_profile.date_of_birth.strftime('%Y-%m-%d') if user_profile.date_of_birth else None,
                    'role': 'professional' if has_professional_access and professional_details['is_verified'] else 'patient',
                    'has_professional_access': has_professional_access,
                    'professional_details': professional_details,
                    'last_active_view': user_profile.last_active_view or 'patient'
                }
            }, status=status.HTTP_200_OK)
            
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'No user found with this email'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'}, 
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
            with transaction.atomic():
                # First get or create CustomUser
                custom_user, user_created = CustomUser.objects.get_or_create(
                    email=user_info['email'],
                    defaults={
                        'username': user_info['email'],
                        'first_name': user_info.get('first_name', ''),
                        'last_name': user_info.get('last_name', '')
                    }
                )
                
                # Then get or create UserProfile
                user_profile, profile_created = UserProfile.objects.get_or_create(
                    user=custom_user,
                    defaults={
                        'is_verified': True,
                        'social_provider': provider,
                        'social_id': user_info.get('sub', '')
                    }
                )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user_profile)

            # Log the success
            print(f"Social auth successful: {provider} - {user_profile.user.email}")

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user_profile.id,
                    'email': user_profile.user.email,
                    'first_name': user_profile.first_name,
                    'last_name': user_profile.last_name,
                    'is_verified': user_profile.is_verified
                },
                'created': profile_created  # Indicates if this is a new user
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
            
            print(f"User logged out successfully: {request.user.user.email}")  # Debug log
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
            
        except TokenError as e:
            print(f"Token error during logout: {str(e)}")  # Debug log
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print(f"Logout error: {str(e)}")  # Debug log
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def validate_request_origin(request):
    allowed_origins = ['http://localhost:3000']
    origin = request.META.get('HTTP_ORIGIN')
    if origin not in allowed_origins:
        raise PermissionDenied("Invalid origin")

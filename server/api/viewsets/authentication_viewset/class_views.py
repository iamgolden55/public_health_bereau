# This file contains the class-based views

from ..imports import *

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

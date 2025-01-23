# This file contains the function-based views for the authentication API endpoints located in the "authentication_viewset/function_views.py" .

from django.core.cache import cache
from ..imports import *
from django.utils.dateparse import parse_date
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.throttling import UserRateThrottle
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework import serializers  # Add this import

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_medical_records(request):
    """
    Fetch medical records for the authenticated user.
    Only the patient or authorized medical professionals can access these records.
    """
    try:
        # Fetch medical records for the authenticated user
        medical_records = MedicalRecord.objects.filter(patient=request.user)
        
        # Serialize the records
        serializer = MedicalRecordSerializer(medical_records, many=True)
        
        return Response(serializer.data)
    
    except Exception as e:
        print(f"Error fetching medical records: {str(e)}")
        return Response(
            {"error": "Failed to retrieve medical records"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@throttle_classes([UserRateThrottle])
def reset_password(request):
    try:
        email = request.data.get('email')
        new_password = request.data.get('new_password')
        token = request.data.get('token')

        if not all([email, new_password, token]):
            return Response(
                {"error": "Missing required fields"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = UserProfile.objects.get(
                user__email=email, 
                password_reset_token=token,
                password_reset_token_created__gt=timezone.now() - timedelta(hours=24)
            )
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "Invalid or expired reset token"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Use serializer to validate password
        serializer = UserProfileSerializer()
        try:
            validated_password = serializer.validate_password(new_password)
        except serializers.ValidationError as e:
            return Response(
                {"error": str(e.detail[0])}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update password
        user.user.set_password(validated_password)
        user.user.save()
        user.password_reset_token = None
        user.save()

        return Response({"message": "Password reset successful"})

    except Exception as e:
        print(f"Password reset failed: {str(e)}")
        return Response(
            {"error": "Password reset failed"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@throttle_classes([UserRateThrottle])
def request_password_reset(request):
    email = request.data.get('email')
    if UserProfile.objects.filter(user__email=email).exists():
        # Add cooldown check
        last_request = cache.get(f'pwd_reset_{email}')
        if last_request:
            return Response(
                {"error": "Please wait before requesting another reset"},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        cache.set(f'pwd_reset_{email}', True, timeout=300)  # 5 min cooldown
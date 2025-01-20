from django.utils import timezone
from datetime import timedelta, datetime
from django.contrib.auth.hashers import make_password
from api.models import (
    UserProfile, Hospital, Department, MedicalProfessional, HospitalStaff,
    MedicalRecord, Appointment, Diagnosis, Medication, LabResult,
    Insurance, Bill, BillItem, HospitalAffiliation, TelemedicineSession,
    SurgeryType, SurgerySchedule, Resource, Task, GPPractice, GeneralPractitioner
)

# Add this to your seed_data.py

def create_gp_data():
    # Create GP Practices
    central_gp = GPPractice.objects.create(
        name="Central Medical Practice",
        registration_number="GP001-CENTRAL",
        address="123 High Street",
        city="London",
        postcode="SW1A 1AA",
        contact_number="020-7123-4567",
        email="info@centralmedicalpractice.com",
        capacity=2000,
        is_accepting_patients=True,
        opening_hours={
            "monday": "08:00-18:00",
            "tuesday": "08:00-18:00",
            "wednesday": "08:00-18:00",
            "thursday": "08:00-18:00",
            "friday": "08:00-17:30",
            "saturday": "09:00-12:00",
            "sunday": "closed"
        }
    )

    riverside_gp = GPPractice.objects.create(
        name="Riverside Family Practice",
        registration_number="GP002-RIVER",
        address="45 River Lane",
        city="London",
        postcode="SE1 2AB",
        contact_number="020-7234-5678",
        email="info@riversidefamily.com",
        capacity=1500,
        is_accepting_patients=True,
        opening_hours={
            "monday": "08:30-18:30",
            "tuesday": "08:30-18:30",
            "wednesday": "08:30-18:30",
            "thursday": "08:30-18:30",
            "friday": "08:30-17:30",
            "saturday": "closed",
            "sunday": "closed"
        }
    )

    # Create GPs
    gp_user1 = UserProfile.objects.create(
        email="dr.smith@centralmedicalpractice.com",
        username="dr.smith",
        first_name="John",
        last_name="Smith",
        password=make_password("testpass123"),
        is_verified=True
    )

    gp1 = GeneralPractitioner.objects.create(
        user=gp_user1,
        practice=central_gp,
        license_number="GP-123456",
        specializations=["Family Medicine", "Pediatrics"],
        max_daily_appointments=25,
        is_accepting_appointments=True,
        qualification="MBBS, MRCGP",
        years_of_experience=15,
        biography="Dr. Smith has been practicing family medicine for over 15 years with special interest in pediatrics.",
        availability_schedule={
            "monday": ["09:00-13:00", "14:00-17:00"],
            "tuesday": ["09:00-13:00", "14:00-17:00"],
            "wednesday": ["09:00-13:00"],
            "thursday": ["09:00-13:00", "14:00-17:00"],
            "friday": ["09:00-13:00", "14:00-16:00"]
        }
    )

    gp_user2 = UserProfile.objects.create(
        email="dr.patel@centralmedicalpractice.com",
        username="dr.patel",
        first_name="Priya",
        last_name="Patel",
        password=make_password("testpass123"),
        is_verified=True
    )

    gp2 = GeneralPractitioner.objects.create(
        user=gp_user2,
        practice=central_gp,
        license_number="GP-789012",
        specializations=["Family Medicine", "Women's Health"],
        max_daily_appointments=20,
        is_accepting_appointments=True,
        qualification="MBBS, MRCGP, DFSRH",
        years_of_experience=12,
        biography="Dr. Patel specializes in women's health and family planning alongside general practice.",
        availability_schedule={
            "monday": ["09:00-13:00", "14:00-17:00"],
            "tuesday": ["09:00-13:00", "14:00-17:00"],
            "wednesday": ["09:00-13:00", "14:00-17:00"],
            "thursday": ["09:00-13:00"],
            "friday": ["09:00-13:00", "14:00-17:00"]
        }
    )

    # Add more GPs at Riverside Practice
    gp_user3 = UserProfile.objects.create(
        email="dr.jones@riverside.com",
        username="dr.jones",
        first_name="Sarah",
        last_name="Jones",
        password=make_password("testpass123"),
        is_verified=True
    )

    gp3 = GeneralPractitioner.objects.create(
        user=gp_user3,
        practice=riverside_gp,
        license_number="GP-345678",
        specializations=["Family Medicine", "Elderly Care"],
        max_daily_appointments=22,
        is_accepting_appointments=True,
        qualification="MBBS, MRCGP",
        years_of_experience=18,
        biography="Dr. Jones has extensive experience in elderly care and chronic disease management.",
        availability_schedule={
            "monday": ["09:00-17:00"],
            "tuesday": ["09:00-17:00"],
            "wednesday": ["09:00-17:00"],
            "thursday": ["09:00-17:00"],
            "friday": ["09:00-16:00"]
        }
    )

    return {
        'central_gp': central_gp,
        'riverside_gp': riverside_gp,
        'gp1': gp1,
        'gp2': gp2,
        'gp3': gp3
    }

# Run this function in your Django shell or add it to your data creation script
if __name__ == "__main__":
    print("Creating GP data...")
    created_data = create_gp_data()
    print("GP data created successfully!")
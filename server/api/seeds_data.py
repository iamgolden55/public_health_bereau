from django.utils import timezone
from datetime import timedelta, datetime
from django.contrib.auth.hashers import make_password
from api.models import (
    UserProfile, Hospital, Department, MedicalProfessional, HospitalStaff,
    MedicalRecord, Appointment, Diagnosis, Medication, LabResult,
    Insurance, Bill, BillItem, HospitalAffiliation, TelemedicineSession,
    SurgeryType, SurgerySchedule, Resource, Task, GPPractice, GeneralPractitioner,
    Immunization, MentalHealthAssessment, FamilyHistory, MenstrualCycle,
    FertilityAssessment, HormonePanel, GynecologicalExam,
    PregnancyHistory, ChronicCondition, DiagnosticImage,
    SurgicalProcedure, OncologyTreatmentPlan
)
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

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

def create_test_data():
    # First, create the base user
    user = User.objects.create_user(
        username="sarah.williams",
        email="sarah.williams@example.com",
        password="Test123!",
        is_active=True
    )

    # Create UserProfile with detailed information
    profile = UserProfile.objects.create(
        user=user,
        first_name="Sarah",
        last_name="Williams",
        date_of_birth=timezone.now() - timedelta(days=365*35),
        gender="F",
        phone_number="+1234567890",
        emergency_contact="Michael Williams (Husband)",
        emergency_phone="+1987654321",
        blood_type="B-",
        allergies="Penicillin (severe), Latex, Sulfa drugs",
        hpn="HPN789012"
    )

    # Create Hospital with all fields
    hospital = Hospital.objects.create(
        name="General Hospital",
        facility_type="General",
        address="123 Medical Drive",
        city="Medical City",
        country="Medical Country",
        contact_number="+1234567890",
        email="hospital@example.com",
        website="https://hospital.example.com",
        license_number="LIC123456",
        accreditation_status="Accredited",
        is_verified=True,
        has_emergency=True
    )

    # Create Medical Professionals
    oncologist = MedicalProfessional.objects.create(
        name="Dr. Robert Chen",
        specialization="Gynecologic Oncology",
        license_number="MD789012",
        contact_number="+1122334466"
    )

    # Create Appointment
    appointment = Appointment.objects.create(
        patient=profile,
        doctor=oncologist,
        hospital=hospital,
        appointment_date=timezone.now(),
        status="COMPLETED",
        appointment_type="FOLLOWUP",
        notes="Post-chemotherapy cycle 4/6 follow-up"
    )

    # Create Medical Record with detailed assessment
    medical_record = MedicalRecord.objects.create(
        patient=profile,
        provider=oncologist,
        hospital=hospital,
        appointment=appointment,
        chief_complaint="Follow-up for stage II ovarian cancer treatment and PCOS management",
        present_illness="""
        Patient presents for follow-up of stage II ovarian cancer (diagnosed 06/2023) 
        post completion of chemotherapy cycle 4/6. Reports increasing fatigue, intermittent 
        nausea, and new onset of peripheral neuropathy in hands and feet. Also monitoring 
        PCOS symptoms with recent irregular bleeding.
        """,
        vital_signs={
            "blood_pressure": "135/88",
            "heart_rate": "92",
            "temperature": "37.8",
            "respiratory_rate": "18",
            "oxygen_saturation": "97",
            "weight": "68 kg",
            "weight_change": "-3 kg in 1 month"
        },
        assessment="""
        1. Stage II Ovarian Cancer - responding to treatment but experiencing side effects
        2. PCOS - currently destabilized due to cancer treatment
        3. Chemotherapy-induced peripheral neuropathy
        4. Treatment-related anemia (Hgb 9.8)
        """,
        plan="""
        1. Continue chemotherapy as scheduled
        2. Initiate gabapentin for neuropathy
        3. Iron supplementation for anemia
        4. Referral to supportive care for symptom management
        5. Consider dose reduction if neuropathy worsens
        """,
        mental_health_status="moderately distressed",
        mental_health_assessment="Experiencing anxiety and depression related to cancer diagnosis",
        mood_evaluation="Anxious, occasionally depressed",
        anxiety_level="Moderate to Severe",
        therapy_notes="Regular sessions with oncology counselor",
        sleep_quality="Poor - interrupted by night sweats and anxiety"
    )

    # Create Chronic Conditions
    ChronicCondition.objects.create(
        medical_record=medical_record,
        condition="Stage II Ovarian Cancer",
        diagnosed_date=timezone.now() - timedelta(days=180),
        status="Active - Under Treatment",
        treatment="""
        Current treatment: Carboplatin/Paclitaxel chemotherapy
        Cycle 4/6 completed
        Previous surgical intervention: Total abdominal hysterectomy with bilateral 
        salpingo-oophorectomy performed 07/2023
        """,
        notes="""
        - Tumor markers trending down (CA-125: 450 → 125)
        - Partial response on imaging
        - Managing side effects with supportive care
        - Genetic counseling planned post-treatment
        """
    )

    # Create Lab Results with detailed information
    lab_results = [
        {
            "test_name": "Complete Blood Count",
            "test_code": "CBC",
            "category": "Hematology",
            "result_value": "9.8",
            "unit": "g/dL",
            "reference_range": "12.0-15.5",
            "is_abnormal": True,
            "test_date": timezone.now() - timedelta(days=2),
            "result_date": timezone.now() - timedelta(days=1),
            "notes": "Chemotherapy-induced anemia - monitor and supplement"
        },
        {
            "test_name": "CA-125",
            "test_code": "CA125",
            "category": "Tumor Markers",
            "result_value": "125",
            "unit": "U/mL",
            "reference_range": "0-35",
            "is_abnormal": True,
            "test_date": timezone.now() - timedelta(days=2),
            "result_date": timezone.now() - timedelta(days=1),
            "notes": "Decreased from baseline of 450 - showing response to treatment"
        }
    ]

    for lab in lab_results:
        LabResult.objects.create(
            medical_record=medical_record,
            performed_by=oncologist,
            **lab
        )

    # Create Medications
    medications = [
        {
            "name": "Carboplatin",
            "dosage": "AUC 6",
            "frequency": "Every 21 days",
            "route": "IV",
            "start_date": timezone.now() - timedelta(days=180),
            "prescribed_by": oncologist,
            "instructions": "Administered in chemotherapy unit",
            "purpose": "Primary chemotherapy agent"
        },
        {
            "name": "Gabapentin",
            "dosage": "300mg",
            "frequency": "Three times daily",
            "route": "ORAL",
            "start_date": timezone.now(),
            "prescribed_by": oncologist,
            "instructions": "Take with food",
            "purpose": "Management of chemotherapy-induced neuropathy"
        }
    ]

    for med in medications:
        Medication.objects.create(
            medical_record=medical_record,
            **med
        )

    # Create Mental Health Assessment
    MentalHealthAssessment.objects.create(
        medical_record=medical_record,
        assessment_type="PHQ9",
        score=15,
        severity="MODERATE",
        assessed_by=oncologist,
        assessment_date=timezone.now(),
        next_assessment_date=timezone.now() + timedelta(days=14),
        recommendations="""
        1. Continue weekly counseling sessions
        2. Consider psychiatric consultation if symptoms worsen
        3. Practice stress reduction techniques
        4. Maintain sleep hygiene
        """,
        notes="Patient showing resilience but struggling with treatment side effects"
    )

    print("Detailed medical test data created successfully!")

def seed_test_data():
    print("Seeding test data...")
    
    with transaction.atomic():
        # Create test users
        admin_user = get_user_model().objects.create_superuser(
            email='admin@example.com',
            password='Admin123!',
            username='admin@example.com'
        )

        # Create Hospital - Updated to match model fields
        hospital = Hospital.objects.create(
            name="General Hospital",
            facility_type="General",
            address="123 Medical Drive",
            city="Medical City",
            country="Medical Country",
            contact_number="+1234567890",
            email="hospital@example.com",
            website="https://hospital.example.com",
            license_number="LIC123456",
            accreditation_status="Accredited",
        )

        # Create Departments
        departments = [
            Department.objects.create(
                name="Cardiology",
                hospital=hospital,
                description="Heart and cardiovascular system",
                icon="heart"
            ),
            Department.objects.create(
                name="Oncology",
                hospital=hospital,
                description="Cancer treatment",
                icon="cells"
            )
        ]

        # Create Medical Professionals
        doctor = MedicalProfessional.objects.create(
            user=UserProfile.objects.create(
                user=get_user_model().objects.create_user(
                    email='doctor@example.com',
                    password='Doctor123!',
                    username='doctor@example.com'
                ),
                first_name="John",
                last_name="Doctor",
                is_verified=True,
                date_of_birth="1980-01-01",
                gender="M"
            ),
            license_number="MD123456",
            professional_type="Doctor",
            specialization="Cardiology",
            is_verified=True
        )

        # Create Patient
        patient = UserProfile.objects.create(
            user=get_user_model().objects.create_user(
                email='patient@example.com',
                password='Patient123!',
                username='patient@example.com'
            ),
            first_name="Jane",
            last_name="Patient",
            date_of_birth="1990-01-01",
            gender="F",
            blood_type="A+",
            is_verified=True
        )

        # Create Medical Records
        record = MedicalRecord.objects.create(
            patient=patient,
            provider=doctor,
            hospital=hospital,
            chief_complaint="Chest pain",
            present_illness="Patient reports chest pain for 2 days",
            vital_signs={
                "blood_pressure": "120/80",
                "heart_rate": "75",
                "temperature": "98.6"
            },
            assessment="Suspected angina",
            plan="Further cardiac evaluation needed"
        )

        # Add Diagnoses
        Diagnosis.objects.create(
            medical_record=record,
            diagnosis_code="I20.9",  # ICD-10 code for Angina Pectoris
            description="Angina Pectoris - Patient experiencing chest pain",
            diagnosis_type="PRIMARY",
            diagnosed_by=doctor,  # We already have the doctor object
            notes="Patient reports typical anginal chest pain with exertion"
        )

        # Add Medications
        Medication.objects.create(
            medical_record=record,
            name="Nitroglycerin",
            dosage="0.4mg",
            frequency="As needed",
            route="Sublingual",
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(days=30)
        )

        # Add Lab Results (Corrected)
        LabResult.objects.create(
            medical_record=record,
            test_name="Complete Blood Count",
            test_code="CBC",
            category="Hematology",
            result_value="7.5",
            unit="10^3/uL",
            reference_range="4.5-11.0",
            is_abnormal=False,
            performed_by=doctor,
            test_date=datetime.now(),
            result_date=datetime.now(),
            notes="Normal CBC results"
        )

        print("Test data seeded successfully!")

def clear_test_data():
    """Clear all test data from the database"""
    with transaction.atomic():
        get_user_model().objects.all().delete()
        Hospital.objects.all().delete()
        Department.objects.all().delete()
        MedicalRecord.objects.all().delete()
        print("Test data cleared successfully!")

# Run this function in your Django shell or add it to your data creation script
if __name__ == "__main__":
    print("Creating GP data...")
    created_data = create_gp_data()
    print("GP data created successfully!")
from django.utils import timezone
from datetime import timedelta, datetime
from django.contrib.auth.hashers import make_password
from api.models import (
    UserProfile, Hospital, Department, MedicalProfessional, HospitalStaff,
    MedicalRecord, Appointment, Diagnosis, Medication, LabResult,
    Insurance, Bill, BillItem, HospitalAffiliation, TelemedicineSession,
    SurgeryType, SurgerySchedule, Resource, Task
)

def create_test_data():
    # 1. Create Hospitals
    main_hospital = Hospital.objects.create(
        name="Metro General Hospital",
        registration_number="MGH123456",
        facility_type="GENERAL",
        address="123 Healthcare Ave",
        city="Metro City",
        country="United States",
        contact_number="555-0123",
        email="info@metrogeneral.com",
        is_verified=True,
        has_emergency=True
    )

    specialty_hospital = Hospital.objects.create(
        name="Cardiac Specialty Center",
        registration_number="CSC789012",
        facility_type="SPECIALTY",
        address="456 Heart Lane",
        city="Metro City",
        country="United States",
        contact_number="555-0124",
        email="info@cardiacspecialty.com",
        is_verified=True
    )

    # 2. Create Departments
    departments = {
        'cardiology': Department.objects.create(
            name="Cardiology",
            description="Heart and cardiovascular care",
            icon="heart",
            active_cases=0
        ),
        'research': Department.objects.create(
            name="Clinical Research",
            description="Medical research department",
            icon="microscope",
            active_cases=0
        ),
        'emergency': Department.objects.create(
            name="Emergency Medicine",
            description="Emergency and trauma care",
            icon="emergency",
            active_cases=0
        )
    }

    # 3. Create Medical Professionals
    # Doctor
    doctor_user = UserProfile.objects.create(
        email="dr.smith@metrogeneral.com",
        username="dr.smith",
        first_name="John",
        last_name="Smith",
        password=make_password("testpass123"),
        is_verified=True,
        city="Metro City",
        primary_hospital=main_hospital
    )

    doctor = MedicalProfessional.objects.create(
        user=doctor_user,
        license_number="MD123456",
        professional_type="DOCTOR",
        specialization="CARDIOLOGY",
        hospital=main_hospital,
        department=departments['cardiology'],
        is_verified=True
    )

    # Researcher
    researcher_user = UserProfile.objects.create(
        email="dr.jones@metrogeneral.com",
        username="dr.jones",
        first_name="Sarah",
        last_name="Jones",
        password=make_password("testpass123"),
        is_verified=True,
        city="Metro City",
        primary_hospital=main_hospital
    )

    researcher = MedicalProfessional.objects.create(
        user=researcher_user,
        license_number="RES789012",
        professional_type="SPECIALIST",
        specialization="RESEARCH",
        hospital=main_hospital,
        department=departments['research'],
        is_verified=True
    )

    # 4. Create Hospital Staff
    staff = HospitalStaff.objects.create(
        hospital=main_hospital,
        user=doctor_user,
        role="STAFF",
        department="Cardiology",
        is_active=True,
        join_date=timezone.now().date(),
        access_level=3,
        created_by=researcher_user
    )

    # 5. Create Hospital Affiliations
    affiliation = HospitalAffiliation.objects.create(
        medical_professional=doctor,
        hospital=main_hospital,
        is_primary=True,
        start_date=timezone.now().date(),
        department="Cardiology",
        status="ACTIVE",
        schedule={"monday": "9AM-5PM", "tuesday": "9AM-5PM"}
    )

    # 6. Create Patients with Complete Medical History
    patients = []
    for i in range(3):
        patient = UserProfile.objects.create(
            email=f"patient{i+1}@email.com",
            username=f"patient{i+1}",
            first_name=f"Patient{i+1}",
            last_name=f"Doe{i+1}",
            password=make_password("testpass123"),
            is_verified=True,
            date_of_birth=datetime(1980+i, 1, 1),
            blood_type="A+",
            city="Metro City",
            allergies="Penicillin",
            chronic_conditions="Hypertension",
            emergency_contact_name="Emergency Contact",
            emergency_contact_phone="555-0199",
            primary_hospital=main_hospital
        )
        patients.append(patient)

    # 7. Create Insurance
    insurance = Insurance.objects.create(
        company_name="HealthGuard Insurance",
        policy_number="POL123456",
        coverage_details="Comprehensive health coverage",
        contact_number="555-0123",
        email="claims@healthguard.com"
    )

    # 8. Create Medical Records and Related Data for Each Patient
    for patient in patients:
        # Medical Record
        record = MedicalRecord.objects.create(
            patient=patient,
            provider=doctor,
            hospital=main_hospital,
            chief_complaint="Chest pain and shortness of breath",
            present_illness="Started 3 days ago",
            vital_signs="BP: 140/90, HR: 88, Temp: 37.2",
            assessment="Suspected hypertensive crisis",
            plan="Medication adjustment and monitoring"
        )

        # Appointment
        appointment = Appointment.objects.create(
            patient=patient,
            provider=doctor,
            hospital=main_hospital,
            appointment_date=timezone.now() + timedelta(days=7),
            reason="Follow-up for hypertension",
            status="SCHEDULED"
        )

        # Diagnosis
        diagnosis = Diagnosis.objects.create(
            medical_record=record,
            diagnosis_code="I10",
            description="Essential (primary) hypertension",
            diagnosis_type="PRIMARY",
            diagnosed_by=doctor
        )

        # Lab Results
        lab_result = LabResult.objects.create(
            medical_record=record,
            test_name="Complete Blood Count",
            test_code="CBC001",
            category="HEMATOLOGY",
            result_value="Normal",
            unit="g/dL",
            reference_range="12-16",
            performed_by=doctor,
            test_date=timezone.now(),
            result_date=timezone.now()
        )

        # Bill
        bill = Bill.objects.create(
            patient=patient,
            provider=doctor,
            hospital=main_hospital,
            appointment=appointment,
            insurance=insurance,
            total_amount=1500.00,
            insurance_covered=1200.00,
            patient_responsibility=300.00,
            status="PENDING",
            due_date=timezone.now().date() + timedelta(days=30)
        )

        # Bill Items
        BillItem.objects.create(
            bill=bill,
            description="Consultation",
            code="CONS001",
            quantity=1,
            unit_price=500.00,
            total_price=500.00
        )

        # Telemedicine Session
        TelemedicineSession.objects.create(
            patient=patient,
            doctor=doctor,
            appointment=appointment,
            session_url="https://telehealth.example.com/session123",
            status="SCHEDULED"
        )

    # 9. Create Surgery Types and Schedules
    surgery_type = SurgeryType.objects.create(
        name="Cardiac Catheterization",
        code="CATH001",
        description="Minimally invasive heart procedure",
        typical_duration=timedelta(hours=2),
        risk_level="MODERATE",
        specialization_required="CARDIOLOGY",
        pre_requisites={"tests": ["ECG", "Blood Work"]},
        post_op_care={"monitoring": "24 hours"},
        equipment_needed=["catheter", "imaging equipment"]
    )

    # 10. Create Resources
    Resource.objects.create(
        title="Hypertension Management Guidelines",
        description="Latest guidelines for managing hypertension",
        category="CLINICAL_GUIDELINES",
        specialty="CARDIOLOGY",
        evidence_level="LEVEL_1",
        institution="American Heart Association",
        keywords="hypertension, blood pressure, cardiovascular",
        uploaded_by=doctor_user
    )

    # 11. Create Tasks
    Task.objects.create(
        title="Review Lab Results",
        description="Review pending lab results for Patient1",
        assigned_to=doctor_user,
        created_by=researcher_user,
        department="Cardiology",
        priority="HIGH",
        status="PENDING",
        due_date=timezone.now() + timedelta(days=1)
    )

    return {
        'main_hospital': main_hospital,
        'specialty_hospital': specialty_hospital,
        'departments': departments,
        'doctor': doctor,
        'researcher': researcher,
        'patients': patients,
        'insurance': insurance,
        'staff': staff
    }

def verify_relationships():
    """Verify key relationships in the test data"""
    try:
        # Verify patient-hospital relationship
        patient = UserProfile.objects.get(email="patient1@email.com")
        doctor = MedicalProfessional.objects.get(license_number="MD123456")
        hospital = Hospital.objects.get(name="Metro General Hospital")

        print("\nVerifying Relationships:")
        print(f"Patient Primary Hospital: {patient.primary_hospital.name}")
        print(f"Doctor's Hospital: {doctor.hospital.name}")
        
        # Verify medical records access
        records = MedicalRecord.objects.filter(
            hospital=doctor.hospital,
            patient=patient
        )
        print(f"Medical Records Found: {records.count()}")
        print(f"Patient HPN: {patient.hpn}")
        
        # Verify appointments
        appointments = Appointment.objects.filter(patient=patient)
        print(f"Appointments Found: {appointments.count()}")
        
        # Verify bills
        bills = Bill.objects.filter(patient=patient)
        print(f"Bills Found: {bills.count()}")

    except Exception as e:
        print(f"Verification Error: {str(e)}")

# Remove this entire section at the bottom of seed_data.py
# if __name__ == "__main__":
#     print("Creating test data...")
#     created_data = create_test_data()
#     print("Test data created successfully!")
#     verify_relationships()
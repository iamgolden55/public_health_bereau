from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import (
    MedicalRecord, 
    HormonePanel, 
    DiagnosticImage,
    ChronicCondition,
    Medication,
    MenstrualCycle,
    PregnancyHistory,
    FamilyHistory
)
import json
from datetime import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a test account with comprehensive medical data'

    def handle(self, *args, **kwargs):
        try:
            # Load fixture data
            with open('api/fixtures/test_medical_data.json') as f:
                data = json.load(f)

            # Create test user
            user_data = data['user']
            user = User.objects.create_user(
                email=user_data['email'],
                password=user_data['password'],
                role=user_data['role']
            )

            # Create medical records
            for record in data['medical_records']:
                medical_record = MedicalRecord.objects.create(
                    user=user,
                    record_date=datetime.strptime(record['record_date'], '%Y-%m-%d'),
                    doctor_name=record['doctor_name'],
                    vital_signs=record.get('vital_signs', {}),
                    chief_complaint=record.get('chief_complaint', ''),
                    present_illness=record.get('present_illness', ''),
                    clinical_notes=record.get('clinical_notes', ''),
                    diagnosis=record.get('diagnosis', ''),
                    treatment_plan=record.get('treatment_plan', ''),
                    mental_health_status=record.get('mental_health_status', ''),
                    mental_health_assessment=record.get('mental_health_assessment', ''),
                    mood_evaluation=record.get('mood_evaluation', ''),
                    anxiety_level=record.get('anxiety_level', ''),
                    therapy_notes=record.get('therapy_notes', ''),
                    treatment_recommendations=record.get('treatment_recommendations', ''),
                    mental_health_provider=record.get('mental_health_provider', ''),
                    sleep_quality=record.get('sleep_quality', '')
                )

                # Create family history
                if 'family_history' in record:
                    FamilyHistory.objects.create(
                        medical_record=medical_record,
                        **record['family_history']
                    )

                # Create reproductive health records
                if 'reproductive_health' in record:
                    repro_health = record['reproductive_health']
                    
                    # Create menstrual cycles
                    for cycle in repro_health.get('menstrual_cycles', []):
                        MenstrualCycle.objects.create(
                            medical_record=medical_record,
                            **cycle
                        )
                    
                    # Create pregnancy history
                    if 'pregnancy_history' in repro_health:
                        PregnancyHistory.objects.create(
                            medical_record=medical_record,
                            **repro_health['pregnancy_history']
                        )

                # Create chronic conditions
                for condition in record.get('chronic_conditions', []):
                    ChronicCondition.objects.create(
                        medical_record=medical_record,
                        **condition
                    )

                # Create medications
                for medication in record.get('medications', []):
                    Medication.objects.create(
                        medical_record=medical_record,
                        **medication
                    )

                # Create diagnostic imaging
                for imaging in record.get('diagnostic_imaging', []):
                    DiagnosticImage.objects.create(
                        medical_record=medical_record,
                        **imaging
                    )

                # Create hormone panels
                for panel in record.get('hormone_panels', []):
                    HormonePanel.objects.create(
                        medical_record=medical_record,
                        **panel
                    )

            self.stdout.write(self.style.SUCCESS(
                f'Successfully created test account: {user_data["email"]} with complete medical history'
            ))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating test account: {str(e)}')) 
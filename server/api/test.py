# server/api/tests.py

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import UserProfile, MedicalRecord, RecordShare

class RecordShareTests(APITestCase):
    def setUp(self):
        # Create a test user (patient)
        self.patient = UserProfile.objects.create_user(
            email='patient@example.com',
            password='testpassword'
        )
        print(f"Created user: {self.patient.email}")  # Debugging line
        
        # Create a medical record for the patient
        self.medical_record = MedicalRecord.objects.create(
            patient=self.patient,
            vital_signs='Normal',  # Provide a value for vital_signs
            # Add other required fields here
        )
        
        # URL for sharing medical records
        self.url = reverse('share-medical-record')  # Adjust if necessary

    def test_share_medical_record(self):
        # Attempt to log in with the test user
        login_success = self.client.login(email='patient@example.com', password='testpassword')
        self.assertTrue(login_success, "Login failed")  # Check if login was successful
        
        data = {
            "patient": self.patient.id,
            "medical_record": self.medical_record.id,
            "external_provider_name": "Dr. John Doe",  # Unique provider name
            "expires_at": "2023-12-31T23:59:59Z"  # Example expiration date
        }
        response = self.client.post(self.url, data, format='json')
        
        print(response.data)  # Debugging line to see the response data
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('record_share_id', response.data)

    def test_share_medical_record_expired(self):
        # Attempt to log in with the test user
        login_success = self.client.login(email='patient@example.com', password='testpassword')
        self.assertTrue(login_success, "Login failed")  # Check if login was successful
        
        data = {
            "patient": self.patient.id,
            "medical_record": self.medical_record.id,
            "external_provider_name": "Dr. Jane Smith",  # Unique provider name
            "expires_at": "2020-01-01T00:00:00Z"  # Past date
        }
        response = self.client.post(self.url, data, format='json')
        
        print(response.data)  # Debugging line to see the response data
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['non_field_errors'][0], "Expiration date must be in the future.")

    def test_duplicate_record_share(self):
        # Attempt to log in with the test user
        login_success = self.client.login(email='patient@example.com', password='testpassword')
        self.assertTrue(login_success, "Login failed")  # Check if login was successful
        
        # First share with a unique provider name
        data = {
            "patient": self.patient.id,
            "medical_record": self.medical_record.id,
            "external_provider_name": "Dr. John Doe",  # Unique provider name
            "expires_at": "2023-12-31T23:59:59Z"
        }
        self.client.post(self.url, data, format='json')

        # Attempt to share again with the same provider and record
        response = self.client.post(self.url, data, format='json')
        
        print(response.data)  # Debugging line to see the response data
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['non_field_errors'][0], "This medical record has already been shared with this provider.")
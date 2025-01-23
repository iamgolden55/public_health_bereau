from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from ..models import CustomUser, UserProfile
from django.core import mail
import json

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.valid_user_data = {
            'email': 'test@example.com',
            'password': 'Test123!',
            'first_name': 'Test',
            'last_name': 'User',
            'gender': 'M',
            'date_of_birth': '1990-01-01'
        }

    def test_user_registration(self):
        """Test user registration with valid data"""
        response = self.client.post(
            self.register_url, 
            self.valid_user_data, 
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(CustomUser.objects.filter(email='test@example.com').exists())
        self.assertEqual(len(mail.outbox), 1)  # Verify email sent

    def test_invalid_registration(self):
        """Test registration with invalid data"""
        invalid_data = self.valid_user_data.copy()
        invalid_data['email'] = 'invalid-email'
        
        response = self.client.post(
            self.register_url, 
            invalid_data, 
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login(self):
        """Test user login"""
        # Create user first
        self.client.post(self.register_url, self.valid_user_data, format='json')
        
        # Verify email
        user = UserProfile.objects.get(user__email=self.valid_user_data['email'])
        user.is_verified = True
        user.save()
        
        # Try login
        response = self.client.post(
            self.login_url,
            {
                'email': self.valid_user_data['email'],
                'password': self.valid_user_data['password']
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_password_validation(self):
        """Test password validation rules"""
        test_cases = [
            {
                'password': 'short',
                'expected_error': 'This password is too short'
            },
            {
                'password': 'nocapital123',
                'expected_error': 'This password must contain at least 1 uppercase letter'
            },
            {
                'password': 'NODIGITS',
                'expected_error': 'This password must contain at least 1 number'
            }
        ]
        
        for test_case in test_cases:
            data = self.valid_user_data.copy()
            data['password'] = test_case['password']
            response = self.client.post(self.register_url, data, format='json')
            
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn(test_case['expected_error'], str(response.data['password']))

    def test_rate_limiting(self):
        """Test rate limiting on login attempts"""
        # Create and verify user
        response = self.client.post(self.register_url, self.valid_user_data, format='json')
        user = UserProfile.objects.get(user__email=self.valid_user_data['email'])
        user.is_verified = True
        user.save()
        
        # Try multiple login attempts
        login_data = {
            'email': self.valid_user_data['email'],
            'password': self.valid_user_data['password']
        }
        
        # Make requests until rate limit is hit
        for _ in range(6):
            response = self.client.post(self.login_url, login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS) 
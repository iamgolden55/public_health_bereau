from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
import jwt
import time

def verify_google_token(token):
    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        # Get user info from token
        return {
            'email': idinfo['email'],
            'first_name': idinfo.get('given_name', ''),
            'last_name': idinfo.get('family_name', ''),
            'picture': idinfo.get('picture', ''),
            'provider': 'google'
        }
    except Exception as e:
        raise ValueError(f"Invalid Google token: {str(e)}")

def verify_apple_token(token):
    try:
        # Verify Apple token
        decoded = jwt.decode(
            token,
            settings.APPLE_PUBLIC_KEY,
            algorithms=['RS256'],
            audience=settings.APPLE_BUNDLE_ID
        )

        # Check token expiration
        if decoded['exp'] < time.time():
            raise ValueError("Token has expired")

        return {
            'email': decoded['email'],
            'sub': decoded['sub'],  # Apple user ID
            'provider': 'apple'
        }
    except Exception as e:
        raise ValueError(f"Invalid Apple token: {str(e)}")
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from openai import OpenAI
from django.conf import settings
from django.core.cache import cache
import hashlib

client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url="https://api.openai.com/v1"
)

def get_cache_key(clinical_note: str) -> str:
    """Generate a unique cache key for the clinical note"""
    return f"clinical_note:{hashlib.md5(clinical_note.encode()).hexdigest()}"

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def simplify_clinical_note(request):
    try:
        print("Received request:", request.data)  # Debug log
        clinical_note = request.data.get('clinical_note')
        if not clinical_note:
            return Response({'error': 'Clinical note is required'}, status=400)

        # Try to get from cache, but don't fail if Redis is not available
        try:
            cache_key = get_cache_key(clinical_note)
            cached_result = cache.get(cache_key)
            
            if cached_result:
                print("Cache hit: Returning cached simplified note")
                return Response({
                    'original': clinical_note,
                    'simplified': cached_result,
                    'cached': True
                })
        except Exception as cache_error:
            print(f"Cache error (continuing without cache): {cache_error}")

        # Generate new simplification
        print("Generating new simplified note")
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful medical translator. Your task is to explain complex medical notes in simple, easy-to-understand language while maintaining accuracy."
                },
                {
                    "role": "user",
                    "content": f"Please explain this medical note in simple terms that a patient can understand: {clinical_note}"
                }
            ],
            temperature=0.7,
            max_tokens=500
        )

        simplified_note = response.choices[0].message.content

        # Try to cache the result, but don't fail if Redis is not available
        try:
            cache.set(
                cache_key, 
                simplified_note, 
                timeout=settings.CLINICAL_NOTE_CACHE_TTL
            )
        except Exception as cache_error:
            print(f"Cache storage error (continuing): {cache_error}")

        return Response({
            'original': clinical_note,
            'simplified': simplified_note,
            'cached': False
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500) 
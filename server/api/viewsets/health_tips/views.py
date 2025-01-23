from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from openai import OpenAI
import os
import random
from django.conf import settings

# Initialize the client without proxies
client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url="https://api.openai.com/v1"  # Explicitly set the base URL
)

HEALTH_TOPICS = [
    'personal hygiene',
    'sexual health',
    'reproductive health',
    'common diseases',
    'mental health',
    'nutrition',
    'exercise',
    'sleep hygiene',
    'stress management',
    'preventive screenings'
]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_health_tip(request):
    try:
        # Add debug logging
        print("Starting daily health tip generation...")
        random_topic = random.choice(HEALTH_TOPICS)
        print(f"Selected topic: {random_topic}")
        
        try:
            # Debug OpenAI configuration
            print(f"OpenAI Key present: {bool(settings.OPENAI_API_KEY)}")
            print(f"Using model: {settings.OPENAI_MODEL if hasattr(settings, 'OPENAI_MODEL') else 'gpt-4'}")
            
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[{
                    "role": "system",
                    "content": f"You are a health education expert. Generate a concise, engaging, and educational tip about {random_topic}. Include practical advice and scientific backing where relevant."
                }],
                temperature=0.7,
                max_tokens=300
            )
            print("OpenAI API call successful")
            
            content = response.choices[0].message.content

            # Determine category
            category_map = {
                'personal hygiene': 'hygiene',
                'sexual health': 'sexual_health',
                'reproductive health': 'reproductive_health',
                'common diseases': 'disease_prevention',
                'mental health': 'mental_health'
            }

            return Response({
                'topic': random_topic,
                'title': content.split('\n')[0][:50],
                'content': content,
                'category': category_map.get(random_topic, 'disease_prevention'),
                'readingTime': f"{len(content.split()) // 200 + 1} min read",
                'tags': [random_topic.replace(' ', '_'), 'health_education', 'preventive_care']
            })

        except Exception as openai_error:
            print(f"OpenAI API error: {str(openai_error)}")
            return Response({
                'error': f'OpenAI API error: {str(openai_error)}'
            }, status=500)

    except Exception as e:
        print(f"General error in daily_health_tip: {str(e)}")
        import traceback
        traceback.print_exc()  # Print full stack trace
        return Response({
            'error': f'Server error: {str(e)}'
        }, status=500) 
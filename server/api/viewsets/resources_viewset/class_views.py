from ..imports import *

# Mixins
from ..mixin import StandardResultsSetPagination
# Custom viewset
class IsResearchTeamMember(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            return request.user.medicalprofessional.researchprojects.exists()
        except:
            return False

# ============== RESOURCES, Research and Analytics ViewSets ===================
class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        resource_type = self.request.query_params.get('type', 'guidelines')
        queryset = Resource.objects.all()
        
        if resource_type == 'guidelines':
            queryset = queryset.filter(category='CLINICAL_GUIDELINES')
        elif resource_type == 'protocols':
            queryset = queryset.filter(category='TREATMENT_PROTOCOLS')
        elif resource_type == 'research':
            queryset = queryset.filter(category='RESEARCH_PAPERS')
            
        return queryset

    @action(detail=False, methods=['post'])
    def upload(self, request):
        """Allow superusers to upload new resources"""
        if not request.user.is_superuser:
            raise PermissionDenied('Only superusers can upload resources')
            
        serializer = ResourceUploadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class ResearchProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ResearchProjectSerializer
    permission_classes = [IsAuthenticated, IsResearchTeamMember]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return ResearchProject.objects.all()
        return ResearchProject.objects.filter(
            principal_investigator__user=user
        )

    @action(detail=True, methods=['post'])
    def start_project(self, request, pk=None):
        project = self.get_object()
        try:
            project.status = 'IN_PROGRESS'
            project.save()
            return Response({'status': 'project started'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class ResearchCohortViewSet(viewsets.ModelViewSet):
    serializer_class = ResearchCohortSerializer
    permission_classes = [IsAuthenticated, IsResearchTeamMember]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return ResearchCohort.objects.filter(
            project__principal_investigator__user=self.request.user
        )

    @action(detail=True, methods=['post'])
    def add_patients(self, request, pk=None):
        cohort = self.get_object()
        patient_ids = request.data.get('patient_ids', [])
        
        try:
            added_count = 0
            for patient_id in patient_ids:
                CohortMembership.objects.get_or_create(
                    cohort=cohort,
                    patient_id=patient_id,
                    defaults={'status': 'ELIGIBLE'}
                )
                added_count += 1
            
            cohort.size = CohortMembership.objects.filter(cohort=cohort).count()
            cohort.save()
            
            return Response({
                'status': 'patients added',
                'added_count': added_count
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class AnalyticsReportViewSet(viewsets.ModelViewSet):
    serializer_class = AnalyticsReportSerializer
    permission_classes = [IsAuthenticated, IsResearchTeamMember]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return AnalyticsReport.objects.filter(
            project__principal_investigator__user=self.request.user
        )

    @action(detail=False, methods=['post'])
    def generate_report(self, request):
        project_id = request.data.get('project_id')
        report_type = request.data.get('report_type')
        parameters = request.data.get('parameters', {})

        try:
            project = ResearchProject.objects.get(id=project_id)
            report = AnalyticsReport.objects.create(
                project=project,
                report_type=report_type,
                parameters=parameters,
                results=self.generate_analysis(project, report_type, parameters),
                confidence_score=0.95  # Example confidence score
            )
            return Response(self.get_serializer(report).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def generate_analysis(self, project, report_type, parameters):
        # Placeholder for actual analysis logic
        # This would integrate with your AI/ML systems
        return {
            'summary': 'Analysis results would appear here',
            'timestamp': timezone.now().isoformat()
        }

class AIModelViewSet(viewsets.ModelViewSet):
    serializer_class = AIModelSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return AIModel.objects.all()

    @action(detail=True, methods=['post'])
    def train_model(self, request, pk=None):
        model = self.get_object()
        try:
            # Placeholder for model training logic
            model.last_trained = timezone.now()
            model.save()
            return Response({'status': 'model training initiated'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class HealthAnalyticsViewSet(viewsets.ViewSet):
    """ViewSet for comprehensive health analytics data."""
    permission_classes = [IsAuthenticated]

    def get_regional_data(self, request):
        """Get regional health analytics data."""
        try:
            timeframe = request.query_params.get('timeframe', '1M')
            
            # Calculate start date based on timeframe
            now = timezone.now()
            start_date = now - {
                '1M': timedelta(days=30),
                '3M': timedelta(days=90),
                '6M': timedelta(days=180),
                '1Y': timedelta(days=365),
            }.get(timeframe, timedelta(days=30))

            # Aggregate medical records data with comprehensive metrics
            records = MedicalRecord.objects.filter(
                created_at__gte=start_date
            ).annotate(
                region=F('hospital__city')
            ).values('region').annotate(
                case_count=Count('id'),
                high_risk_count=Count(
                    'patient',
                    filter=Q(patient__is_high_risk=True)
                ),
                unique_patients=Count('patient', distinct=True),
                avg_recovery_time=Avg('recovery_duration'),
                satisfaction_score=Avg('patient_satisfaction'),
                treatment_success_rate=ExpressionWrapper(
                    Count('id', filter=Q(status='IMPROVED')) * 100.0 / Count('id'),
                    output_field=FloatField()
                )
            )
            
            return Response({
                'data': self.process_regional_data(records),
                'metadata': {
                    'timeframe': timeframe,
                    'total_regions': records.count(),
                    'updated_at': timezone.now().isoformat()
                }
            })
            
        except Exception as e:
            print(f"Analytics error: {str(e)}")  # For debugging
            return Response(
                {'error': 'Failed to process regional analytics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def process_regional_data(self, records):
        """Process and transform regional data for frontend consumption."""
        processed_data = []
        
        for record in records:
            processed_data.append({
                'region': record['region'],
                'metrics': {
                    'caseCount': record['case_count'],
                    'highRiskPatients': record['high_risk_count'],
                    'uniquePatients': record['unique_patients'],
                    'avgRecoveryTime': record['avg_recovery_time'],
                    'satisfactionScore': record['satisfaction_score'],
                    'successRate': record['treatment_success_rate']
                },
                'trends': self.calculate_trends(record['region']),
                'insights': self.generate_insights(record)
            })
        
        return processed_data

    def calculate_trends(self, region):
        """Calculate trends for a specific region."""
        last_month = timezone.now() - timedelta(days=30)
        
        return MedicalRecord.objects.filter(
            hospital__city=region,
            created_at__gte=last_month
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            daily_cases=Count('id'),
            success_rate=ExpressionWrapper(
                Count('id', filter=Q(status='IMPROVED')) * 100.0 / Count('id'),
                output_field=FloatField()
            )
        ).order_by('date')

    def generate_insights(self, record):
        """Generate AI-driven insights from regional data."""
        return {
            'riskLevel': self.determine_risk_level(record),
            'recommendations': self.generate_recommendations(record),
            'alerts': self.generate_alerts(record)
        }

    def determine_risk_level(self, record):
        """Determine overall risk level for a region."""
        high_risk_ratio = record['high_risk_count'] / record['case_count']
        
        if high_risk_ratio >= 0.15:
            return 'HIGH'
        elif high_risk_ratio >= 0.05:
            return 'MEDIUM'
        return 'LOW'

    def generate_recommendations(self, record):
        """Generate data-driven recommendations."""
        recommendations = []
        
        # Example recommendation logic
        if record['high_risk_count'] / record['case_count'] > 0.1:
            recommendations.append({
                'type': 'PREVENTIVE',
                'action': 'Increase preventive care programs',
                'priority': 'HIGH'
            })
            
        if record['satisfaction_score'] < 4.0:
            recommendations.append({
                'type': 'SERVICE',
                'action': 'Review patient satisfaction factors',
                'priority': 'MEDIUM'
            })
            
        return recommendations

    def generate_alerts(self, record):
        """Generate alerts based on metrics."""
        alerts = []
        
        # Example alert logic
        if record['high_risk_count'] > record['case_count'] * 0.2:
            alerts.append({
                'type': 'RISK',
                'message': 'High proportion of high-risk patients',
                'severity': 'HIGH'
            })
            
        if record['treatment_success_rate'] < 70:
            alerts.append({
                'type': 'PERFORMANCE',
                'message': 'Treatment success rate below target',
                'severity': 'MEDIUM'
            })
            
        return alerts
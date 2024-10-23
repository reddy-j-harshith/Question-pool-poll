from django.urls import path
from .views import *

from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Auth
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User
    path('register/', register_user, name='register_user'),

    # Question
    path('questions/', get_questions, name='get_questions'),
    path('question/<int:question_id>/', fetch_question, name='fetch_question'),
    path('add-question/', add_question, name='add_question'),
    path('update-question/<int:question_id>/', update_question, name='update_question'),
    path('delete-question/<int:question_id>/', delete_question, name='delete_question'),

    # Comment
    path('comments/<int:question_id>/', get_comments, name='get_comments'),
    path('add-comment/<int:question_id>/', add_comment, name='add_comment'),
    path('delete-comment/<int:comment_id>/', delete_comment, name='delete_comment'),

    # Rating
    path('get_ratings/<int:question_id>/<int:user_id>/', get_user_ratings, name='get_rating'),
    path('add-rating/<int:question_id>/<int:user_id>/', rate_question, name='add_rating'),
    path('get-net-ratings/', get_net_ratings, name='get_net_ratings'),

    # Test
    path('test/create/', views.create_test, name='create_test'),
    path('test/fetch-all/', views.fetch_tests, name='fetch_tests'),
    path('test/<int:test_id>/start/', views.start_test, name='start_test'),
    path('test/<int:test_id>/stop/', views.stop_test, name='stop_test'),

    # Monitoring
    path('test/<int:test_id>/monitor', views.monitor_test, name='monitor_test'),
    path('test/<int:user_id>/<int:test_id>/stats', views.student_stats, name='student_stats'),
]

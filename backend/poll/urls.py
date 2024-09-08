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
        path('question/<int:question_id>', fetch_question, name='fetch_question'),
        path('add-question/', add_question, name='add_question'),
        path('delete-question/<int:question_id>', delete_question, name='delete_question'),

        # Comment
        path('comments/', get_comments, name='get_comments'),
        path('add-comment/', add_comment, name='add_comment'),
        path('delete-comment/<int:comment_id>', delete_comment, name='delete_comment'),
        
        # Rating
        path('ratings/', get_rating, name='get_ratings'),
        path('add-rating/', rate_question, name='add_rating'),
        path('update-rating/<int:rating_id>', update_rating, name='update_rating'),

    ]
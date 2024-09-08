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
    path('ratings/<int:question_id>/', get_rating, name='get_rating'),
    path('add-rating/<int:question_id>/', rate_question, name='add_rating'),
    path('update-rating/<int:rating_id>/', update_rating, name='update_rating'),
    path('get-net-ratings/', get_net_ratings, name='get_net_ratings'),
]

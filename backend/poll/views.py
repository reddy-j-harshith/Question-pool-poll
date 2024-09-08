from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.contrib.auth.models import User

from rest_framework.decorators import api_view as view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.http import JsonResponse

from .models import Question
from .serializers import *

# Create your views here.
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username
        token['is_staff'] = user.is_staff

        return token
    
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# USER
@view(['POST'])
@permission_classes([AllowAny])
def register_user(request):

    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email")

    user = User.objects.filter(username = username)

    if user.exists():
        return JsonResponse({"Message": "User name already exists"}, status=409)

    user = User.objects.create_user(username = username, password = password, email = email)
    user.save()

    return JsonResponse({"Message": "User created successfully"}, status=201)

# QUESTION
@view(['GET'])
@permission_classes([IsAuthenticated])
def get_questions(request):
    questions = Question.objects.all()
    serializer = QuestionSerializer(questions, many=True)
    return JsonResponse(serializer.data, safe=False)

@view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_question(request, question_id):
    question = Question.objects.get(id=question_id)
    serializer = QuestionSerializer(question)
    return JsonResponse(serializer.data, safe=False)

@view(['POST'])
@permission_classes([IsAuthenticated])
def add_question(request):
    question_text = request.data.get("question_text")
    option_1 = request.data.get("option_1")
    option_2 = request.data.get("option_2")
    option_3 = request.data.get("option_3")
    option_4 = request.data.get("option_4")
    correct_option = request.data.get("correct_option")
    net_rating = request.data.get("net_rating")
    rated_count = request.data.get("rated_count")

    question = Question.objects.create(question_text = question_text, option_1 = option_1, option_2 = option_2, option_3 = option_3, option_4 = option_4, correct_option = correct_option, net_rating = net_rating, rated_count = rated_count)
    question.save()

    return JsonResponse({"Message": "Question added successfully"}, status=201)

@view(['PUT'])
@permission_classes([IsAuthenticated])
def update_question(request, question_id):
    question = Question.objects.get(id=question_id)
    question_text = request.data.get("question_text")
    option_1 = request.data.get("option_1")
    option_2 = request.data.get("option_2")
    option_3 = request.data.get("option_3")
    option_4 = request.data.get("option_4")
    correct_option = request.data.get("correct_option")
    net_rating = request.data.get("net_rating")
    rated_count = request.data.get("rated_count")

    question.question_text = question_text
    question.option_1 = option_1
    question.option_2 = option_2
    question.option_3 = option_3
    question.option_4 = option_4
    question.correct_option = correct_option
    question.net_rating = net_rating
    question.rated_count = rated_count
    question.save()

    return JsonResponse({"Message": "Question updated successfully"}, status=200)

@view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_question(request, question_id):
    question = Question.objects.get(id=question_id)
    question.delete()

    return JsonResponse({"Message": "Question deleted successfully"}, status=200)

@view(['POST'])
@permission_classes([IsAuthenticated])
def rate_question(request, question_id):
    question = Question.objects.get(id=question_id)
    user = request.user
    rating = request.data.get("rating")

    rating = Rating.objects.create(question = question, user = user, rating = rating)
    rating.save()

    question.net_rating = (question.net_rating * question.rated_count + rating.rating) / (question.rated_count + 1)
    question.rated_count += 1
    question.save()

    return JsonResponse({"Message": "Question rated successfully"}, status=201)

@view(['GET'])
@permission_classes([IsAuthenticated])
def get_rating(request, question_id):
    question = Question.objects.get(id=question_id)
    ratings = Rating.objects.filter(question = question)
    serializer = RatingSerializer(ratings, many=True)
    return JsonResponse(serializer.data, safe=False)

@view(['UPDATE'])
@permission_classes([IsAuthenticated])
def update_rating(request, rating_id):
    rating = Rating.objects.get(id=rating_id)
    rating = request.data.get("rating")
    rating.save()

    return JsonResponse({"Message": "Rating updated successfully"}, status=200)


# COMMENTS
@view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request, question_id):
    question = Question.objects.get(id=question_id)
    user = request.user
    comment_text = request.data.get("comment_text")

    comment = Comments.objects.create(question = question, user = user, comment_text = comment_text)
    comment.save()

    return JsonResponse({"Message": "Comment added successfully"}, status=201)

@view(['GET'])
@permission_classes([IsAuthenticated])
def get_comments(request, question_id):
    question = Question.objects.get(id=question_id)
    comments = Comments.objects.filter(question = question)
    serializer = CommentSerializer(comments, many=True)
    return JsonResponse(serializer.data, safe=False)

@view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, comment_id):
    comment = Comments.objects.get(id=comment_id)
    comment.delete()

    return JsonResponse({"Message": "Comment deleted successfully"}, status=200)

@view(['GET'])
@permission_classes([IsAdminUser])
def get_net_ratings(request):
    questions = Question.objects.all()
    rating_data = []
    for question in questions:
        question_data = {
            'question_id': question.id,
            'net_rating': question.net_rating,
            'difficulty': question.difficulty
        }
        rating_data.append(question_data)
    return JsonResponse(rating_data, safe=False)
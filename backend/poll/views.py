from decimal import Decimal
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from rest_framework.decorators import api_view as view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.http import JsonResponse
from .models import *
from .models import Test
from .serializers import QuestionSerializer, RatingSerializer, CommentSerializer

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

    user = User.objects.filter(username=username)

    if user.exists():
        return JsonResponse({"Message": "User name already exists"}, status=409)

    user = User.objects.create_user(username=username, password=password, email=email)
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
    serializer = QuestionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse({"message": "Question added successfully"}, status=201)
    return JsonResponse(serializer.errors, status=400)

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
def rate_question(request, question_id, user_id):
    try:
        question = Question.objects.get(id=question_id)
        user = User.objects.get(id=user_id)

        # Check if rating is provided in the request data
        rating_value = request.data.get("rating")
        if rating_value is None:
            return JsonResponse({"Error": "Rating value is required"}, status=400)

        try:
            rating_value = Decimal(rating_value)  # Convert rating_value to Decimal
        except ValueError:
            return JsonResponse({"Error": "Invalid rating value"}, status=400)

        # Check if a rating already exists for this question and user
        try:
            rating = Rating.objects.get(question=question, user=user)
            # Update the net_rating by removing the old rating and adding the new one
            question.net_rating = (question.net_rating * question.rated_count - rating.rating + rating_value) / question.rated_count
            rating.rating = rating_value  # Update the existing rating
        except Rating.DoesNotExist:
            # If the rating does not exist, create a new one
            rating = Rating(question=question, user=user, rating=rating_value)
            # Calculate the new net rating for the question
            question.net_rating = (question.net_rating * question.rated_count + rating_value) / (question.rated_count + 1)
            question.rated_count += 1  # Increment the rated count for new rating

        # Save the rating
        rating.save()

        # Save the updated question
        question.save()

        return JsonResponse({"Message": "Question rated successfully"}, status=201)

    except Question.DoesNotExist:
        return JsonResponse({"Error": "Question not found"}, status=404)
    except User.DoesNotExist:
        return JsonResponse({"Error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"Error": str(e)}, status=500)

@view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_ratings(request, question_id, user_id):
    try:
        question = Question.objects.get(id=question_id)
        user = User.objects.get(id=user_id)
        rating = Rating.objects.get(question=question, user=user)
    except ObjectDoesNotExist:
        # Return a generic rating if no record exists
        rating = Rating(question=question, user=user, rating=1.0)  # Example default rating

    serializer = RatingSerializer(rating)
    return JsonResponse(serializer.data, safe=False)

# COMMENTS
@view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request, question_id):
    question = Question.objects.get(id=question_id)
    user = request.user
    comment_text = request.data.get("comment_text")

    comment = Comments.objects.create(question=question, user=user, comment_text=comment_text)
    comment.save()

    return JsonResponse({"Message": "Comment added successfully"}, status=201)

@view(['GET'])
@permission_classes([IsAuthenticated])
def get_comments(request, question_id):
    question = Question.objects.get(id=question_id)
    comments = Comments.objects.filter(question=question)
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


# looks fucking scary, well! let's see how i fare
# TEST

# API to create a new test with provided duration, subject, and topic.
# Test is inactive by default when created.
@view(['POST'])
@permission_classes([IsAdminUser])  # Admins or Teachers can create tests
def create_test(request):
    duration = request.data.get("duration")
    subject = request.data.get("subject")
    topic = request.data.get("topic")

    # Create a new test with the provided data, setting the active status to False by default
    test = Test.objects.create(duration=duration, subject=subject, topic=topic, active=False, done=False)
    test.save()

    return JsonResponse({"message": "Test created successfully", "test_id": test.id}, status=201)

# for test dashboard for admin. # Returns a list of all tests with basic information.
@view(['GET'])
@permission_classes([IsAdminUser])
def fetch_tests(request):
    tests = Test.objects.all()  # Fetch all test records
    test_data = [{"id": test.id, "subject": test.subject, "topic": test.topic, "active": test.active} for test in tests]
    
    return JsonResponse(test_data, safe=False, status=200)

# # API to start a test by setting its active status to True.
# Once active, students can begin taking the test.
@view(['POST'])
@permission_classes([IsAdminUser])  # Can be restricted to Admin or Teachers
def start_test(request, test_id):
    try:
        test = Test.objects.get(id=test_id)
        if test.active:
            return JsonResponse({"message": "Test is already active"}, status=400)

        test.active = True
        test.active = True
        test.save()

        return JsonResponse({"message": f"Test {test_id} started successfully"}, status=200)

    except Test.DoesNotExist:
        return JsonResponse({"error": "Test not found"}, status=404)
    
# API to stop a test by setting its active status to False.
# No further attempts are allowed once the test is stopped.
@view(['POST'])
@permission_classes([IsAdminUser])  # Can be restricted to Admin or Teachers
def stop_test(request, test_id):
    try:
        test = Test.objects.get(id=test_id)
        if not test.active:
            return JsonResponse({"message": "Test is already inactive"}, status=400)

        test.active = False
        test.save()

        return JsonResponse({"message": f"Test {test_id} stopped successfully"}, status=200)

    except Test.DoesNotExist:
        return JsonResponse({"error": "Test not found"}, status=404)

# API to monitor the progress of a test by retrieving statistics for all users.
# Returns the number of questions attempted and current scores for each user.
@view(['GET'])
@permission_classes([IsAdminUser])  # Can be restricted to Admin or Teachers
def monitor_test(request, test_id):
    try:
        test_stats = TestStat.objects.filter(test__id=test_id)  # Filter stats by test ID
        data = [{
            "user": stat.user.username,
            "questions_attempted": stat.questions_attempted,
            "present_score": stat.present_score
        } for stat in test_stats]

        return JsonResponse(data, safe=False, status=200)

    except TestStat.DoesNotExist:
        return JsonResponse({"error": "No stats found for this test"}, status=404)
    

# API to get detailed stats for a specific user on a specific test.
# Returns a list of question attempts with time taken and correctness.
@view(['GET'])
@permission_classes([IsAdminUser])  # Can be restricted to Admin or Teachers
def student_stats(request, user_id, test_id):
    try:
        # Get all QuestionAttempt objects for the given user and test
        attempts = QuestionAttempt.objects.filter(user__id=user_id, test__id=test_id)

        data = [{
            "question": attempt.question.question_name,
            "time_taken": attempt.time_taken,
            "difficulty": attempt.difficulty,
            "correct": attempt.correct
        } for attempt in attempts]

        return JsonResponse(data, safe=False, status=200)

    except QuestionAttempt.DoesNotExist:
        return JsonResponse({"error": "No attempts found for this user and test"}, status=404)
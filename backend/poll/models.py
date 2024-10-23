from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

# Create your models here.


class Question(models.Model):
    question_name = models.CharField(max_length=200)    
    question_description = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published', default=timezone.now)
    subject = models.CharField(max_length=30)
    topic = models.CharField(max_length=30)
    option_1 = models.CharField(max_length=30)
    option_2 = models.CharField(max_length=30)
    option_3 = models.CharField(max_length=30)
    option_4 = models.CharField(max_length=30)
    correct_option = models.DecimalField(max_digits=1, decimal_places=0, default=1)
    net_rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    rated_count = models.IntegerField(default=0)
    difficulty = models.CharField(max_length=30, default='easy')

    def __str__(self):
        return self.question_name
    
class Comments(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    comment_text = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pub_date = models.DateTimeField('date published', default=timezone.now)

    def __str__(self):
        return self.comment_text
    
class Rating(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.DecimalField(max_digits=3, decimal_places=1)

    def __str__(self):
        return str(self.rating)
    

# I am writing TestModels here


# The Test model stores metadata about each test, including duration, topic, subject, and whether the test is currently active.
# It helps organize tests and allows the admin to activate/deactivate them when needed.
class Test(models.Model):
    # Automatically assigned ID for each test
    duration = models.IntegerField(help_text="Test duration in minutes")
    topic = models.CharField(max_length=30, help_text="Topic of the test")
    subject = models.CharField(max_length=30, help_text="Subject of the test")
    active = models.BooleanField(default=False, help_text="Is the test active?")

    def __str__(self):
        return f"{self.subject} - {self.topic} ({'Active' if self.active else 'Inactive'})"

# The QuestionAttempt model logs each user's interaction with a question during a test, including time taken, difficulty level, and whether the answer was correct.
# It provides detailed data for analyzing individual question attempts and helps monitor live performance.
#this is what we post to the user_stat page of the monitoring_page of a test
class QuestionAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    time_taken = models.DurationField(help_text="Time taken to answer the question")
    difficulty = models.CharField(max_length=30)
    correct = models.BooleanField(default=False)

    def __str__(self):
        return f"User: {self.user.username}, Question: {self.question.id}, Correct: {self.correct}"
    
#this is what we post to the main monitoring page of a test
class TestStat(models.Model):
    test = models.ForeignKey('Test', on_delete=models.CASCADE)  # Test reference
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User reference
    questions_attempted = models.IntegerField(default=0)  # Number of questions attempted
    present_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # User's current score

    def __str__(self):
        return f"TestStat: Test {self.test.id} | User {self.user.username} | Score {self.present_score}"

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
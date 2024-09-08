from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')
    option_1 = models.CharField(max_length=30)
    option_2 = models.CharField(max_length=30)
    option_3 = models.CharField(max_length=30)
    option_4 = models.CharField(max_length=30)
    correct_option = models.DecimalField(max_digits=1, decimal_places=0)
    net_rating = models.DecimalField(max_digits=2, decimal_places=1)
    rated_count = models.IntegerField(default=0)

    def __str__(self):
        return self.question_text
    
class Comments(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    comment_text = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pub_date = models.DateTimeField('date published')

    def __str__(self):
        return self.comment_text
    
class Poll(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    poll_date = models.DateTimeField('date polled')
    poll_option = models.CharField(max_length=200)

    def __str__(self):
        return self.poll_option
    
class Rating(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.DecimalField(max_digits=2, decimal_places=1)

    def __str__(self):
        return self.rating
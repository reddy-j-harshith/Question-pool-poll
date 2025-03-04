# Generated by Django 5.1.2 on 2024-10-24 19:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("poll", "0007_rename_completed_test_done"),
    ]

    operations = [
        migrations.AddField(
            model_name="test",
            name="end_time",
            field=models.DateTimeField(
                blank=True, help_text="End time of the test", null=True
            ),
        ),
        migrations.AddField(
            model_name="test",
            name="start_time",
            field=models.DateTimeField(
                blank=True, help_text="Start time of the test", null=True
            ),
        ),
        migrations.AlterField(
            model_name="test",
            name="subject",
            field=models.CharField(help_text="Subject of the test", max_length=100),
        ),
        migrations.AlterField(
            model_name="test",
            name="topic",
            field=models.CharField(help_text="Topic of the test", max_length=100),
        ),
    ]

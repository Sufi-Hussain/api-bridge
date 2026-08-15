from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("attendance", "0001_initial")]
    operations = [
        migrations.AddField(
            model_name="timesheetentry",
            name="regular_hours",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5),
        ),
        migrations.AddField(
            model_name="timesheetentry",
            name="overtime_hours",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5),
        ),
        migrations.AddField(
            model_name="timesheetentry",
            name="notes",
            field=models.TextField(blank=True),
        ),
    ]

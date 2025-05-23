# Generated by Django 5.2 on 2025-04-19 09:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_alter_donation_status'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='donation',
            options={},
        ),
        migrations.RemoveField(
            model_name='donation',
            name='is_perishable',
        ),
        migrations.RemoveField(
            model_name='donation',
            name='pickup_address',
        ),
        migrations.AddField(
            model_name='donation',
            name='category',
            field=models.CharField(choices=[('cooked', 'Cooked Food'), ('packaged', 'Packaged Food'), ('raw', 'Raw Ingredients'), ('other', 'Other')], default='other', max_length=20),
        ),
        migrations.AddField(
            model_name='donation',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='donations/'),
        ),
        migrations.AddField(
            model_name='donation',
            name='location',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='donation',
            name='quantity_taken',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='donation',
            name='status',
            field=models.CharField(choices=[('available', 'Available'), ('claimed', 'Claimed'), ('expired', 'Expired'), ('cancelled', 'Cancelled')], default='available', max_length=20),
        ),
        migrations.AlterField(
            model_name='donation',
            name='title',
            field=models.CharField(max_length=200),
        ),
    ]

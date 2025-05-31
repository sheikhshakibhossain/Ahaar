from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

def create_admin_user():
    try:
        with transaction.atomic():
            # Check if admin user already exists
            if not User.objects.filter(username='admin').exists():
                admin_user = User.objects.create_user(
                    username='admin',
                    password='admin123',
                    email='admin@ahaar.com',
                    first_name='Admin',
                    last_name='User',
                    role='admin'
                )
                print(f"Admin user created successfully: {admin_user.username}")
            else:
                print("Admin user already exists")
    except Exception as e:
        print(f"Error creating admin user: {str(e)}")

if __name__ == '__main__':
    create_admin_user() 
import axios from 'axios';

const createAdmin = async () => {
    try {
        const adminData = {
            username: 'admin',
            password: 'admin123',
            password2: 'admin123',
            email: 'admin@ahaar.com',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin'
        };

        const response = await axios.post('http://localhost:8000/api/register/', adminData);
        console.log('Admin user created successfully:', response.data);
    } catch (error: any) {
        console.error('Error creating admin user:', error.response?.data || error.message);
    }
};

createAdmin(); 
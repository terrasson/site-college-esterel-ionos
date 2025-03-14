require('dotenv').config();

// Get user credentials from environment variables
const users = [
    {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
    },
    {
        username: process.env.CUISINE_USERNAME,
        password: process.env.CUISINE_PASSWORD,
        role: 'cuisine'
    },
    {
        username: process.env.DIRECTION_USERNAME,
        password: process.env.DIRECTION_PASSWORD,
        role: 'direction'
    }
].filter(user => user.username && user.password); // Only keep users that have both username and password defined

// Validate that we have at least one valid user
if (users.length === 0) {
    console.error('No valid users found in environment variables');
}

module.exports = {
    jwt: {
        secret: process.env.JWT_SECRET,
        duration: parseInt(process.env.JWT_EXPIRATION) || 86400000 // 24 hours
    },
    users
}; 
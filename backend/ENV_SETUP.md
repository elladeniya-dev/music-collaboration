# HarmoniX Backend - Environment Setup

## Prerequisites
- Java 21
- Maven
- MongoDB (running locally or remote instance)
- Google OAuth 2.0 Client ID
- Cloudinary account

## Environment Configuration

### 1. Setup Environment Variables

Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

### 2. Configure Required Secrets

Edit the `.env` file and fill in your actual values:

#### MongoDB Configuration
```env
MONGODB_URI=mongodb://localhost:27017/harmonix
MONGODB_DATABASE=harmonix
```
For MongoDB Atlas or remote instances, use your connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/harmonix
```

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs: `http://localhost:5173`
6. Copy your Client ID:
```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

#### JWT Secret
Generate a secure random string (minimum 256 bits / 32 characters):
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use any secure password generator
```
```env
JWT_SECRET_KEY=your-generated-secure-random-string-here
JWT_EXPIRATION_MS=3600000  # 1 hour in milliseconds
```

#### Cloudinary Configuration
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the Dashboard
3. Add them to `.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### CORS Configuration
Update allowed origins for your frontend:
```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```
For production, add your production domain.

## Running the Application

### Development Mode
```bash
./mvnw spring-boot:run
```

### Building for Production
```bash
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SERVER_PORT` | Application server port | No | 8080 |
| `MONGODB_URI` | MongoDB connection string | Yes | mongodb://localhost:27017/harmonix |
| `MONGODB_DATABASE` | MongoDB database name | Yes | harmonix |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID | Yes | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 Client Secret | Yes | - |
| `JWT_SECRET_KEY` | Secret key for JWT signing | Yes | - |
| `JWT_EXPIRATION_MS` | JWT token expiration in milliseconds | No | 3600000 |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes | - |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins | No | http://localhost:5173 |
| `FRONTEND_URL` | Frontend base URL used for OAuth redirect | No | http://localhost:5173 |

## Security Notes

⚠️ **IMPORTANT**: Never commit the `.env` file to version control!

The `.env` file is already added to `.gitignore` to prevent accidental commits.

- Keep your `.env` file secure and never share it publicly
- Use different credentials for development and production
- Rotate your JWT secret regularly
- Use environment-specific configuration files for different environments
- In production, use secure secret management services (AWS Secrets Manager, Azure Key Vault, etc.)

## Troubleshooting

### JWT Secret Error
If you see "JWT secret key not initialized", ensure:
1. The `.env` file exists in the project root
2. `JWT_SECRET_KEY` is set in the `.env` file
3. The secret is at least 256 bits (32 characters) long

### MongoDB Connection Error
Ensure MongoDB is running:
```bash
# Check if MongoDB is running
mongosh
```

### Google OAuth Error
Verify:
1. Client ID is correctly set in `.env`
2. Authorized redirect URIs are configured in Google Cloud Console
3. The frontend is sending the correct token format

## API Documentation

The backend exposes the following endpoints:
- `http://localhost:8080/api/auth/*` - Authentication
- `http://localhost:8080/api/users/*` - User management
- `http://localhost:8080/api/job-post/*` - Job posts
- `http://localhost:8080/api/messages/*` - Messaging
- `http://localhost:8080/api/chat-heads/*` - Chat heads
- `http://localhost:8080/api/collab-requests/*` - Collaboration requests

Health check: `http://localhost:8080/actuator/health`

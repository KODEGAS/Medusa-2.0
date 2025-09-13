# MongoDB Setup Guide for Medusa Backend

## Current Setup
Your backend is already configured to use **MongoDB Atlas** (MongoDB's cloud service) with the following connection string:
```
mongodb+srv://malee:MeduSa&04265@cluster0.w5sfflm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

## Database Schema
Your application uses these collections:
- **teams**: Stores team information with embedded member data
- **payments**: Handles payment-related data (referenced in routes)

## Setup Options

### Option 1: MongoDB Atlas (Recommended for Production)

#### 1. Access Your Existing Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign in with your existing account
3. Select your project and cluster (`cluster0`)

#### 2. Network Access Configuration
1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. For development: Add `0.0.0.0/0` (allow all IPs)
4. For production: Add your Google Cloud IP ranges or use VPC peering

#### 3. Database User Setup
1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create a user with read/write access to your database
5. **Important**: Use a strong password and save it securely

#### 4. Get Connection String
1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Select **Node.js** as your driver
4. Copy the connection string and replace:
   - `<username>` with your database user
   - `<password>` with your database password
   - `<database>` with your database name (e.g., `medusa-prod`)

#### 5. Update Environment Variables
Update your `backend/.env` file:
```bash
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.w5sfflm.mongodb.net/medusa-prod?retryWrites=true&w=majority&appName=Cluster0
```

### Option 2: Google Cloud MongoDB (Alternative)

#### Using MongoDB Atlas on Google Cloud
1. Create a MongoDB Atlas cluster in the same region as your Google Cloud project
2. Configure VPC peering between Google Cloud and MongoDB Atlas
3. Use private IP addresses for better security and lower latency

#### Using Cloud SQL for MongoDB
1. Enable Cloud SQL API in your Google Cloud project
2. Create a MongoDB instance
3. Configure connection pooling for better performance

## Security Best Practices

### 1. Environment Variables
- Never commit actual credentials to version control
- Use different databases for development/staging/production
- Rotate passwords regularly

### 2. Network Security
- Use VPC peering or private IPs when possible
- Restrict IP access to known ranges
- Enable MongoDB Atlas's built-in encryption

### 3. Database Security
- Create dedicated database users with minimal required permissions
- Enable database auditing
- Set up backup and recovery procedures

## Database Management

### Creating Collections
Your application will automatically create collections when you first save data. The main collections are:
- `teams` - for team registrations
- `payments` - for payment processing

### Backup Strategy
1. **MongoDB Atlas**: Automatic backups are included
2. **Manual Backups**: Use `mongodump` for local backups
3. **Point-in-time Recovery**: Available in Atlas for data protection

## Monitoring and Maintenance

### Health Checks
Your backend includes a health check endpoint at `/api/health` that verifies database connectivity.

### Connection Pooling
Mongoose automatically handles connection pooling. For high-traffic applications, consider:
- Increasing connection pool size
- Implementing connection retry logic
- Monitoring connection metrics

### Performance Optimization
1. **Indexes**: Create indexes on frequently queried fields
2. **Aggregation Pipelines**: Use for complex queries
3. **Read Preferences**: Configure for better performance

## Troubleshooting

### Common Issues

#### Connection Timeout
```
Error: MongoNetworkError: connection timed out
```
**Solutions:**
- Check network access rules
- Verify connection string format
- Ensure database user has correct permissions

#### Authentication Failed
```
Error: Authentication failed
```
**Solutions:**
- Verify username and password
- Check user permissions
- Ensure user exists in the correct database

#### Database Not Found
```
Error: database does not exist
```
**Solutions:**
- Create the database first or let your application create it
- Verify database name in connection string

## Migration Strategy

### From Development to Production
1. Create separate databases for each environment
2. Use environment-specific connection strings
3. Implement database seeding for initial data
4. Set up automated backups

### Data Migration
If you need to migrate existing data:
```bash
# Export from source
mongodump --uri="source-connection-string" --out=/path/to/backup

# Import to destination
mongorestore --uri="destination-connection-string" /path/to/backup
```

## Cost Optimization

### MongoDB Atlas Pricing
- **Free Tier**: 512MB storage, perfect for development
- **Shared Clusters**: Cost-effective for small applications
- **Dedicated Clusters**: Better performance for production

### Google Cloud Integration
- Use Google Cloud's private networking for reduced latency
- Leverage Cloud Monitoring for database metrics
- Consider Cloud SQL if you need SQL features later

## Next Steps

1. **Verify Connection**: Test your connection string with a simple script
2. **Set Up Monitoring**: Enable MongoDB Atlas monitoring
3. **Configure Backups**: Set up automated backup schedules
4. **Security Review**: Audit your network access and user permissions

Your current setup looks good for getting started. The existing connection string suggests you already have a MongoDB Atlas cluster configured!
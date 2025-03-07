# Address Structure Migration

This document explains how to update the address structures in the application.

## Background

The application has been updated to use a consistent address structure across all models. 
Previously, addresses were stored in different formats:

- `Lead` model used an object structure with properties: `street`, `city`, `state`, `zipCode`, `country`
- `Customer` model used a simple string format

This inconsistency caused rendering issues in the frontend and made it difficult to format addresses consistently.

## Changes Made

1. `Customer` model has been updated to use the same address structure as the `Lead` model
2. Frontend now uses a common `formatAddress` utility function to display addresses consistently
3. Added validation to ensure address objects have the expected structure

## Migration Steps

Follow these steps to migrate existing data to the new address structure:

### 1. Update the Models

The models have already been updated to use the new address structure.

### 2. Run the Migration Script

Run the migration script to convert existing string addresses to the new object format:

```bash
# Navigate to the backend directory
cd backend

# Run the migration script
node src/migrateAddresses.js
```

### 3. Verify the Migration

After running the migration script, you can verify that the addresses have been migrated correctly by:

1. Checking the console output from the migration script
2. Logging into the application and viewing customer details
3. Running a database query to check the address structure:

```javascript
// In MongoDB shell
db.customers.find({}, {name: 1, address: 1})
```

## Troubleshooting

If you encounter any issues during the migration:

1. Check the MongoDB connection in the `.env` file
2. Ensure you have the latest model definitions
3. Run the migration script with more verbose logging if needed
4. If addresses are not parsed correctly, you may need to customize the parsing logic in the migration script

## Going Forward

With these changes, all addresses in the application are now stored as structured objects, making it easier to:

1. Display addresses consistently across the application
2. Filter and search by address components
3. Support international addresses with proper formatting
4. Integrate with mapping and geolocation services

When adding new models or features that use addresses, make sure to follow this same structure.
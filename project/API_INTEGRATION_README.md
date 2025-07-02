# Project Creation API Integration

## Overview
This document describes the integration of the "Save Project" functionality with the backend API.

## API Endpoint
- **URL**: `http://34.57.197.188:8087/api/v1/projects`
- **Method**: POST
- **Content-Type**: application/json

## Request Format
```typescript
interface CreateProjectRequest {
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  clientName: string;
  country: string;
  state: string;
  email: string;
  phoneNo: string;
  userId?: number; // Optional, defaults to 1
}
```

## Response Format
```typescript
interface CreateProjectResponse {
  status: string;
  message: string;
  data: {
    id: number;
    projectId: string;
    projectName: string;
    description: string;
    startDate: string;
    endDate: string;
    clientName: string;
    country: string;
    state: string;
    email: string;
    phoneNo: string;
    userId: number;
    userFirstName: string;
    userLastName: string;
  };
  statusCode: number;
}
```

## Implementation Details

### Files Modified
1. **`src/api/project/getproject.ts`** - Added `createProject` function
2. **`src/pages/Projects.tsx`** - Updated `handleSubmit` function to use API
3. **`src/types/index.ts`** - Added `BackendProject` interface

### Key Features
- ✅ Form validation
- ✅ Loading states during API calls
- ✅ Error handling with user-friendly messages
- ✅ Automatic project list refresh after creation
- ✅ Success notification
- ✅ TypeScript type safety

### Usage
1. Click "Add Project" button on the Projects page
2. Fill in the required project details
3. Click "Save Project" button
4. The project will be created via API and the list will refresh

### Error Handling
The integration includes comprehensive error handling for:
- Network errors
- Validation errors (400)
- Server errors (500)
- General API errors

### Authentication
Currently uses a default `userId: 1`. In production, this should be retrieved from the authentication context.

## Testing
The integration can be tested by:
1. Running the development server: `npm run dev`
2. Navigating to the Projects page
3. Creating a new project with valid data
4. Verifying the project appears in the list after creation 
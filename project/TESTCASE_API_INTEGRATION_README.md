# Test Case Creation API Integration

## Overview
This document describes the integration of the "Add New Test Case" functionality with the backend API.

## API Endpoint
- **URL**: `http://34.57.197.188:8087/api/v1/testcase`
- **Method**: POST
- **Content-Type**: application/json

## Request Format
```typescript
interface CreateTestCaseRequest {
  testcase: string;
  description: string;
  steps: string;
  submoduleId: number;
  moduleId: number;
  projectId: number;
  severityId: number;
  defectTypeId: number;
  userId?: number; // Optional, defaults to 1
}
```

## Response Format
```typescript
interface CreateTestCaseResponse {
  status: string;
  message: string;
  data: {
    id: number;
    testcaseId: string;
    testcase: string;
    description: string;
    steps: string;
    submoduleId: number;
    moduleId: number;
    projectId: number;
    severityId: number;
    defectTypeId: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
  };
  statusCode: number;
}
```

## Implementation Details

### Files Modified
1. **`src/api/testCase/createTestcase.ts`** - Added `createTestCase` and `createMultipleTestCases` functions
2. **`src/pages/TestCase.tsx`** - Updated `handleSubmitAll` function to use API
3. **`src/pages/TestCase.tsx`** - Added loading states and error handling

### Key Features
- ✅ Form validation
- ✅ Loading states during API calls
- ✅ Error handling with user-friendly messages
- ✅ Automatic test case list refresh after creation
- ✅ Success notification
- ✅ TypeScript type safety
- ✅ Support for multiple test case creation
- ✅ Support for both create and update operations

### Usage
1. Click "Add New Test Case" button on the TestCase page
2. Fill in the required test case details (module, submodule, description, steps, type, severity)
3. Click "+ Add Another Test Case" to add more test cases
4. Click "Submit" button to save all test cases
5. The test cases will be created via API and the list will refresh

### Error Handling
The integration includes comprehensive error handling for:
- Network errors
- Validation errors (400)
- Server errors (500)
- General API errors

### Authentication
Currently uses a default `userId: 1`. In production, this should be retrieved from the authentication context.

### Multiple Test Case Creation
The integration supports creating multiple test cases at once:
- Use the "+ Add Another Test Case" button to add more forms
- All test cases will be submitted together when clicking "Submit"
- Each test case is validated before submission

### Update vs Create
The system automatically detects whether to create or update:
- If a test case has an `id`, it will be updated
- If no `id` is present, a new test case will be created

## Testing
The integration can be tested by:
1. Running the development server: `npm run dev`
2. Navigating to the TestCase page
3. Creating a new test case with valid data
4. Adding multiple test cases using "+ Add Another Test Case"
5. Submitting all test cases
6. Verifying the test cases appear in the list after creation 
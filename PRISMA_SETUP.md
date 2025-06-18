# Prisma Setup Instructions

To fix the TypeScript errors, you need to regenerate the Prisma client after the schema changes.

## Step 1: Run Prisma Generate

Open a new terminal/command prompt and run:

```bash
npx prisma generate
```

Or if you're on Windows and having PowerShell execution policy issues, you can:

1. Right-click on the `generate-prisma.bat` file in your project root
2. Select "Run as administrator"

## Step 2: Restart Your Development Server

After running the generate command:

1. Stop your current development server (Ctrl+C)
2. Run `npm run dev` again

## Step 3: Verify the Changes

The TypeScript errors should now be resolved. The Prisma client will now recognize:

- The new `Role` enum (ADMIN, MANAGER, STANDARDIZATION)
- The new `DocumentStatus` enum (PENDING, APPROVED, REJECTED)
- The updated Document model with `creatorId` and `status` fields
- The new Approval model

## What Was Changed

1. **Schema Updates:**
   - Added Role enum for user roles
   - Added DocumentStatus enum for document approval status
   - Updated User model to include role field
   - Updated Document model to include status and creator relationship
   - Added Approval model for tracking document approvals

2. **Type Definitions:**
   - Created `types/prisma.ts` with proper TypeScript interfaces
   - Updated components to use these types

3. **Role-Based Access Control:**
   - Admin: Can upload, edit, and delete documents
   - Manager/Standardization: Can approve or reject documents
   - All users can view documents and approval history

## Testing the System

1. Create users with different roles in your database
2. Login as an Admin to upload documents
3. Login as a Manager or Standardization user to approve/reject documents
4. Check that the role-based permissions are working correctly

If you still see errors after running `npx prisma generate`, try:

```bash
npm run build
```

This will help identify any remaining TypeScript issues. 
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// Define the type for password policy that compatible with Prisma.JsonValue
interface PasswordPolicy extends Prisma.JsonObject {
  minLength: number;
  requireSpecialChar: boolean;
  requireNumber: boolean;
  expiryDays: number;
  [key: string]: string | number | boolean | null; // Add index signature
}

// Define the type for settings input
interface SystemSettingsInput {
  backupFrequency: string;
  retentionPeriod: number;
  emailNotifications: boolean;
  systemMaintenanceMode: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  autoApprovalTimeout: number;
  passwordPolicy: PasswordPolicy;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings: SystemSettingsInput = await request.json();
    
    // Validate required fields
    if (!settings.backupFrequency || !settings.passwordPolicy) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Convert passwordPolicy to a valid Prisma.JsonValue
    const passwordPolicyJson: Prisma.JsonObject = {
      minLength: settings.passwordPolicy.minLength,
      requireSpecialChar: settings.passwordPolicy.requireSpecialChar,
      requireNumber: settings.passwordPolicy.requireNumber,
      expiryDays: settings.passwordPolicy.expiryDays
    };

    // Save settings to database using upsert
    await prisma.systemSettings.upsert({
      where: { id: 1 },
      update: {
        backupFrequency: settings.backupFrequency,
        retentionPeriod: settings.retentionPeriod,
        emailNotifications: settings.emailNotifications,
        systemMaintenanceMode: settings.systemMaintenanceMode,
        maxFileSize: settings.maxFileSize,
        allowedFileTypes: settings.allowedFileTypes,
        autoApprovalTimeout: settings.autoApprovalTimeout,
        passwordPolicy: passwordPolicyJson,
      },
      create: {
        id: 1,
        backupFrequency: settings.backupFrequency,
        retentionPeriod: settings.retentionPeriod,
        emailNotifications: settings.emailNotifications,
        systemMaintenanceMode: settings.systemMaintenanceMode,
        maxFileSize: settings.maxFileSize,
        allowedFileTypes: settings.allowedFileTypes,
        autoApprovalTimeout: settings.autoApprovalTimeout,
        passwordPolicy: passwordPolicyJson,
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.systemSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      // Return default settings if none exist
      const defaultPasswordPolicy: PasswordPolicy = {
        minLength: 8,
        requireSpecialChar: true,
        requireNumber: true,
        expiryDays: 90
      };

      return NextResponse.json({
        backupFrequency: 'daily',
        retentionPeriod: 30,
        emailNotifications: true,
        systemMaintenanceMode: false,
        maxFileSize: 10,
        allowedFileTypes: ['.pdf', '.doc', '.docx'],
        autoApprovalTimeout: 72,
        passwordPolicy: defaultPasswordPolicy
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' }, 
      { status: 500 }
    );
  }
}
'use client';

import { useState } from 'react';
import { 
  Shield, 
  Database, 
  Bell, 
  HardDrive, 
  Mail, 
  Key, 
  Workflow, 
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SystemSettings {
  backupFrequency: string;
  retentionPeriod: number;
  emailNotifications: boolean;
  systemMaintenanceMode: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  autoApprovalTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireSpecialChar: boolean;
    requireNumber: boolean;
    expiryDays: number;
  };
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>({
    backupFrequency: 'daily',
    retentionPeriod: 30,
    emailNotifications: true,
    systemMaintenanceMode: false,
    maxFileSize: 10,
    allowedFileTypes: ['.pdf', '.doc', '.docx'],
    autoApprovalTimeout: 72,
    passwordPolicy: {
      minLength: 8,
      requireSpecialChar: true,
      requireNumber: true,
      expiryDays: 90,
    },
  });

  const handleSave = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast({
        title: "Settings saved",
        description: "System settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">System Settings</h1>
          <p className="text-gray-600">
            Configure system-wide settings and preferences
          </p>
        </div>

        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-transparent h-auto p-0">
            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="backup" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Database className="mr-2 h-4 w-4" />
              Backup & Storage
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <HardDrive className="mr-2 h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <Label>Minimum Password Length</Label>
                    <Input 
                      type="number" 
                      value={settings.passwordPolicy.minLength}
                      onChange={(e) => setSettings({
                        ...settings,
                        passwordPolicy: {
                          ...settings.passwordPolicy,
                          minLength: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Special Characters</Label>
                    <Switch 
                      checked={settings.passwordPolicy.requireSpecialChar}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        passwordPolicy: {
                          ...settings.passwordPolicy,
                          requireSpecialChar: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Numbers</Label>
                    <Switch 
                      checked={settings.passwordPolicy.requireNumber}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        passwordPolicy: {
                          ...settings.passwordPolicy,
                          requireNumber: checked
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Password Expiry (Days)</Label>
                    <Input 
                      type="number" 
                      value={settings.passwordPolicy.expiryDays}
                      onChange={(e) => setSettings({
                        ...settings,
                        passwordPolicy: {
                          ...settings.passwordPolicy,
                          expiryDays: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="backup">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Backup & Storage Settings</h2>
              <div className="space-y-6">
                <div>
                  <Label>Backup Frequency</Label>
                  <Select 
                    value={settings.backupFrequency}
                    onValueChange={(value) => setSettings({...settings, backupFrequency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data Retention Period (Days)</Label>
                  <Input 
                    type="number" 
                    value={settings.retentionPeriod}
                    onChange={(e) => setSettings({...settings, retentionPeriod: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Maximum File Size (MB)</Label>
                  <Input 
                    type="number" 
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label>Email Notifications</Label>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                  />
                </div>
                <div>
                  <Label>Auto-Approval Timeout (Hours)</Label>
                  <Input 
                    type="number" 
                    value={settings.autoApprovalTimeout}
                    onChange={(e) => setSettings({...settings, autoApprovalTimeout: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">System Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">
                      Enable maintenance mode to prevent user access during updates
                    </p>
                  </div>
                  <Switch 
                    checked={settings.systemMaintenanceMode}
                    onCheckedChange={(checked) => setSettings({...settings, systemMaintenanceMode: checked})}
                  />
                </div>
                <div>
                  <Label>Allowed File Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {settings.allowedFileTypes.map((type, index) => (
                      <div 
                        key={index}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        <FileCheck className="h-4 w-4" />
                        {type}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reset
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>

        {/* System Status Card */}
        <Card className="mt-8 p-6 border-l-4 border-green-500">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-green-500 mt-1" />
            <div>
              <h3 className="font-semibold">System Status</h3>
              <p className="text-sm text-gray-600">
                All systems are operating normally. Last checked: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
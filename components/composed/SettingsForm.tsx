"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/hooks/use-toast'
import { User } from '@/types/models'

interface SettingsFormProps {
  user: User | null;
  onSave?: (data: { name: string; emailPreferences?: Record<string, boolean> }) => Promise<void>;
  isLoading?: boolean;
}

export function SettingsForm({ user, onSave, isLoading: externalLoading }: SettingsFormProps) {
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [emailPreferences, setEmailPreferences] = useState<Record<string, boolean>>({
    marketing: false,
    product_updates: true,
    security: true
  });
  
  // Initialize email preferences from user data
  useEffect(() => {
    if (user?.email_preferences) {
      setEmailPreferences(user.email_preferences);
    }
  }, [user]);
  
  const loading = externalLoading || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;
    
    setIsLoading(true);
    
    try {
      await onSave({ 
        name,
        emailPreferences
      });
      
      toast({
        title: "Settings updated",
        description: "Your profile settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEmailPreferenceChange = (key: string, value: boolean) => {
    setEmailPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed. Please contact support if you need to update your email.
            </p>
          </div>
          
          <div className="space-y-3">
            <Label>Email Preferences</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Marketing emails</p>
                  <p className="text-xs text-muted-foreground">Receive emails about new features and offers</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailPreferences.marketing || false}
                  onChange={(e) => handleEmailPreferenceChange('marketing', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Product updates</p>
                  <p className="text-xs text-muted-foreground">Receive emails about product updates and changes</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailPreferences.product_updates || false}
                  onChange={(e) => handleEmailPreferenceChange('product_updates', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Security alerts</p>
                  <p className="text-xs text-muted-foreground">Receive emails about security updates and login attempts</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailPreferences.security || false}
                  onChange={(e) => handleEmailPreferenceChange('security', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="submit" disabled={loading || !onSave}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
          
          <Button type="button" variant="outline" onClick={() => window.location.href = "/reset-password"}>
            Change Password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

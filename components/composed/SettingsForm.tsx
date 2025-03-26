"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/hooks/use-toast'
import { User } from '@/types/models'

interface SettingsFormProps {
  user: User | null;
  onSave?: (data: { name: string }) => Promise<void>;
  isLoading?: boolean;
}

export function SettingsForm({ user, onSave, isLoading: externalLoading }: SettingsFormProps) {
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const loading = externalLoading || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;
    
    setIsLoading(true);
    
    try {
      await onSave({ name });
      
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
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
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading || !onSave}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.string().min(2, 'Role name must be at least 2 characters'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileComplete() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
      }
    };
    checkAuth();
  }, [router, supabase]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('users_profile')
        .select('id')
        .eq('id', session.user.id)
        .single();

      let error;
      if (!existingProfile) {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('users_profile')
          .insert([{
            id: session.user.id,
            full_name: data.full_name,
            role: data.role,
          }]);
        error = insertError;
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('users_profile')
          .update({
            full_name: data.full_name,
            role: data.role,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);
        error = updateError;
      }

      if (error) {
        console.error('Database operation error:', error);
        throw error;
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="container max-w-lg mx-auto py-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Complete Your Profile</h1>
          <p className="text-muted-foreground text-center">
            Please provide your details to continue
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Faculty." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Complete Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

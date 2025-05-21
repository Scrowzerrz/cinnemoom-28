import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client'; // For direct auth
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ADMIN_REAUTH_TIMESTAMP_KEY = 'adminReAuthTimestamp';
const ADMIN_REAUTH_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes, same as in RotaAdmin

const AdminReAuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth(); // Only session is needed here, signInWithPassword from useAuth might not be suitable if it doesn't allow re-auth or if it logs out first

  // If user is already re-authenticated (e.g., hits back button, or RotaAdmin somehow let them through), redirect them.
  useEffect(() => {
    if (session) { 
      const redirectPath = searchParams.get('redirect') || '/admin';
      const timestamp = sessionStorage.getItem(ADMIN_REAUTH_TIMESTAMP_KEY);
      // Check if timestamp exists and is recent
      if (timestamp && (Date.now() - parseInt(timestamp)) < ADMIN_REAUTH_TIMEOUT_MS) {
        navigate(redirectPath, { replace: true });
      }
    } else {
      // If there's no session at all, something is wrong, send to main login
      navigate('/auth', { replace: true });
    }
  }, [session, navigate, searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    // Email is pre-filled and read-only from session, so we can trust it.
    const email = session?.user?.email; 
    const password = formData.get('password') as string;

    if (!email) { // Should not happen if session exists
      toast.error('User email not found. Please login again.');
      navigate('/auth', { replace: true });
      return;
    }

    if (!password) {
      toast.error('Password is required.');
      return;
    }

    try {
      // Directly use Supabase client for re-authentication with existing session.
      // This is effectively just re-validating the password for the current user.
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // Handle specific errors if needed, e.g., invalid password
        if (error.message === 'Invalid login credentials') {
          toast.error('Incorrect password. Please try again.');
        } else {
          toast.error(error.message || 'Failed to re-authenticate.');
        }
      } else {
        // Successful re-authentication
        sessionStorage.setItem(ADMIN_REAUTH_TIMESTAMP_KEY, Date.now().toString());
        toast.success('Re-authenticated successfully.');
        const redirectPath = searchParams.get('redirect') || '/admin';
        navigate(redirectPath, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred during re-authentication.');
    }
  };
  
  const prefilledEmail = session?.user?.email || '';

  // If email is somehow not available (e.g. session loading, or user not available on session object)
  // show loading or redirect. For simplicity, this example assumes prefilledEmail will be available if session is.
  if (!prefilledEmail && session) {
     // This case might indicate an issue with session data or that session is not fully loaded.
     // A loading indicator or redirecting to '/auth' might be suitable here.
     // For now, we'll let the form render, but the email field will be empty and the submit will fail the !email check.
     // A more robust solution could involve a loading state from useAuth.
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-movieDarkBlue p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-movieDark rounded-lg shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Admin Re-authentication</h1>
          <p className="mt-2 text-movieGray">
            For enhanced security, please re-enter your credentials to continue.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={prefilledEmail} // Use value for controlled component if prefilled
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-movieRed focus:border-movieRed"
              readOnly // Email should be read-only as it's from the active session
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-movieRed focus:border-movieRed"
              autoFocus // Autofocus password field
            />
          </div>
          <div>
            <Button 
              type="submit" 
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-movieRed hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-movieRed"
            >
              Confirm Identity
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminReAuthPage;

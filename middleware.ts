import { type NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const session = await updateSession(request);

  // Get the current path
  const path = request.nextUrl.pathname;

  // Skip profile check for public routes and the profile completion page itself
  if (path.startsWith('/api') ||
      path === '/profile/complete' ||
      path.startsWith('/auth') ||
      path === '/signin') {
    return session;
  }

  try {
    const supabase = createClient();
    const { data: { session: userSession } } = await supabase.auth.getSession();

    if (!userSession?.user) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    // Check access levels for dashboard routes
    if (path.startsWith('/dashboard')) {
      const { data: accessLevel, error: accessError } = await supabase
        .from('access_levels')
        .select()
        .eq('user_id', userSession.user.id)
        .single();

      if (!accessLevel || accessError) {
        // No access level found - redirect to unauthorized page or home
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    if (userSession?.user?.id) {
      // Check if user has completed their profile
      const { data: profile, error } = await supabase
        .from('users_profile')
        .select('id')
        .eq('id', userSession.user.id)
        .single();

      if ((!profile || error) && path !== '/profile/complete') {
        // Redirect to profile completion if profile doesn't exist
        return NextResponse.redirect(new URL('/profile/complete', request.url));
      }
    }
  } catch (error) {
    console.error('[MIDDLEWARE_PROFILE_CHECK]', error);
    // On error, redirect to login for security
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return session;
}

export const config = {
  matcher: [
    '/protected',
    '/signin',
    '/admin/:path*',
    '/dashboard/:path*',
    '/profile/:path*'
  ],
};

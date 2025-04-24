import { createClient } from '@/lib/supabase/server';
import {Card, CardHeader, CardContent, CardTitle} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Menu, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export const dynamic = 'force-dynamic';

type Course = {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'active' | 'inactive';
  banner_url: string | null;
  sub_heading: string | null;
  slug: string;
  thumbnail: string | null;
};

export default async function CourseDashboard() {
  const supabase = createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    redirect('/login');
  }

  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching courses:', error);
    throw new Error('Failed to fetch courses');
  }

  const handleLogout = async () => {
    'use server'
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Mobile Header */}
      <div className="md:hidden border-b p-4 flex items-center justify-between bg-background sticky top-0 z-10">
        <h1 className="text-xl font-bold font-mono">Course Management</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <h1 className="text-xl font-bold font-mono">Course Management</h1>
              </div>
              <ScrollArea className="flex-1 p-4">
                <Button asChild className="w-full" size="sm">
                  <Link href="/dashboard/new" className="flex items-center gap-2">
                    <PlusCircle size={16} />
                    Add New Course
                  </Link>
                </Button>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:flex w-64 border-r bg-background flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold font-mono">Course Management</h1>
        </div>
        <ScrollArea className="flex-1 p-4">
          <Button asChild className="w-full" size="sm">
            <Link href="/dashboard/new" className="flex items-center gap-2">
              <PlusCircle size={16} />
              Add New Course
            </Link>
          </Button>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header - Hidden on mobile */}
        <div className="border-b hidden md:block">
          <div className="flex h-16 items-center px-4 md:px-6 justify-between">
            <h2 className="text-xl md:text-2xl font-bold font-mono">Courses</h2>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <form action={handleLogout}>
                      <button className="flex items-center gap-2 w-full">
                        <LogOut className="h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {(!courses || courses.length === 0) ? (
            <Card className="w-full p-4 md:p-6 text-center">
              <p className="text-muted-foreground mb-4">
                No courses have been created yet.
              </p>
              <Button asChild>
                <Link href="/dashboard/new">Create Your First Course</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {courses.map((course) => (
                <Card key={course.id}>
              <CardHeader className="p-4 md:p-6">
                      {course.thumbnail && (
                        <div className="relative w-full h-40 mb-4">
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-base md:text-lg font-mono">{course.title} 17</h3>
                        <Badge variant={
                          course.status === 'active' ? 'default' :
                          course.status === 'draft' ? 'secondary' : 'destructive'
                        }>
                          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">{course.sub_heading}</p>
                <p className="text-sm text-gray-500 mb-4">Status: {course.status}</p>
                <div className="flex gap-2">
                  <Link href={`/${course.slug}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Link href={`/dashboard/${course.slug}/edit`} className="flex-1">
                    <Button className="w-full">
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

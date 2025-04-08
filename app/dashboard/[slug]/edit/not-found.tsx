import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CourseNotFound() {
  return (
    <div className="container max-w-3xl py-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The course you are looking for does not exist or has been removed.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/new">Create New Course</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

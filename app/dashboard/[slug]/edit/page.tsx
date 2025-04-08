'use client';

import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';

export default function EditCourse({ params }: { params: { slug: string } }) {
  const [course, setCourse] = useState<any>(null);
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('slug', params.slug)
          .single();

        if (error || !data) {
          notFound();
          return;
        }

        setCourse(data);
        setHighlights(data.highlights || ['']);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch course",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [params.slug, toast]);

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };

  const addHighlight = () => {
    setHighlights([...highlights, '']);
  };

  const removeHighlight = (index: number) => {
    const newHighlights = highlights.filter((_, i) => i !== index);
    if (newHighlights.length === 0) {
      setHighlights(['']);
    } else {
      setHighlights(newHighlights);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const formData = new FormData(event.currentTarget);
      const supabase = createClient();

      const updates = {
        title: formData.get('title'),
        description: formData.get('description'),
        sub_heading: formData.get('subHeading'),
        banner_url: formData.get('bannerUrl'),
        thumbnail: formData.get('thumbnailUrl'),
        status: formData.get('status'),
        brochure_url: formData.get('brochureUrl'),
        tag_url: formData.get('tagUrl'),
        highlights: highlights.filter(Boolean),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('courses')
        .update(updates)
        .eq('slug', params.slug);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course updated successfully!",
        variant: "default",
      });
      
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update course';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;
  if (!course) return notFound();

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Course</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => router.push(`/${params.slug}`)}>
            View Course
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Enter course title"
                required
                defaultValue={course.title}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="subHeading" className="text-sm font-medium">
                Sub Heading
              </label>
              <Input
                id="subHeading"
                name="subHeading"
                placeholder="Enter course sub heading"
                defaultValue={course.sub_heading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter course description"
                rows={5}
                defaultValue={course.description}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Highlights
              </label>
              {highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    name="highlights[]"
                    placeholder="Enter highlight"
                    value={highlight}
                    onChange={(e) => handleHighlightChange(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeHighlight(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addHighlight}
                className="w-full"
              >
                Add Highlight
              </Button>
            </div>

            <div className="space-y-2">
              <label htmlFor="bannerUrl" className="text-sm font-medium">
                Banner URL
              </label>
              <Input
                id="bannerUrl"
                name="bannerUrl"
                type="url"
                placeholder="Enter banner image URL"
                defaultValue={course.banner_url}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="thumbnailUrl" className="text-sm font-medium">
                Thumbnail URL
              </label>
              <Input
                id="thumbnailUrl"
                name="thumbnailUrl"
                type="url"
                placeholder="Enter thumbnail image URL"
                defaultValue={course.thumbnail}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="brochureUrl" className="text-sm font-medium">
                Brochure URL
              </label>
              <Input
                id="brochureUrl"
                name="brochureUrl"
                type="url"
                placeholder="Enter brochure URL"
                defaultValue={course.brochure_url}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tagUrl" className="text-sm font-medium">
                Tag URL
              </label>
              <Input
                id="tagUrl"
                name="tagUrl"
                type="url"
                placeholder="Enter tag URL"
                defaultValue={course.tag_url}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select name="status" defaultValue={course.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

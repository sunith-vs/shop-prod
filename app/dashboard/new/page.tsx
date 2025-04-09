'use client';

import { createCourse } from './actions';
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
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const dynamic = 'force-dynamic';

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function NewCourse() {
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
  };

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
      await createCourse(formData);
      toast({
        title: "Success",
        description: "Course created successfully!",
        variant: "default",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create course';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Course</h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
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
                value={title}
                onChange={handleTitleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                Slug
              </label>
              <Input
                id="slug"
                name="slug"
                placeholder="Enter URL slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
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
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select name="status" defaultValue="draft">
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
                {isSubmitting ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

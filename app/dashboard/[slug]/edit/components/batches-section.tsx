'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";

interface Batch {
    id: string;
    name: string;
    type: 'online' | 'offline';
    amount: number;
    eduport_batch_id: number | null;
    course_id: string;
    created_at?: string;
    discount?: number;
    duration?: number;
}

interface EduportBatch {
    id: number;
    title: string;
    order: number;
    has_sub: boolean;
}

interface EduportCourse {
    id: number;
    title: string;
    order: number;
    batches: EduportBatch[];
}

interface EduportClass {
    id: number;
    title: string;
    courses: EduportCourse[];
}

interface EduportResponse {
    classes: EduportClass[];
}

// Zod schema for validation
const batchFormSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, "Name is required"),
    type: z.enum(['online', 'offline'], { required_error: "Type is required" }),
    amount: z.coerce.number().positive("Amount must be positive"),
    eduport_batch_id: z.coerce.number().int().nullable(),
    discount: z.coerce.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%").default(0),
    duration: z.coerce.number().int().positive("Duration must be a positive number")
});

type BatchFormData = z.infer<typeof batchFormSchema>;

interface BatchesSectionProps {
    courseId: string;
}

export function BatchesSection({ courseId }: BatchesSectionProps) {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eduportBatches, setEduportBatches] = useState<EduportBatch[]>([]);
    const [isLoadingEduportBatches, setIsLoadingEduportBatches] = useState(false);
    const [selectedEduportBatchId, setSelectedEduportBatchId] = useState<string>();
    const [eduportCourseId, setEduportCourseId] = useState<number | null>(null);
    const { toast } = useToast();
    const supabase = createClient();

    const form = useForm<BatchFormData>({
        resolver: zodResolver(batchFormSchema),
        defaultValues: {
            name: "",
            type: undefined,
            amount: 0,
            eduport_batch_id: null,
            discount: 0,
            duration: 0,
        }
    });

    // Fetch Eduport course ID
    useEffect(() => {
        const fetchEduportCourseId = async () => {
            const { data, error } = await supabase
                .from('courses')
                .select('eduport_course_id')
                .eq('id', courseId)
                .single();

            if (error) {
                console.error('Error fetching Eduport course ID:', error);
                return;
            }

            setEduportCourseId(data?.eduport_course_id);
        };

        fetchEduportCourseId();
    }, [courseId]);

    // Fetch Eduport batches when course ID is available
    useEffect(() => {
        const fetchEduportBatches = async () => {
            if (!eduportCourseId) {
                setEduportBatches([]);
                return;
            }

            setIsLoadingEduportBatches(true);
            try {
                const response = await fetch(
                    'https://uat.eduport.in/api/v3/courses_list?has_batches=true',
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_EDUPORT}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch Eduport batches');
                }

                const data: EduportResponse = await response.json();
                
                // Find batches for the current course
                const courseBatches: EduportBatch[] = [];
                data.classes.forEach(classItem => {
                    const course = classItem.courses.find(c => c.id === eduportCourseId);
                    if (course) {
                        courseBatches.push(...course.batches);
                    }
                });

                setEduportBatches(courseBatches);
            } catch (error) {
                console.error('Error fetching Eduport batches:', error);
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to fetch Eduport batches",
                    variant: "destructive",
                });
                setEduportBatches([]);
            } finally {
                setIsLoadingEduportBatches(false);
            }
        };

        fetchEduportBatches();
    }, [eduportCourseId, toast]);

    const fetchBatches = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('batches')
            .select('*')
            .eq('course_id', courseId)
            .order('created_at', { ascending: true });

        if (error) {
            toast({ title: "Error fetching batches", description: error.message, variant: "destructive" });
            setBatches([]);
        } else {
            setBatches(data || []);
        }
        setIsLoading(false);
    }, [courseId, supabase, toast]);

    useEffect(() => {
        fetchBatches();
    }, [fetchBatches]);

    // Reset form and state when dialog closes
    useEffect(() => {
        if (!isModalOpen) {
            setEditingBatch(null);
            form.reset({
                name: "",
                type: undefined,
                amount: 0,
                eduport_batch_id: null,
                discount: 0,
                duration: 0,
            });
        }
    }, [isModalOpen, form]);

    const handleEdit = (batch: Batch) => {
        setEditingBatch(batch);
        form.reset({ // Pre-fill form for editing
            id: batch.id,
            name: batch.name,
            type: batch.type,
            amount: batch.amount,
            eduport_batch_id: batch.eduport_batch_id,
            discount: batch.discount || 0,
            duration: batch.duration || 0,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (batchId: string) => {
        if (!confirm('Are you sure you want to delete this batch?')) {
            return;
        }
        setIsSubmitting(true);
        const { error } = await supabase
            .from('batches')
            .delete()
            .eq('id', batchId);

        if (error) {
            toast({ title: "Error deleting batch", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Batch deleted successfully" });
            setBatches(prev => prev.filter(b => b.id !== batchId)); // Update UI immediately
        }
        setIsSubmitting(false);
    };

    const onSubmit = async (values: BatchFormData) => {
        setIsSubmitting(true);
        const batchData = {
            name: values.name,
            type: values.type,
            amount: values.amount,
            eduport_batch_id: values.eduport_batch_id || null, // Ensure null if empty
            course_id: courseId,
            discount: values.discount,
            duration: values.duration,
        };

        let error = null;
        let data: Batch[] | null = null;

        try {
            if (editingBatch) {
                // Update existing batch
                const { data: updateData, error: updateError } = await supabase
                    .from('batches')
                    .update(batchData)
                    .eq('id', editingBatch.id)
                    .select()
                    .single(); // Assuming update returns the single updated record
                error = updateError;
                if (updateData) data = [updateData]; // Wrap in array for consistency
            } else {
                // Insert new batch
                const { data: insertData, error: insertError } = await supabase
                    .from('batches')
                    .insert(batchData)
                    .select();
                error = insertError;
                data = insertData;
            }

            if (error) throw error;

            toast({
                title: "Success",
                description: `Batch ${editingBatch ? 'updated' : 'added'} successfully!`,
            });
            await fetchBatches(); // Re-fetch to ensure UI consistency
            setIsModalOpen(false); // Close dialog on success

        } catch (err: any) {
            toast({
                title: `Error ${editingBatch ? 'updating' : 'adding'} batch`,
                description: err.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex justify-end mb-4">
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => {
                                form.reset();
                                setIsModalOpen(true);
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Batch
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="overflow-visible" onPointerDownOutside={(e) => {
                            // Prevent closing when clicking combobox items
                            const target = e.target as HTMLElement;
                            if (target.closest('[role="listbox"]')) {
                                e.preventDefault();
                            }
                        }}>
                            <DialogHeader>
                                <DialogTitle>{editingBatch ? 'Edit Batch' : 'Add New Batch'}</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Weekend Batch A" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="online">Online</SelectItem>
                                                        <SelectItem value="offline">Offline</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="e.g., 5000.00" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="discount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Discount (%)</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        min="0" 
                                                        max="100" 
                                                        step="0.01" 
                                                        placeholder="e.g., 10.00" 
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="duration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Duration</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        min="1" 
                                                        step="1" 
                                                        placeholder="e.g., 24" 
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <p className="text-sm text-muted-foreground mt-1">Duration in months (e.g., 12 for 1 year, 24 for 2 years)</p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="eduport_batch_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Eduport Batch</FormLabel>
                                                <FormControl>
                                                    {!eduportCourseId ? (
                                                        <div className="text-sm text-red-500">
                                                            Please select an Eduport course in the General Details tab first
                                                        </div>
                                                    ) : isLoadingEduportBatches ? (
                                                        <div className="w-full h-10 bg-muted animate-pulse rounded-md" />
                                                    ) : eduportBatches.length === 0 ? (
                                                        <div className="text-sm text-muted-foreground">
                                                            No batches available for this course
                                                        </div>
                                                    ) : (
                                                        <Select
                                                            value={field.value?.toString()}
                                                            onValueChange={(value) => {
                                                                field.onChange(value ? parseInt(value, 10) : null);
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a batch" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {eduportBatches.map(batch => (
                                                                    <SelectItem 
                                                                        key={batch.id} 
                                                                        value={batch.id.toString()}
                                                                    >
                                                                        {batch.title}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end space-x-2">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => {
                                                form.reset();
                                                setIsModalOpen(false);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit">Submit</Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading ? (
                    <p>Loading batches...</p>
                ) : batches.length === 0 ? (
                     <p className="text-muted-foreground text-center">No batches added yet.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Eduport ID</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batches.map((batch) => (
                                <TableRow key={batch.id}>
                                    <TableCell>{batch.name}</TableCell>
                                    <TableCell>{batch.type}</TableCell>
                                    <TableCell>{batch.amount.toFixed(2)}</TableCell>
                                    <TableCell>{batch.discount ? `${batch.discount}%` : '-'}</TableCell>
                                    <TableCell>{batch.duration ? `${batch.duration} months` : '0 months'}</TableCell>
                                    <TableCell>{batch.eduport_batch_id || '-'}</TableCell>
                                    <TableCell className="space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(batch)} disabled={isSubmitting}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(batch.id)} disabled={isSubmitting}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

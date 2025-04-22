'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from '@/components/ui/card'; // Added Card import

// Define the Batch type based on your schema
export interface Batch {
    id: string;
    name: string;
    type: 'online' | 'offline';
    amount: number;
    eduport_batch_id?: number | null; // Supabase might return number or null
    course_id: string;
    created_at?: string;
}

// Zod schema for validation
const batchFormSchema = z.object({
    id: z.string().uuid().optional(), // Optional for add, required for edit
    name: z.string().min(1, "Name is required"),
    type: z.enum(['online', 'offline'], { required_error: "Type is required" }),
    amount: z.coerce.number().positive("Amount must be positive"),
    eduport_batch_id: z.coerce.number().int().optional().nullable(),
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const supabase = createClient();

    const form = useForm<BatchFormData>({
        resolver: zodResolver(batchFormSchema),
        defaultValues: {
            name: "",
            type: undefined, // Let placeholder show
            amount: 0,
            eduport_batch_id: null,
        },
    });

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
        if (!isDialogOpen) {
            setEditingBatch(null);
            form.reset({
                name: "",
                type: undefined,
                amount: 0,
                eduport_batch_id: null,
            });
        }
    }, [isDialogOpen, form]);

    const handleDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
    };

    const handleEdit = (batch: Batch) => {
        setEditingBatch(batch);
        form.reset({ // Pre-fill form for editing
            id: batch.id,
            name: batch.name,
            type: batch.type,
            amount: batch.amount,
            eduport_batch_id: batch.eduport_batch_id,
        });
        setIsDialogOpen(true);
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
            setIsDialogOpen(false); // Close dialog on success

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
            <CardContent className="pt-6"> {/* Added padding top */}
                <div className="flex justify-end mb-4">
                    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" /> Add Batch
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
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
                                        name="eduport_batch_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Eduport Batch ID (Optional)</FormLabel>
                                                <FormControl>
                                                    {/* Render Input, ensuring value is handled correctly for null/undefined */}
                                                    <Input
                                                        type="number"
                                                        placeholder="Enter Eduport ID"
                                                        {...field}
                                                        value={field.value ?? ''} // Display empty string if null/undefined
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            // Update field with number or null
                                                            field.onChange(value === '' ? null : parseInt(value, 10));
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : (editingBatch ? 'Update Batch' : 'Add Batch')}
                                    </Button>
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

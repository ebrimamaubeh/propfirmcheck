'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/firebase';
import { useFirestore } from '@/firebase';
import { doc, setDoc, addDoc, collection, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { PropFirm } from '@/lib/types';
import { useLoading } from '@/context/loading-context';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ruleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

const firmSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  type: z.enum(['Futures', 'Forex']),
  review: z.object({
    rating: z.coerce.number().min(0).max(5),
    count: z.coerce.number().min(0),
  }),
  yearsInBusiness: z.coerce.number().min(0),
  maxAllocation: z.coerce.number().min(0),
  platform: z.string().min(1, "At least one platform is required"),
  referralLink: z.string().url("Must be a valid URL"),
  promoCode: z.string(),
  rules: z.array(ruleSchema).min(1, "At least one rule is required"),
});

type FirmFormData = z.infer<typeof firmSchema>;

function EditFirmForm() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const firmId = searchParams.get('id');
  const isNewFirm = !firmId;

  const firestore = useFirestore();
  const { toast } = useToast();
  const { setIsLoading } = useLoading();

  const form = useForm<FirmFormData>({
    resolver: zodResolver(firmSchema),
    defaultValues: {
      id: '',
      name: '',
      type: 'Futures',
      review: { rating: 0, count: 0 },
      yearsInBusiness: 0,
      maxAllocation: 0,
      platform: '',
      referralLink: '',
      promoCode: '',
      rules: [{ title: '', description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rules",
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/admin/login');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    async function fetchFirm() {
      if (firestore && firmId) {
        setIsLoading(true);
        try {
          const docRef = doc(firestore, 'prop_firms', firmId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const firmData = docSnap.data() as PropFirm;
            // The form expects a string for platforms, so we join the array.
            form.reset({
              ...firmData,
              platform: firmData.platform.join(', '),
            });
          } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Firm not found.' });
            router.push('/admin/dashboard');
          }
        } catch (error) {
          console.error("Error fetching firm: ", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch firm data.' });
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchFirm();
  }, [firestore, firmId, setIsLoading, form, toast, router]);

  const onSubmit = async (data: FirmFormData) => {
    if (!firestore) return;

    setIsLoading(true);
    try {
      const firmDataToSave = {
        ...data,
        // Convert the comma-separated platform string back to an array
        platform: data.platform.split(',').map(p => p.trim()),
      };

      const docRef = doc(firestore, 'prop_firms', data.id);
      await setDoc(docRef, firmDataToSave, { merge: !isNewFirm });

      toast({ title: 'Success', description: `Prop firm ${isNewFirm ? 'created' : 'updated'} successfully.` });
      router.push('/admin/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to save prop firm: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isNewFirm ? 'Create New Prop Firm' : 'Edit Prop Firm'}</CardTitle>
        <CardDescription>Fill out the form below to save the prop firm.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firm Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Topstep" {...field} onChange={(e) => {
                          field.onChange(e);
                          if(isNewFirm) {
                              form.setValue('id', e.target.value.toLowerCase().replace(/\s+/g, '-'))
                          }
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firm ID</FormLabel>
                    <FormControl>
                      <Input placeholder="topstep" {...field} disabled={!isNewFirm} />
                    </FormControl>
                     <FormDescription>This will be used in the URL and cannot be changed.</FormDescription>
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
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Futures">Futures</SelectItem>
                          <SelectItem value="Forex">Forex</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="yearsInBusiness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years In Business</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxAllocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Allocation</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="150000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="review.rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="4.7" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="review.count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Count</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platforms</FormLabel>
                    <FormControl>
                      <Input placeholder="Tradovate, TradingView" {...field} />
                    </FormControl>
                    <FormDescription>Comma-separated list of platforms.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="referralLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.topstep.com/" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="promoCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promo Code</FormLabel>
                  <FormControl>
                    <Input placeholder="CHECK" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Rules</FormLabel>
              <FormDescription className="mb-4">Add the evaluation rules for this firm.</FormDescription>
              <div className="space-y-4">
              {fields.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-end p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                  <FormField
                    control={form.control}
                    name={`rules.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rule Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Profit Target" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`rules.${index}.description`}
                    render={({ field }) => (
                       <FormItem>
                        <FormLabel>Rule Description</FormLabel>
                        <FormControl>
                           <Textarea placeholder="Reach a 6% profit target." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', description: '' })} className="mt-4">
                Add Rule
              </Button>
            </div>


            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Firm'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function EditFirmPage() {
  return (
    <Suspense fallback={null}>
      <EditFirmForm />
    </Suspense>
  );
}

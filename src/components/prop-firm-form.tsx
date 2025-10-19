'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';

const ruleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

const propFirmSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  type: z.enum(['Futures', 'Forex']),
  review: z.object({
    rating: z.coerce.number().min(0).max(5),
    count: z.coerce.number().min(0),
  }),
  yearsInBusiness: z.coerce.number().min(0),
  maxAllocation: z.coerce.number().min(1),
  platform: z.string().min(1, "Platform is required").transform(val => val.split(',').map(s => s.trim())),
  referralLink: z.string().url('Must be a valid URL.'),
  promoCode: z.string().min(1, 'Promo code is required.'),
  rules: z.array(ruleSchema).min(1, 'At least one rule is required.'),
});

type PropFirmFormValues = z.infer<typeof propFirmSchema>;

interface PropFirmFormProps {
  onSubmit: (data: PropFirmFormValues) => void;
}

export default function PropFirmForm({ onSubmit }: PropFirmFormProps) {
  const form = useForm<PropFirmFormValues>({
    resolver: zodResolver(propFirmSchema),
    defaultValues: {
      name: '',
      type: 'Futures',
      review: { rating: 0, count: 0 },
      yearsInBusiness: 0,
      maxAllocation: 10000,
      platform: [],
      referralLink: '',
      promoCode: '',
      rules: [{ title: '', description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rules',
  });
  
  const handleFormSubmit = (data: PropFirmFormValues) => {
    onSubmit(data);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Firm Name</FormLabel>
                <FormControl>
                    <Input placeholder="Topstep" {...field} />
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
                <FormLabel>Firm Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a firm type" />
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="yearsInBusiness"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Years in Business</FormLabel>
                <FormControl>
                    <Input type="number" {...field} />
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
                    <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
                control={form.control}
                name="review.rating"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Review Rating</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.1" {...field} />
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
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Trading Platforms</FormLabel>
                <FormControl>
                    <Input placeholder="Tradovate, NinjaTrader" {...field} onChange={e => field.onChange(e.target.value)} />
                </FormControl>
                <FormDescription>
                    Enter platform names separated by commas.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />

        <FormField
          control={form.control}
          name="referralLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referral Link</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
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
                <Input placeholder="PROMO25" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Evaluation Rules</FormLabel>
          <div className="space-y-4 mt-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <FormField
                    control={form.control}
                    name={`rules.${index}.title`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Rule Title</FormLabel>
                        <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ title: '', description: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </div>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add Prop Firm"}
        </Button>
      </form>
    </Form>
  );
}

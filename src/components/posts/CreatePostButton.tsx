import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required'),
  image: z.instanceof(FileList).optional(),
  location: z.string().optional(),
  isStory: z.boolean().default(false),
  visibilityType: z.enum(['public', 'followers', 'private']).default('public')
});

type CreatePostFormValues = z.infer<typeof createPostSchema>;

export default function CreatePostButton({ className = '' }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  
  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: '',
      isStory: false,
      visibilityType: 'public'
    }
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };
  
  const onSubmit = async (values: CreatePostFormValues) => {
    if (!user) {
      toast({
        title: 'Restricted action',
        description: 'You need to be logged in to create a post',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    // Simulate post creation (no backend interaction)
    setTimeout(() => {
      form.reset();
      setImagePreview(null);
      setOpen(false);
      toast({
        title: 'Success!',
        description: 'Your post was created (demo only)'
      });
      setIsSubmitting(false);
    }, 900);
  };
  
  if (!user) {
    return (
      <Button className={className} onClick={() => setLocation('/auth/login')}>
        Sign in to share
      </Button>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>Create Post</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Post</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What would you like to share?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your message here..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Add Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        onChange(e.target.files);
                        handleImageChange(e);
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  
                  {imagePreview && (
                    <div className="mt-2 rounded-md overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-[200px] w-auto mx-auto object-cover"
                      />
                    </div>
                  )}
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: New York, NY"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="visibilityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who can see</FormLabel>
                  <FormControl>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      {...field}
                    >
                      <option value="public">Everyone</option>
                      <option value="followers">Followers only</option>
                      <option value="private">Only me</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary text-white"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
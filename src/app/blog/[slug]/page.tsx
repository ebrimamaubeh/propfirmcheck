
import type { Metadata } from 'next';
import { Suspense } from 'react';
import BlogPostDetails from '@/components/blog-post-details';


// This file is now a Server Component that renders a Client Component.
// This allows us to use `generateMetadata` which can only be exported from a server component.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${title} | Prop Firm Check Blog`,
    description: `Read the article: ${title}.`,
     alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}


export default function BlogPostPage() {
    return (
        <Suspense fallback={null}>
            <BlogPostDetails />
        </Suspense>
    );
}

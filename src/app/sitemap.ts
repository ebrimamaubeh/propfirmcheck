import { MetadataRoute } from 'next'
import { collection, getDocs, query } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase'; // Assuming this can be run in a server context
import type { PropFirm, BlogPost } from '@/lib/types';

// IMPORTANT: Replace with your actual domain
const URL = 'https://your-domain.com';

// This function needs to run in an environment where Firebase can be initialized.
// For App Hosting, server-side environments should have the necessary config.
async function getFirestoreInstance() {
    try {
        const { firestore } = initializeFirebase();
        return firestore;
    } catch (e) {
        console.error("Could not initialize Firebase for sitemap generation:", e);
        return null;
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const firestore = await getFirestoreInstance();
  if (!firestore) {
    // Return a minimal sitemap if firestore is not available
    return [
        { url: URL, lastModified: new Date() },
        { url: `${URL}/about`, lastModified: new Date() },
        { url: `${URL}/contact`, lastModified: new Date() },
        { url: `${URL}/blog`, lastModified: new Date() },
    ];
  }

  const firmsSnapshot = await getDocs(query(collection(firestore, 'prop_firms')));
  const firms = firmsSnapshot.docs.map(doc => doc.data() as PropFirm);

  const firmUrls = firms.map(firm => ({
    url: `${URL}/firm/${firm.id}`,
    lastModified: new Date(), // Ideally, you'd have a timestamp in your data
  }));

  const postsSnapshot = await getDocs(query(collection(firestore, 'blogPosts')));
  const posts = postsSnapshot.docs.map(doc => doc.data() as BlogPost);

  const postUrls = posts.map(post => ({
    url: `${URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ? post.updatedAt.toDate() : new Date(),
  }));

  const staticUrls = [
    { url: URL, lastModified: new Date() },
    { url: `${URL}/about`, lastModified: new Date() },
    { url: `${URL}/contact`, lastModified: new Date() },
    { url: `${URL}/blog`, lastModified: new Date() },
    { url: `${URL}/disclaimer`, lastModified: new Date() },
    { url: `${URL}/terms`, lastModified: new Date() },
  ];

  return [...staticUrls, ...firmUrls, ...postUrls];
}

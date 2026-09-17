import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export const getPosts = async () => (await getCollection('posts')).sort((a, b) => +b.data.date - +a.data.date);

export const minutesToRead = (post: Post) => Math.max(1, Math.round((post.body ?? '').split(/\s+/).length / 220));

export const formatDate = (date: Date, month: 'short' | 'long' = 'short') =>
  new Intl.DateTimeFormat('en', { year: 'numeric', month, day: 'numeric', timeZone: 'UTC' }).format(date);

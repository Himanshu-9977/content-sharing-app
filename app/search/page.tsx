"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { Post } from '@/types';

export default function Search() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const query = searchParams.get('q');

  useEffect(() => {
    if (query) {
      searchPosts(query);
    }
  }, [query]);

  const searchPosts = async (searchQuery: string) => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID as string,
        [Query.search('content', searchQuery), Query.limit(20)]
      );
      setSearchResults(response.documents as Post[]);
    } catch (error) {
      console.error('Search posts error:', error);
      toast({
        title: "Error searching posts",
        description: "An error occurred while searching for posts. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Search Results</h1>
        <SearchBar />
        <div className="mt-8 space-y-4">
          {searchResults.map((post) => (
            <Card key={post.$id}>
              <CardHeader>
                <CardTitle>{post.userName}</CardTitle>
                <CardDescription>{new Date(post.createdAt).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{post.content}</p>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  {post.isPublic ? 'Public' : 'Private'}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
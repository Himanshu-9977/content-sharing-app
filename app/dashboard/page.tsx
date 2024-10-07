"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases, POSTS_COLLECTION_ID } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { CommentSection } from '@/components/CommentSection';
import { Pagination } from '@/components/Pagination';
import { Post, User } from '@/types';

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    checkSession();
    fetchPosts();
  }, []);

  const checkSession = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
      console.error('Session error:', error);
      router.push('/login');
    }
  };

  const fetchPosts = async (page: number = 1) => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
        POSTS_COLLECTION_ID,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(ITEMS_PER_PAGE),
          Query.offset((page - 1) * ITEMS_PER_PAGE)
        ]
      );
      setPosts(response.documents as Post[]);
      setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
      setCurrentPage(page);
    } catch (error) {
      console.error('Fetch posts error:', error);
      toast({
        title: "Error fetching posts",
        description: "An error occurred while fetching posts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddPost = async () => {
    if (!newPost.trim() || !user) return;

    try {
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
        POSTS_COLLECTION_ID,
        ID.unique(),
        {
          content: newPost,
          userId: user.$id,
          userName: user.name,
          isPublic: true,
        }
      );
      setNewPost('');
      fetchPosts();
      toast({
        title: "Post added",
        description: "Your post has been added successfully.",
      });
    } catch (error) {
      console.error('Add post error:', error);
      toast({
        title: "Error adding post",
        description: "An error occurred while adding your post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="mb-8">
          <Input
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="mb-2"
          />
          <Button onClick={handleAddPost}>Post</Button>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Posts</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.$id} className="bg-card p-4 rounded-lg shadow">
                <p className="font-semibold">{post.userName}</p>
                <p>{post.content}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.$createdAt).toLocaleString()}
                </p>
                {user && <CommentSection postId={post.$id} currentUser={user} />}
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
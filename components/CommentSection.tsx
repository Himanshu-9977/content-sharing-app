"use client"

import { useState, useEffect } from 'react';
import { databases, COMMENTS_COLLECTION_ID } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Comment, User } from '@/types';

interface CommentSectionProps {
  postId: string;
  currentUser: User;
}

export function CommentSection({ postId, currentUser }: CommentSectionProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
        COMMENTS_COLLECTION_ID,
        [Query.equal('postId', postId), Query.orderDesc('$createdAt')]
      );
      setComments(response.documents as Comment[]);
    } catch (error) {
      console.error('Fetch comments error:', error);
      toast({
        title: "Error fetching comments",
        description: "An error occurred while fetching comments. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
        COMMENTS_COLLECTION_ID,
        ID.unique(),
        {
          postId,
          userId: currentUser.$id,
          userName: currentUser.name,
          content: newComment,
          createdAt: new Date().toISOString(),
        }
      );
      setNewComment('');
      fetchComments();
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    } catch (error) {
      console.error('Add comment error:', error);
      toast({
        title: "Error adding comment",
        description: "An error occurred while adding your comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      <div className="space-y-2 mb-4">
        {comments.map((comment) => (
          <div key={comment.$id} className="bg-secondary p-2 rounded">
            <p className="font-semibold">{comment.userName}</p>
            <p>{comment.content}</p>
            <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <Button onClick={handleAddComment}>Comment</Button>
      </div>
    </div>
  );
}
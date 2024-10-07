"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account, storage } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';

export default function Profile() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await account.get();
        setUser(session);
        setName(session.name);
        if (session.prefs.avatarId) {
          const url = storage.getFileView(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID as string, session.prefs.avatarId);
          setAvatarUrl(url.href);
        }
      } catch (error) {
        console.error('Session error:', error);
        router.push('/login');
      }
    };

    checkSession();
  }, [router]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      await account.updateName(name);

      if (avatar) {
        const file = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID as string,
          ID.unique(),
          avatar
        );
        await account.updatePrefs({ avatarId: file.$id });
        setAvatarUrl(storage.getFileView(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID as string, file.$id).href);
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Update profile error:', error);
      toast({
        title: "Update failed",
        description: "An error occurred while updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        <div className="space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
          />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <Button onClick={handleUpdateProfile}>Update Profile</Button>
        </div>
      </div>
    </div>
  );
}
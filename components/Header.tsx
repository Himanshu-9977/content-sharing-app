"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { account } from '@/lib/appwrite';
import { SearchBar } from '@/components/SearchBar';

export function Header() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      router.push('/login');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-primary text-primary-foreground">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/dashboard" className="text-2xl font-bold">
          Content Share
        </Link>
        <SearchBar />
        <div className="space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href="/groups">
            <Button variant="ghost">Groups</Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost">Profile</Button>
          </Link>
          <Button variant="secondary" onClick={handleLogout}>Logout</Button>
        </div>
      </nav>
    </header>
  );
}
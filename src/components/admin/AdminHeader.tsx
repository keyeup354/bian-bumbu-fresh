import { LogOut, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

interface AdminHeaderProps {
  user: User;
  onSignOut: () => void;
}

const AdminHeader = ({ user, onSignOut }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xl">🌿</span>
            </div>
            <span className="font-display text-xl font-bold text-primary">Admin Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Store className="w-4 h-4 mr-2" />
                Kembali ke Toko
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={onSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

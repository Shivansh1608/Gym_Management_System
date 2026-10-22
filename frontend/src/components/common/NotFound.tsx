import React from 'react';
import { Compass, Home } from 'lucide-react';
import { Button } from '../ui/button';

export const NotFound: React.FC<{ onHome?: () => void }> = ({ onHome }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-6 shadow-xl shadow-primary/10">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>
      <h1 className="font-display font-bold text-4xl mb-2 text-foreground">404 - Page Not Found</h1>
      <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
        The destination you are looking for does not exist or has been relocated to another workspace.
      </p>
      <Button
        onClick={onHome || (() => (window.location.href = '/'))}
        className="rounded-xl px-6 font-semibold shadow-md gap-2"
      >
        <Home className="w-4 h-4" />
        Return to Dashboard
      </Button>
    </div>
  );
};

export const Forbidden: React.FC<{ onHome?: () => void }> = ({ onHome }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mb-6 shadow-xl shadow-destructive/10">
        <span className="font-display font-black text-3xl">403</span>
      </div>
      <h1 className="font-display font-bold text-4xl mb-2 text-foreground">Access Restricted</h1>
      <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
        You do not possess the required security privileges or role classification to view this module.
      </p>
      <Button
        onClick={onHome || (() => (window.location.href = '/'))}
        className="rounded-xl px-6 font-semibold shadow-md gap-2"
      >
        <Home className="w-4 h-4" />
        Back to Safety
      </Button>
    </div>
  );
};

export default NotFound;

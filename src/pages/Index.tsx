import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/SessionContextProvider"; // Import useSession
import { supabase } from "@/integrations/supabase/client"; // Import supabase client
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, isLoading } = useSession(); // Get user and loading state from session context

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">NLP Sentiment Analysis App</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Build forms with sentiment analysis capabilities.
        </p>
        {user ? (
          <div className="space-y-4">
            <p className="text-lg">Welcome, {user.email}!</p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
              <Link to="/form-definition-builder">
                <Button className="px-6 py-3 text-lg">Define New Form</Button>
              </Link>
              <Link to="/form-builder">
                <Button variant="outline" className="px-6 py-3 text-lg">Fill Out a Form</Button>
              </Link>
              <Link to="/saved-forms">
                <Button variant="secondary" className="px-6 py-3 text-lg">View Saved Forms</Button>
              </Link>
            </div>
            <Button variant="destructive" onClick={handleLogout} className="mt-4 px-6 py-3 text-lg">
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg text-red-500">You are not logged in.</p>
            <Link to="/login">
              <Button className="px-6 py-3 text-lg">Go to Login</Button>
            </Link>
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">NLP Sentiment Analysis App</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Build forms with sentiment analysis capabilities.
        </p>
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
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;
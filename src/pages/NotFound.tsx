import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import PrivateVoteCountPage from "./PrivateVoteCountPage";

const NotFound = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isPanacheDorPrivateCount =
    pathname.includes("/panache-expo/panache-dor/nominees/") &&
    pathname.endsWith("/vote-count");

  const isPanache360PrivateCount =
    pathname.includes("/panache-expo/panache-360/nominees/") &&
    pathname.endsWith("/vote-count");

  useEffect(() => {
    if (!isPanacheDorPrivateCount && !isPanache360PrivateCount) {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        pathname
      );
    }
  }, [isPanacheDorPrivateCount, isPanache360PrivateCount, pathname]);

  if (isPanacheDorPrivateCount) {
    return (
      <PrivateVoteCountPage
        title="Panache D’or"
        label="nominee"
        backTo="/panache-expo/panache-dor"
        rpcName="public_verify_panache_dor_contestant_password"
      />
    );
  }

  if (isPanache360PrivateCount) {
    return (
      <PrivateVoteCountPage
        title="Panache 360"
        label="contestant"
        backTo="/panache-expo/panache-360"
        rpcName="public_verify_panache_360_contestant_password"
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

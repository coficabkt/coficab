"use client";

import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import LogoLoader from "../../components/LogoLoader";
import "react-toastify/dist/ReactToastify.css";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loader for 1-2s to display the LogoLoader
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <LogoLoader />
      ) : (
        <>
          {children}
          <ToastContainer position="bottom-right" autoClose={3000} />
        </>
      )}
    </>
  );
}

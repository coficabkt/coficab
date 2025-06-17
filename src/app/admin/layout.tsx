
import { cookies } from "next/headers";
import { Suspense } from "react";
import LogoLoader from "../components/LogoLoader";
import Footer from "../components/Footer";
import { FaFileAlt, FaExchangeAlt, FaSignOutAlt } from "react-icons/fa";
import Image from "next/image";


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const isLoggedIn =
    cookieStore.get("admin-password")?.value === adminPassword;

  if (!isLoggedIn) {
   
    return <>{children }</>;
  }

  return (

    <>
    
      <div className="flex min-h-screen">
        <aside className="w-16 lg:w-64 bg-[#020495] text-white flex flex-col items-center lg:items-start p-4 space-y-4">
            <Image src="/logosvgnewwhite.svg" alt="logo coficab" width={200} height={50} />
          <h1 className="hidden lg:block text-xl font-bold mb-4"> admin</h1>
          <nav className="flex flex-col items-center lg:items-start space-y-4 w-full">
            <a
              href="/admin/demande-attestation"
              className="flex flex-col lg:flex-row items-center gap-2 hover:text-blue-400 transition"
            >
              <FaFileAlt className="text-lg" />
              <span className="hidden lg:inline">HR documents administratifs</span>
            </a>
            <a
              href="/admin/demande-changement"
              className="flex flex-col lg:flex-row items-center gap-2 hover:text-blue-400 transition"
            >
              <FaExchangeAlt className="text-lg" />
              <span className="hidden lg:inline">Changement stations transport</span>
            </a>
            <form action="/api/logout" method="POST" className="w-full">
              <button
                type="submit"
                className="flex flex-col lg:flex-row items-center gap-2 text-red-400 hover:text-red-500 transition w-full text-center lg:text-left"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </form>
          </nav>
        </aside>
        <main className="flex-1 p-4 bg-gray-50">
          <Suspense fallback={<LogoLoader />}>{children}</Suspense>
        </main>
      </div>
      <Footer />
    </>
  );
}

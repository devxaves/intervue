import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between py-4 px-2">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="InterVue Logo"
            className="w-10 h-10 bg-white rounded shadow-lg"
            width={40}
            height={40}
          />
          <h2 className="text-3xl font-extrabold text-primary-100 drop-shadow-lg tracking-tight">
            InterVue
          </h2>
        </Link>
        <div className="flex items-center gap-4 ml-auto">
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 text-white text-xl font-bold px-5 py-2 rounded-full transition-all duration-150 bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg hover:scale-105 border-2 border-blue-300"
            style={{ minWidth: 150, justifyContent: "center" }}
          >
            <Image
              src="/star.svg"
              alt="Leaderboard"
              width={32}
              height={32}
              className="mr-2"
            />
            Leaderboard
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-2 text-white text-xl font-bold px-5 py-2 rounded-full transition-all duration-150 bg-gradient-to-r from-green-500 to-teal-500 shadow-lg hover:scale-105 border-2 border-green-300"
            style={{ minWidth: 150, justifyContent: "center" }}
          >
            <Image
              src="/user-avatar.png"
              alt="Profile"
              width={32}
              height={32}
              className="mr-2 rounded-full border-2 border-white"
            />
            Profile
          </Link>
        </div>
      </nav>

      {children}
    </div>
  );
};

export default Layout;

/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Profile section layout component with sidebar navigation for user settings and preferences
 */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Key, User, Settings, Bell, FileCode, Box, Eye } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const profileLinks = [
  {
    name: "General",
    href: "/profile",
    icon: User,
  },
  {
    name: "API Settings",
    href: "/profile/api-settings",
    icon: Key,
  },
  {
    name: "Preferences",
    href: "/profile/preferences",
    icon: Settings,
  },
  {
    name: "Notifications",
    href: "/profile/notifications",
    icon: Bell,
  },
  {
    name: "My Models",
    href: "/profile/models",
    icon: FileCode,
  },
  {
    name: "Usage",
    href: "/profile/usage",
    icon: Box,
  },
  {
    name: "Privacy",
    href: "/profile/privacy",
    icon: Eye,
  },
];

/**
 * @constructor
 */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(true);

  /** @constructs */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background/95 to-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-matrix-primary via-matrix-secondary to-matrix-tertiary text-transparent bg-clip-text">
            User Profile
          </h1>
          <p className="text-foreground/70">
            Customise your ModelViz experience and manage your settings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="p-4 rounded-lg border border-matrix-primary/20 bg-card/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)]">
              {profileLinks.map((link) => {
                const isActive = pathname === link.href;
                const LinkIcon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                      isActive
                        ? "bg-matrix-primary/20 text-matrix-primary border border-matrix-primary/50"
                        : "text-foreground/80 hover:text-matrix-primary hover:bg-matrix-primary/10"
                    }`}
                  >
                    <LinkIcon className={`w-5 h-5 ${isActive ? "text-matrix-primary" : "text-foreground/70"}`} />
                    <span>{link.name}</span>
                    {link.name === "API Settings" && (
                      <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-matrix-primary/20 text-matrix-primary">
                        New
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[70vh]"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

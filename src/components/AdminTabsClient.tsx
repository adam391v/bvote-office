"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  href: string;
  label: string;
  icon: string;
}

export default function AdminTabsClient({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    <div className="admin-tabs">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/dashboard/admin"
            ? pathname === "/dashboard/admin"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`admin-tab ${isActive ? "active" : ""}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

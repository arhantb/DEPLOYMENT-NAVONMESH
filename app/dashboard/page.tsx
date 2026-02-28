// import { PuneDashboard } from "@/components/pune_dashboard/pune-dashboard";
// import { Sidebar, SidebarBody } from "@/components/ui/sidebar";

// export default function DashboardPage() {
//   return (
//     <Sidebar>
//       <div className="flex h-screen w-full">
//         <SidebarBody className="border-r border-neutral-200 dark:border-neutral-800">
//           {/* Sidebar content to be added later */}
//         </SidebarBody>

//         <main className="min-w-0 flex-1 overflow-y-auto">
//           <PuneDashboard />
//         </main>
//       </div>
//     </Sidebar>
//   );
// }
"use client";

import { PuneDashboard } from "@/components/pune_dashboard/pune-dashboard";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconAlertTriangle,
  IconNetwork,
  IconDeviceDesktopAnalytics,
} from "@tabler/icons-react";

const navLinks = [
  {
    label: "Incident Detection",
    href: "/incident-detection",
    icon: (
      <IconAlertTriangle className="text-slate-600 group-hover/sidebar:text-green-700 h-5 w-5 shrink-0 transition-colors duration-150" />
    ),
  },
  {
    label: "Events Orchestration",
    href: "/events-orchestration",
    icon: (
      <IconNetwork className="text-slate-600 group-hover/sidebar:text-green-700 h-5 w-5 shrink-0 transition-colors duration-150" />
    ),
  },
  {
    label: "ATCS",
    href: "/atcs",
    icon: (
      <IconDeviceDesktopAnalytics className="text-slate-600 group-hover/sidebar:text-green-700 h-5 w-5 shrink-0 transition-colors duration-150" />
    ),
  },
];

export default function DashboardPage() {
  return (
    <Sidebar>
      <div className="flex h-screen w-full">
        <SidebarBody className="border-r border-slate-200">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo */}
            <div className="mb-6 mt-2 flex items-center gap-2 px-2">
              <span className="text-xl font-black text-green-600">Tram</span>
              <span className="text-xl font-black text-slate-900">AI</span>
            </div>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <SidebarLink key={link.href} link={link} />
              ))}
            </div>
          </div>
        </SidebarBody>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <PuneDashboard />
        </main>
      </div>
    </Sidebar>
  );
}

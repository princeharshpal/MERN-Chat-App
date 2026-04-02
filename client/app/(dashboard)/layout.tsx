"use client";

import {
  Tooltip,
  Avatar,
  Spinner,
  Dropdown,
  Link as HeroUILink,
} from "@heroui/react";
import React, { useEffect } from "react";
import { BsChatLeftTextFill } from "react-icons/bs";
import { RiDonutChartFill } from "react-icons/ri";
import { IoSettingsOutline } from "react-icons/io5";
import { FiUsers, FiLogOut } from "react-icons/fi";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setAuth, logoutSuccess } from "@/src/store/slices/authSlice";
import { getMe, logout } from "@/src/services/auth.service";
import { getAvatarUrl } from "@/src/utils/avatar";

const SidebarItem = ({
  icon,
  href,
  title,
  isActive,
}: {
  icon: React.ReactNode;
  href: string;
  title: string;
  isActive: boolean;
}) => (
  <Tooltip delay={0} closeDelay={0}>
    <HeroUILink
      href={href}
      className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl border-none transition-all duration-200 ${
        isActive
          ? "text-primary bg-default-100"
          : "text-default-500 hover:bg-default-100"
      }`}
    >
      {icon}
    </HeroUILink>
    <Tooltip.Content placement="right">{title}</Tooltip.Content>
  </Tooltip>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isCheckingAuth } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    const authenticate = async () => {
      try {
        const data = await getMe();
        dispatch(setAuth(data));
      } catch (error) {
        dispatch(setAuth(null));
        router.replace("/login");
      }
    };
    authenticate();
  }, [dispatch, router]);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const topNavItems = [
    {
      title: "Chats",
      href: "/",
      icon: <BsChatLeftTextFill className="text-xl" />,
    },
    {
      title: "Status",
      href: "/status",
      icon: <RiDonutChartFill className="text-2xl" />,
    },
    {
      title: "Friends",
      href: "/friends",
      icon: <FiUsers className="text-2xl" />,
    },
  ];

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background space-y-8 animate-in fade-in duration-700">
        <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 animate-pulse relative">
          <span className="text-white font-bold text-3xl">N</span>
          <div className="absolute inset-0 rounded-3xl border-2 border-primary animate-ping opacity-20"></div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <Spinner size="md" color="accent" />
          <p className="text-[12px] font-bold uppercase tracking-[0.4em] text-primary animate-pulse">
            Authenticating Neural Link
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      <aside className="w-16 border-r border-default-100 flex flex-col items-center py-4 bg-content1/30 backdrop-blur-md justify-between z-50">
        <div className="flex flex-col gap-4">
          {topNavItems.map((item) => (
            <SidebarItem
              key={item.href}
              {...item}
              isActive={pathname === item.href}
            />
          ))}
        </div>

        <div className="flex flex-col gap-4 items-center">
          <Tooltip delay={0} closeDelay={0}>
            <HeroUILink
              href="/settings"
              className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl border-none transition-all duration-200 ${
                pathname === "/settings"
                  ? "text-primary bg-default-100"
                  : "text-default-500 hover:bg-default-100"
              }`}
            >
              <IoSettingsOutline className="text-2xl" />
            </HeroUILink>
            <Tooltip.Content placement="right">Settings</Tooltip.Content>
          </Tooltip>

          <Dropdown>
            <Dropdown.Trigger>
              <Avatar
                size="sm"
                className="cursor-pointer hover:scale-110 transition-transform"
              >
                <Avatar.Image
                  src={getAvatarUrl(user?.profilePic, user?.fullName)}
                />
                <Avatar.Fallback>{user?.fullName?.[0]}</Avatar.Fallback>
              </Avatar>
            </Dropdown.Trigger>
            <Dropdown.Popover
              placement="right"
              offset={15}
              className="bg-content1/80 backdrop-blur-xl border border-default-100 shadow-2xl p-1"
            >
              <Dropdown.Menu
                aria-label="User Actions"
                className="w-64"
                onAction={(key) => {
                  if (key === "logout") handleLogout();
                  if (key === "settings") router.push("/settings");
                }}
              >
                <Dropdown.Item
                  id="profile"
                  className="opacity-100 cursor-default py-3 px-2 border-b border-default-100 mb-1"
                  textValue="User Profile"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                      Network Active
                    </p>
                    <p className="font-bold text-base text-foreground truncate">
                      {user?.fullName || "Guest User"}
                    </p>
                    <p className="text-[11px] text-default-400 truncate">
                      {user?.email || "No email provided"}
                    </p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item
                  id="settings"
                  className="rounded-lg py-2.5"
                  textValue="Settings"
                >
                  Account Settings
                </Dropdown.Item>
                <Dropdown.Item
                  id="logout"
                  className="text-danger rounded-lg hover:bg-danger/10"
                  textValue="Logout"
                >
                  <div className="flex items-center gap-2">
                    <FiLogOut className="text-lg" />
                    <span>Log Out</span>
                  </div>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </aside>

      <main className="flex-1 flex overflow-hidden">{children}</main>
    </div>
  );
};

export default Layout;

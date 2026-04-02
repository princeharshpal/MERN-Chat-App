"use client";

import React, { useState } from "react";
import { Tabs, Card, Input, Button, Link } from "@heroui/react";
import { useRouter } from "next/navigation";
import { login, signup } from "@/src/services/auth.service";
import { useAppDispatch } from "@/src/store/hooks";
import { setAuth } from "@/src/store/slices/authSlice";
import toast from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    fullName: "",
  });

  const handleAuth = async (isLogin: boolean) => {
    try {
      const data = isLogin ? await login(formData) : await signup(formData);

      if (data.success) {
        dispatch(setAuth(data.data));
        router.push("/");
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="relative flex flex-col w-full min-h-screen items-center justify-center p-4 overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[120px] animate-pulse delay-700" />
      </div>

      <Card className="relative z-10 w-full max-w-[420px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-content1/80 backdrop-blur-xl">
        <Card.Content className="p-8">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-foreground mb-4 flex items-center justify-center shadow-lg">
              <span className="text-background font-bold text-xl">W</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-default-500 mt-2">
              Simple, minimal, and beautiful.
            </p>
          </div>

          <Tabs className="w-full" variant="secondary">
            <Tabs.List aria-label="Options">
              <Tabs.Tab id="login">
                Login
                <Tabs.Indicator />
              </Tabs.Tab>

              <Tabs.Tab id="signup">
                Sign up
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel id="login" className="space-y-6">
              <form
                className="flex flex-col gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAuth(true);
                }}
              >
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-default-400 ml-1">
                    Email Address
                  </label>
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-default-50/50 border-none transition-colors hover:bg-default-100/50 focus:bg-default-100 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end mr-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-default-400 ml-1">
                      Password
                    </label>
                    <Link
                      href="#"
                      className="text-[11px] font-bold text-primary hover:opacity-80 transition-opacity"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="bg-default-50/50 border-none transition-colors hover:bg-default-100/50 focus:bg-default-100 rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 bg-foreground text-background font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all mt-4 text-base shadow-xl shadow-foreground/10"
                >
                  Continue
                </Button>
              </form>
            </Tabs.Panel>

            <Tabs.Panel id="signup" className="space-y-6">
              <form
                className="flex flex-col gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAuth(false);
                }}
              >
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-default-400 ml-1">
                    Full Name
                  </label>
                  <Input
                    placeholder="Enter your name"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="bg-default-50/50 border-none transition-colors hover:bg-default-100/50 focus-within:bg-default-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-default-400 ml-1">
                    Email Address
                  </label>
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-default-50/50 border-none transition-colors hover:bg-default-100/50 focus-within:bg-default-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-default-400 ml-1">
                    Create Password
                  </label>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="bg-default-50/50 border-none transition-colors hover:bg-default-100/50 focus-within:bg-default-100"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 bg-foreground text-background font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all mt-4 text-base shadow-xl shadow-foreground/10"
                >
                  Create Account
                </Button>
              </form>
            </Tabs.Panel>
          </Tabs>
        </Card.Content>
      </Card>

      <div className="relative z-10 flex gap-6 mt-12 opacity-30 hover:opacity-50 transition-opacity">
        <Link href="#" className="text-[11px] font-bold text-foreground">
          Terms
        </Link>
        <Link href="#" className="text-[11px] font-bold text-foreground">
          Privacy
        </Link>
        <Link href="#" className="text-[11px] font-bold text-foreground">
          Status
        </Link>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Link,
  Button,
  Card,
  Checkbox,
  toast,
  Spinner,
} from "@heroui/react";
import { HiEnvelope, HiLockClosed } from "react-icons/hi2";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  LoginFormData,
  signupSchema,
  SignupFormData,
} from "../lib/schemas/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { authService } from "../services/auth.service";

export default function Home() {
  const [selectedTab, setSelectedTab] = useState<string>("login");

  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const {
    control: signupControl,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting },
    reset: resetSignup,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const router = useRouter();
  const { loginContext } = useAuth();

  const onLogin = async (data: LoginFormData) => {
    try {
      const res = await authService.login(data);
      if (res.success) {
        toast(`Welcome back, ${res.user.name}!`);
        loginContext(res.user);
        router.push("/chat");
      }
    } catch (err: any) {
      toast(err.response?.data?.message || "Login failed");
    }
  };

  const onSignup = async (data: SignupFormData) => {
    try {
      const res = await authService.register({
        name: data.fullName,
        email: data.email,
        password: data.password,
      });
      if (res.success) {
        toast(`Account created for ${res.user.name}!`);
        loginContext(res.user);
        router.push("/chat");
      }
    } catch (err: any) {
      toast(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-64px)] w-full flex items-center justify-center bg-background text-foreground font-sans px-4">
      {}
      <Card className="relative z-10 w-full max-w-[420px] bg-background border border-default-200 shadow-sm p-8 rounded-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mb-4 shadow-sm">
            <HiLockClosed className="text-2xl" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Access VibeChat</h1>
          <p className="text-default-500 text-sm mt-2 font-medium italic">
            Violet Primary & Yellow Secondary.
          </p>
        </div>

        <div className="w-full">
          <div className="flex w-full border-b border-default-200 mb-6 gap-6 px-2">
            <button
              type="button"
              onClick={() => setSelectedTab("login")}
              className={`py-3 text-sm font-semibold transition-all cursor-pointer border-b-2 ${
                selectedTab === "login"
                  ? "text-primary border-primary"
                  : "text-default-500 border-transparent hover:text-default-700"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("signup")}
              className={`py-3 text-sm font-semibold transition-all cursor-pointer border-b-2 ${
                selectedTab === "signup"
                  ? "text-primary border-primary"
                  : "text-default-500 border-transparent hover:text-default-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {selectedTab === "login" && (
            <form
              onSubmit={handleLoginSubmit(onLogin)}
              className="flex flex-col gap-5"
            >
              <Controller
                name="email"
                control={loginControl}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-default-600 uppercase tracking-wider">
                      Email
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-default-400 group-focus-within:text-foreground transition-colors">
                        <HiEnvelope className="text-xl" />
                      </div>
                      <input
                        {...field}
                        type="email"
                        placeholder="name@example.com"
                        className="w-full bg-background border border-default-200 rounded-lg py-2.5 pl-10 pr-4 text-foreground placeholder:text-default-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                    {loginErrors.email && (
                      <span className="text-xs text-danger font-medium mt-1">
                        {loginErrors.email.message}
                      </span>
                    )}
                  </div>
                )}
              />

              <Controller
                name="password"
                control={loginControl}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-default-600 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-default-400 group-focus-within:text-foreground transition-colors">
                        <HiLockClosed className="text-xl" />
                      </div>
                      <input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-background border border-default-200 rounded-lg py-2.5 pl-10 pr-4 text-foreground placeholder:text-default-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                    {loginErrors.password && (
                      <span className="text-xs text-danger font-medium mt-1">
                        {loginErrors.password.message}
                      </span>
                    )}
                  </div>
                )}
              />

              <div className="flex items-center justify-between">
                <Controller
                  name="rememberMe"
                  control={loginControl}
                  render={({ field }) => (
                    <Checkbox
                      isSelected={field.value}
                      onChange={field.onChange}
                      className="text-default-600 text-sm flex items-center gap-2"
                    >
                      Remember me
                    </Checkbox>
                  )}
                />
                <Link
                  href="#"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot?
                </Link>
              </div>

              <Button
                type="submit"
                isDisabled={isLoginSubmitting}
                variant="primary"
                className="w-full py-6 text-primary-foreground font-bold hover:opacity-90 rounded-lg transition-opacity flex items-center justify-center gap-2"
              >
                {isLoginSubmitting ? <Spinner size="sm" /> : "Sign In"}
              </Button>
            </form>
          )}

          {selectedTab === "signup" && (
            <form
              onSubmit={handleSignupSubmit(onSignup)}
              className="flex flex-col gap-4"
            >
              <Controller
                name="fullName"
                control={signupControl}
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-default-600 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      {...field}
                      placeholder="John Doe"
                      className="w-full bg-background border border-default-200 rounded-lg py-2 px-4 text-foreground outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                    />
                    {signupErrors.fullName && (
                      <span className="text-xs text-danger font-medium mt-1">
                        {signupErrors.fullName.message}
                      </span>
                    )}
                  </div>
                )}
              />

              <Controller
                name="email"
                control={signupControl}
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-default-600 uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      {...field}
                      type="email"
                      placeholder="name@example.com"
                      className="w-full bg-background border border-default-200 rounded-lg py-2 px-4 text-foreground outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                    />
                    {signupErrors.email && (
                      <span className="text-xs text-danger font-medium mt-1">
                        {signupErrors.email.message}
                      </span>
                    )}
                  </div>
                )}
              />

              <Controller
                name="password"
                control={signupControl}
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-default-600 uppercase tracking-wider">
                      Password
                    </label>
                    <input
                      {...field}
                      type="password"
                      placeholder="Create a strong password"
                      className="w-full bg-background border border-default-200 rounded-lg py-2 px-4 text-foreground outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                    />
                    {signupErrors.password && (
                      <span className="text-xs text-danger font-medium mt-1">
                        {signupErrors.password.message}
                      </span>
                    )}
                  </div>
                )}
              />

              <Button
                type="submit"
                isDisabled={isSignupSubmitting}
                variant="primary"
                className="w-full py-6 mt-4 text-primary-foreground font-bold hover:opacity-90 rounded-lg transition-opacity flex items-center justify-center gap-2"
              >
                {isSignupSubmitting ? <Spinner size="sm" /> : "Create Account"}
              </Button>
            </form>
          )}
        </div>
      </Card>

      {}
      <div className="absolute bottom-6 text-default-400 text-[10px] tracking-widest uppercase font-medium">
        © 2026 VibeChat Inc. High Security
      </div>
    </main>
  );
}

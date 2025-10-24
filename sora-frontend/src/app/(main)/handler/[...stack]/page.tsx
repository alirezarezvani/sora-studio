'use client';
import { StackHandler } from "@stackframe/stack";
import { stackClientApp } from "@/stack-client";

export default function Handler(props: any) {
  return <StackHandler fullPage app={stackClientApp} {...props} />;
}

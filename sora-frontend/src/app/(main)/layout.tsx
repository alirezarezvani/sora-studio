'use client';
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from '@/stack-client';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StackProvider app={stackClientApp}>
      <StackTheme>
        {children}
      </StackTheme>
    </StackProvider>
  );
}

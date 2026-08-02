"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export interface QuestionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  titleHindi?: string;
  description?: string;
  descriptionHindi?: string;
  helperText?: string;
  helperTextHindi?: string;
  variant?: "default" | "glass";
  icon?: React.ReactNode;
}

const QuestionCard = React.forwardRef<HTMLDivElement, QuestionCardProps>(
  ({ title, titleHindi, description, descriptionHindi, helperText, helperTextHindi, variant = "default", icon, children, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant={variant}
        className={cn("w-full transition-all duration-300 relative", className)}
        {...props}
      >
        {/* Top gold accent line for premium CNM design */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/80 to-transparent" />

        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-start gap-3">
            <span className="text-gold shrink-0 mt-0.5">
              {icon || <HelpCircle className="h-6 w-6" />}
            </span>
            <div className="space-y-1">
              <CardTitle className="text-xl md:text-2xl font-bold leading-relaxed text-white font-sans">
                {title}
              </CardTitle>
              {titleHindi && (
                <p className="text-lg md:text-xl font-normal text-zinc-400 leading-relaxed font-[family-name:var(--font-devanagari),sans-serif] mt-1">
                  {titleHindi}
                </p>
              )}
            </div>
          </div>
          {description && (
            <CardDescription className="text-zinc-400 text-sm font-light pl-9 leading-relaxed">
              {description}
            </CardDescription>
          )}
          {descriptionHindi && (
            <p className="text-sm font-normal text-zinc-500 pl-9 leading-relaxed font-[family-name:var(--font-devanagari),sans-serif] mt-1">
              {descriptionHindi}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6 pl-6 pr-6 md:pl-15 md:pr-8">
          {/* Answer Area (renders Option items or other input views) */}
          <div className="w-full">{children}</div>

          {/* Helper Text Compliance Reminder */}
          {helperText && (
            <div className="pt-2">
              <p className="text-xs text-zinc-500 font-mono italic">
                {helperText}
              </p>
              {helperTextHindi && (
                <p className="text-[11px] text-zinc-600 font-[family-name:var(--font-devanagari),sans-serif] mt-0.5">
                  {helperTextHindi}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);
QuestionCard.displayName = "QuestionCard";

export { QuestionCard };

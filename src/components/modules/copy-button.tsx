"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CopyButton({
  value,
  label = "Copy link",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <Button type="button" onClick={handleCopy} className={className}>
      {copied ? (
        <Check className="mr-2 size-4" />
      ) : (
        <Copy className="mr-2 size-4" />
      )}
      {copied ? "Copied" : label}
    </Button>
  );
}

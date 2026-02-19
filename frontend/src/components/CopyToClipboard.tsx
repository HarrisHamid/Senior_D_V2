import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CopyToClipboardProps {
    text: string;
    className?: string;
    children?: React.ReactNode;
    onCopy?: () => void;
}

export function CopyToClipboard({
    text,
    className,
    children,
    onCopy,
}: CopyToClipboardProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            toast.success("Copied to clipboard");
            onCopy?.();

            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (err) {
            toast.error("Failed to copy text");
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                "h-8 w-8 text-muted-foreground hover:text-foreground transition-colors",
                className
            )}
            onClick={handleCopy}
            type="button"
            title="Copy to clipboard"
        >
            {isCopied ? (
                <Check className="h-4 w-4 text-green-600" />
            ) : children ? (
                children
            ) : (
                <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">Copy</span>
        </Button>
    );
}

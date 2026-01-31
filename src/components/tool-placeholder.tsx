import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

export default function ToolPlaceholder({ title, description }: { title: string, description: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-6 rounded-full mb-6">
                <Construction className="h-12 w-12 text-yellow-600 dark:text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            <p className="text-muted-foreground max-w-md mb-8">
                {description}
            </p>
            <p className="text-sm text-muted-foreground mb-8 bg-muted px-4 py-2 rounded-md">
                This feature is in development. Check back soon!
            </p>
            <Link href="/">
                <Button variant="default">Back to Home</Button>
            </Link>
        </div>
    );
}

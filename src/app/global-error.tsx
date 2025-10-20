
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-destructive">Application Error</CardTitle>
                    <CardDescription>
                        Something went wrong, and the application could not recover. 
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">We apologize for the inconvenience. You can try to reload the page or come back later.</p>
                    {error?.message && (
                        <details className="mt-4 p-3 bg-secondary rounded-lg">
                            <summary className="text-sm font-medium cursor-pointer">Error Details</summary>
                            <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                                <code>{error.message}</code>
                            </pre>
                        </details>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={() => reset()}>Try again</Button>
                </CardFooter>
            </Card>
        </div>
      </body>
    </html>
  )
}

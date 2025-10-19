import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4 font-headline">Prop Firm Check</h3>
            <p className="text-sm text-muted-foreground">Find the best prop firm for your trading journey.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link href="/disclaimer" className="text-sm text-muted-foreground hover:text-foreground">Disclaimer</Link></li>
              <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <p className="text-sm text-muted-foreground">Social media links to be added here.</p>
          </div>
        </div>
        <div className="mt-12 border-t pt-6 text-center">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Prop Firm Check. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface HashLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

/**
 * A link component for same-page hash navigation that avoids
 * the Next.js router double-hash bug (e.g. /#why-us#faq).
 *
 * On the target page it scrolls to the element and updates
 * the hash via history.pushState. From other pages it falls
 * back to a normal Next.js Link.
 */
export function HashLink({ href, children, onClick, ...rest }: HashLinkProps) {
  const pathname = usePathname();

  // e.g. "/#why-us" → hash="#why-us", targetPath="/"
  const hash = href.includes("#") ? `#${href.split("#").pop()}` : href;
  const targetPath = href.split("#")[0] || "/";

  const isOnTargetPage = pathname === targetPath;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;

      if (!isOnTargetPage) return; // Let Link handle cross-page nav

      e.preventDefault();
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", hash);
      }
    },
    [hash, isOnTargetPage, onClick]
  );

  if (!isOnTargetPage) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={hash} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

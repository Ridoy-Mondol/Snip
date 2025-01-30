"use client"
import Link from "next/link"
import { usePathname } from "next/navigation";
const DraftsLayout = ({ params: { username }, children }: { params: { username: string }, children: React.ReactNode }) => {
    const pathname = usePathname();
    return (
        <div>
        <nav className="profile-nav">
                <Link
                    className={`profile-nav-link ${pathname === `/${username}/drafts` ? "active" : ""}`}
                    href={`/${username}/drafts`}
                >
                    <span>Tweets</span>
                </Link>
                <Link
                    className={`profile-nav-link ${pathname === `/${username}/drafts/blogs` ? "active" : ""}`}
                    href={`/${username}/drafts/blogs`}
                >
                    <span>Blogs</span>
                </Link>
        </nav>
        <div className="content">
        {children}
    </div>
    </div>
    )
}


export default DraftsLayout;

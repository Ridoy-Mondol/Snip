"use client";

import Link from "next/link";
import { useContext, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Menu, MenuItem } from "@mui/material";
import {
  FaHome,
  FaBell,
  FaPen,
  FaEnvelope,
  FaUser,
  FaCog,
  FaHashtag,
  FaEllipsisH,
  FaTwitter,
} from "react-icons/fa";
import { MdOutlineArticle } from "react-icons/md";
import { AiFillTwitterCircle } from "react-icons/ai";

import NewTweetDialog from "../dialog/NewTweetDialog";
import LogOutDialog from "../dialog/LogOutDialog";
import { logout } from "@/utilities/fetch";
import { AuthContext } from "@/context/AuthContext";
import { getFullURL } from "@/utilities/misc/getFullURL";
import {
  GeneralNotificationsBadge,
  MessageNotificationsBadge,
} from "../misc/UnreadNotificationsBadge";

export default function LeftSidebar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isNewTweetOpen, setIsNewTweetOpen] = useState(false);
  const [isLogOutOpen, setIsLogOutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { token } = useContext(AuthContext);

  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Fetch User Agent and IP Address
      const userAgent = navigator.userAgent;
      const ipAddress = await fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch((error) => {
          console.error("Failed to fetch IP address:", error);
          return "Unknown IP";
        });

      // Handle OneSignal Operations
      if (window.OneSignal && (await window.OneSignal.getSubscription())) {
        const playerId = await window.OneSignal.getUserId();

        if (token?.id && playerId) {
          const response = await fetch("/api/users/playerId/remove", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerId, userId: token.id }),
          });

          if (!response.ok) {
            console.error(
              "Failed to remove playerId from the database:",
              await response.text()
            );
            return;
          } else {
            console.log("Player ID successfully removed from the database.");
          }
        }

        window.OneSignal.push(() => {
          window.OneSignal.setSubscription(false);

          // Clear localStorage and cookies
          window.OneSignal.deleteTags(["playerId"]);
          localStorage.removeItem("OneSignalSDK");
          document.cookie =
            "onesignal-pageview-count=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "onesignal-notification-prompt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        });
      }

      // Call the logout API
      await logout({ userAgent, ipAddress });

      // Redirect to home page
      await router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleAnchorClose = () => {
    setAnchorEl(null);
  };
  const handleNewTweetClick = () => {
    setIsNewTweetOpen(true);
  };
  const handleNewTweetClose = () => {
    setIsNewTweetOpen(false);
  };
  const handleLogOutClick = () => {
    handleAnchorClose();
    setIsLogOutOpen(true);
  };
  const handleLogOutClose = () => {
    setIsLogOutOpen(false);
  };

  return (
    <>
      <aside className="left-sidebar">
        <div className="fixed">
          <Link href="/explore" className="twitter-icon">
            <FaTwitter />
          </Link>
          <nav>
            <ul>
              {token && (
                <li>
                  <Link href="/home">
                    <div
                      className={`nav-link ${
                        pathname.startsWith("/home") ? "active" : ""
                      }`}
                    >
                      <FaHome /> <span className="nav-title">Home</span>
                    </div>
                  </Link>
                </li>
              )}
              <li>
                <Link href="/explore">
                  <div
                    className={`nav-link ${
                      pathname.startsWith("/explore") ? "active" : ""
                    }`}
                  >
                    <FaHashtag /> <span className="nav-title">Explore</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <div
                    className={`nav-link ${
                      pathname.startsWith("/blog") ? "active" : ""
                    }`}
                  >
                    <MdOutlineArticle /> <span className="nav-title">Blog</span>
                  </div>
                </Link>
              </li>
              {token && (
                <>
                  <li>
                    <Link href="/create-blog">
                      <div
                        className={`nav-link ${
                          pathname.startsWith("/create-blog") ? "active" : ""
                        }`}
                      >
                        <div className="badge-wrapper">
                          <FaPen />
                        </div>
                        <span className="nav-title">CreateBlog</span>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link href="/notifications">
                      <div
                        className={`nav-link ${
                          pathname.startsWith("/notifications") ? "active" : ""
                        }`}
                      >
                        <div className="badge-wrapper">
                          <FaBell /> <GeneralNotificationsBadge />
                        </div>
                        <span className="nav-title">Notifications</span>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link href="/messages">
                      <div
                        className={`nav-link ${
                          pathname.startsWith("/messages") ? "active" : ""
                        }`}
                      >
                        <div className="badge-wrapper">
                          <FaEnvelope />
                          <MessageNotificationsBadge />
                        </div>
                        <span className="nav-title">Messages</span>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${token.username}`}>
                      <div
                        className={`nav-link ${
                          pathname.startsWith(`/${token.username}`)
                            ? "active"
                            : ""
                        }`}
                      >
                        <FaUser /> <span className="nav-title">Profile</span>
                      </div>
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link href="/settings">
                  <div
                    className={`nav-link ${
                      pathname.startsWith("/settings") ? "active" : ""
                    }`}
                  >
                    <FaCog /> <span className="nav-title">Settings</span>
                  </div>
                </Link>
              </li>
            </ul>
          </nav>
          {token && (
            <>
              <button onClick={handleNewTweetClick} className="btn btn-tweet">
                Tweet
              </button>
              <button onClick={handleAnchorClick} className="side-profile">
                <div>
                  <Avatar
                    className="avatar"
                    alt=""
                    src={
                      token.photoUrl
                        ? getFullURL(token.photoUrl)
                        : "/assets/egg.jpg"
                    }
                  />
                </div>
                <div>
                  <div className="token-name">
                    {token.name !== "" ? token.name : token.username}
                    {token.isPremium && (
                      <span className="blue-tick" data-blue="Verified Blue">
                        <AiFillTwitterCircle />
                      </span>
                    )}
                  </div>
                  <div className="text-muted token-username">
                    @{token.username}
                  </div>
                </div>
                <div className="three-dots">
                  <FaEllipsisH />
                </div>
              </button>
              <Menu
                anchorEl={anchorEl}
                onClose={handleAnchorClose}
                open={Boolean(anchorEl)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
              >
                <MenuItem onClick={handleAnchorClose}>
                  <Link href={`/${token.username}`}>Profile</Link>
                </MenuItem>
                <MenuItem onClick={handleAnchorClose}>
                  <Link href={`/${token.username}/edit`}>Edit Profile</Link>
                </MenuItem>
                <MenuItem onClick={handleAnchorClose}>
                  <Link href="/settings">Settings</Link>
                </MenuItem>
                <MenuItem onClick={handleAnchorClose}>
                  <Link href="/sessions">Sessions</Link>
                </MenuItem>
                <MenuItem onClick={handleAnchorClose}>
                  <Link href="/developer_settings">Developer Settings</Link>
                </MenuItem>
                <MenuItem onClick={handleAnchorClose}>
                  <Link href="/crypto_currency">Crypto Currency</Link>
                </MenuItem>
                <MenuItem onClick={handleAnchorClose}>
                  <Link href="/portfolio">Portfolio</Link>
                </MenuItem>
                <MenuItem onClick={handleAnchorClose}>
                  <Link href="/dao">DAO Dashboard</Link>
                </MenuItem>
                <MenuItem onClick={handleLogOutClick}>Log Out</MenuItem>
              </Menu>
            </>
          )}
        </div>
      </aside>
      {token && (
        <>
          <NewTweetDialog
            open={isNewTweetOpen}
            handleNewTweetClose={handleNewTweetClose}
            token={token}
          />
          <LogOutDialog
            open={isLogOutOpen}
            handleLogOutClose={handleLogOutClose}
            logout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        </>
      )}
    </>
  );
}

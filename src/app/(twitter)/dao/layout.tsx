"use client";

import React, { ReactNode, useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  Theme,
  ListItemButton,
  ListItem
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import ProtonWebSDK, { Link, ProtonWebLink } from '@proton/web-sdk';

import { MdMenu, MdExitToApp, MdAccountBalanceWallet, MdHowToVote, MdGroups, MdOutlineGavel, MdOutlinePolicy, MdRefresh, MdChevronLeft } from "react-icons/md";
import { RiDashboardLine } from "react-icons/ri";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaVoteYea, FaMoneyBillWave } from "react-icons/fa";

const drawerWidth = 460;
const mainContentMaxWidth = 1200;
const appBarHorizontalPadding = 26;

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }: { open: boolean; theme?: Theme }) => { 
  return ({
    background: "#1976D2",
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    zIndex: theme!.zIndex.drawer + 1,
    transition: theme!.transitions.create(['width', 'margin'], {
      easing: theme!.transitions.easing.sharp,
      duration: theme!.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme!.transitions.create(['width', 'margin'], {
        easing: theme!.transitions.easing.easeOut,
        duration: theme!.transitions.duration.enteringScreen,
      }),
    }),
  });
});

const StyledDrawerPaper = styled(Box)(({ theme }) => ({
  width: drawerWidth,
  backgroundColor: theme.palette.background.default,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: theme.shadows[4],
}));

const StyledDrawerHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#6200EE',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  boxShadow: theme.shadows[2],
  minHeight: theme.mixins.toolbar.minHeight,
}));

const StyledListItem = styled(ListItemButton)(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  paddingLeft: theme.spacing(3),
}));


const NAV_LINKS = [
  { label: "Dashboard", path: "/dao", icon: <RiDashboardLine /> },
  { label: "Elections", path: "/dao/elections", icon: <MdHowToVote /> },
  { label: "Candidate Registration", path: "/dao/candidate-registration", icon: <AiOutlineUserAdd /> },
  { label: "Voting", path: "/dao/voting", icon: <FaVoteYea /> },
  { label: "Council Members", path: "/dao/council_members", icon: <MdGroups /> },
  { label: "Moderators", path: "/dao/moderators", icon: <MdOutlineGavel /> },
  { label: "Proposals", path: "/dao/proposals", icon: <MdOutlinePolicy /> },
  { label: "Recall Voting", path: "/dao/recall-vote", icon: <MdRefresh /> },
  { label: "Community Wallet", path: "/dao/community-wallet", icon: <FaMoneyBillWave /> },
];

export default function DaoDashboardLayout({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<any>(null);
  const [activeLink, setActiveLink] = useState<Link | ProtonWebLink>();
  const [walletConnected, setWalletConnected] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const restore = async () => {
      try {
        const { link, session } = await ProtonWebSDK({
          linkOptions: {
            chainId: '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd',
            endpoints: ['https://tn1.protonnz.com'],
            restoreSession: true,
          },
          transportOptions: {
            requestAccount: 'snipvote',
          },
          selectorOptions: {
            appName: 'Snipverse',
          },
        });
    
        if (session && link) {
          console.log('✅ Restored session:', session.auth.actor);
          setActiveSession(session);
          setActiveLink(link);
          setWalletConnected(true);
        } else {
          console.log('ℹ️ No session found or session invalid.');
        }
      } catch (error) {
        console.error('❌ Error during session restoration:', error);
      }
    };
    
    restore();
  }, []);
  
  const connectWallet = async () => {
    try {
      const { link, session } = await ProtonWebSDK ({
        linkOptions: {
          endpoints: ["https://tn1.protonnz.com"],
          chainId: "71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd",
          restoreSession: false,
        },
        transportOptions: {
          requestAccount: "snipvote",
        },
        selectorOptions: {
          appName: "Snipverse",
        },
      });
  
      if (session) {
        console.log("Connected with account:", session.auth.actor);
        setActiveSession(session);
        setActiveLink(link);
        setWalletConnected(true);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };
  
  const disconnectWallet = async () => {
    if (activeLink) {
      try {
        await activeLink.removeSession("Snipverse", activeSession.auth.actor, "71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd");
        setActiveSession(null);
        setActiveLink(undefined);
        console.log("Wallet disconnected.");
        setWalletConnected(false);
        alert("Wallet disconnected.");
      } catch (error) {
        console.error("Error disconnecting wallet:", error);
        alert("Error disconnecting wallet: " + (error || "Unknown error"));
      }
    } else {
      alert("No wallet connected to disconnect.");
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavLinkClick = () => {
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar (Header) */}
      <StyledAppBar position="fixed" open={drawerOpen}>
        <Container maxWidth={false} disableGutters sx={{
            maxWidth: mainContentMaxWidth,
            mx: 'auto',
            px: `${appBarHorizontalPadding / 8}rem`,
          }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <MdChevronLeft /> : <MdMenu />}
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white', fontWeight: 600 }}>
            Snipverse DAO
          </Typography>

          {/* Wallet Connect/Disconnect Button */}
          {walletConnected ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MdAccountBalanceWallet size={20} color="white" />
              <Typography variant="subtitle2" color="white" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {activeSession.auth.actor.substring(0, 6)}...{activeSession.auth.actor.substring(activeSession.auth.actor.length - 4)}
              </Typography>
              <Button
                color="inherit"
                variant="outlined"
                startIcon={<MdExitToApp />}
                sx={{ borderColor: 'white', color: 'white' }}
                onClick={disconnectWallet}
              >
                Disconnect
              </Button>
            </Box>
          ) : (
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<MdAccountBalanceWallet />}
              sx={{ borderColor: 'white', color: 'white' }}
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          )}
        </Toolbar>
        </Container>
      </StyledAppBar>

      {/* Side Navigation Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            boxSizing: 'border-box',
            width: drawerWidth,
            overflowX: 'hidden',
            borderRight: 'none',
          },
        }}
      >
        <StyledDrawerPaper>
          <StyledDrawerHeader>
            <RiDashboardLine size={30} />
            <Typography variant="h6" fontWeight="bold">DAO Navigation</Typography>
          </StyledDrawerHeader>
          <Divider />
          <List sx={{ flexGrow: 1 }}>
            {NAV_LINKS.map((link) => (
              <ListItem key={link.path}   disablePadding>
                <NextLink href={link.path} passHref style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                  <StyledListItem
                    selected={pathname === link.path || (link.path !== '/dao' && pathname.startsWith(link.path))}
                    onClick={handleNavLinkClick}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{link.icon}</ListItemIcon>
                    <ListItemText primary={link.label} />
                  </StyledListItem>
                </NextLink>
              </ListItem>
            ))}
          </List>
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © Snipverse DAO {new Date().getFullYear()}
            </Typography>
          </Box>
        </StyledDrawerPaper>
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ p: 0, mt: 10, }} >
        {children}
      </Box>
    </Box>
  );
}
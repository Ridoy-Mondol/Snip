// "use client";

// import { createContext } from "react";

// import Footer from "@/components/layout/Footer";
// import LeftSidebar from "@/components/layout/LeftSidebar";
// import RightSidebar from "@/components/layout/RightSidebar";
// import OneSignalProvider from "@/components/layout/OneSignalProvider";
// import { AuthProps } from "@/types/TokenProps";
// import useAuth from "@/hooks/useAuth";

// const AuthContext = createContext<AuthProps>({ token: null, isPending: true, refreshToken: () => Promise.resolve() });

// export default function HomeLayout({ children }: { children: React.ReactNode }) {
//     const auth = useAuth();

//     return (
//         <AuthContext.Provider value={auth}>
//             <div className="layout">
//                 <LeftSidebar />
//                 <OneSignalProvider />
//                 {children}
//                 <RightSidebar />
//                 <Footer />
//             </div>
//         </AuthContext.Provider>
//     );
// }

// export { AuthContext };









"use client";

import React from "react";
import Footer from "@/components/layout/Footer";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import OneSignalProvider from "@/components/layout/OneSignalProvider";
import { AuthContext } from "@/context/AuthContext";
import useAuth from "@/hooks/useAuth";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            <div className="layout">
                <LeftSidebar />
                <OneSignalProvider />
                {children}
                <RightSidebar />
                <Footer />
            </div>
        </AuthContext.Provider>
    );
}

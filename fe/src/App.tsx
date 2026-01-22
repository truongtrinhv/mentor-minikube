import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";

import { Toaster } from "@/common/components/ui/sonner";
import { NotificationProvider } from "@/common/context/notification-context";
import { ThemeProvider } from "@/common/context/theme-provider";
import router from "@/routes";

import AuthProvider from "./common/context/auth-context";

const queryClient = new QueryClient();

function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="mentorplatform-theme">
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <NotificationProvider>
                        <RouterProvider router={router} />
                        <Toaster
                            position="top-center"
                            swipeDirections={["top", "right"]}
                            expand
                            richColors
                            visibleToasts={5}
                            className="select-none"
                            toastOptions={{
                                duration: 8000,
                            }}
                        />
                    </NotificationProvider>
                </AuthProvider>
                <ReactQueryDevtools initialIsOpen={true} />
            </QueryClientProvider>
        </ThemeProvider>
    );
}

export default App;

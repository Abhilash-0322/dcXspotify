import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useCatalog } from "@/amplify/store";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken, userId, isLoaded } = useAuth();
  const { user } = useUser();
  useEffect(() => {
    const id = axiosInstance.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => axiosInstance.interceptors.request.eject(id);
  }, [getToken]);
  useEffect(() => {
    let live = true;
    if (!isLoaded) return;
    useCatalog.getState().reset();
    useChatStore.getState().disconnectSocket();
    useAuthStore.setState({ isAdmin: false });
    if (userId && user)
      (async () => {
        try {
          const token = await getToken();
          if (!live || !token) return;
          await axiosInstance.post("/auth/callback", {
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
          });
          if (!live) return;
          await useCatalog.getState().sync();
          if (!live) {
            useCatalog.getState().reset();
            return;
          }
          useAuthStore.getState().checkAdminStatus();
          useChatStore.getState().initSocket(userId, token);
        } catch {
          /* Browsing stays available when account sync fails. */
        }
      })();
    return () => {
      live = false;
      useChatStore.getState().disconnectSocket();
      useCatalog.getState().reset();
    };
  }, [userId, isLoaded, user, getToken]);
  return <>{children}</>;
}

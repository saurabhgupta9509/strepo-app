import { useRiderStore } from "@/store/riderStore";
import { tokenStorage } from "@/store/storage";
import { useUserStore } from "@/store/userStore";
import { resetAndNavigate } from "@/utils/Helpers";
import { Alert } from "react-native";
import { BASE_URL } from "./config";
import axios from "axios";


export const signin = async(
  payload:{
    role : "customer" | "rider";
    phone : string;
  },
  updateAccessToken: () => void
) => {

    const {setUser} = useUserStore.getState();
    const { setUser:setRiderUser} = useRiderStore.getState();
    try {
      console.log("Calling signin API with payload:", payload);
      console.log("BASE_URL:", BASE_URL);
        const res = await axios.post(`${BASE_URL}/auth/signin`, payload);
        console.log("API Response:", res.data); 
        if (res.data.user.role === "customer" ) {
          setUser(res.data.user);
        }else{
          setRiderUser(res.data.user);
        }

        tokenStorage.set("access_token", res.data.access_token);
        tokenStorage.set("refresh_token", res.data.refresh_token);
        console.log("Navigating to:", res.data.user.role === "customer" ? "/customer/home" : "/rider/home");
        if (res.data.user.role === "customer" ) {
          resetAndNavigate("/customer/home");
        } else {
            resetAndNavigate("/rider/home");
        }
        updateAccessToken();

    } catch (error:any) {
      // Alert.alert("oh shit ! yrr fir se error   ");
      // console.log("Errro : " , error?.response?.data?.msg || "Error signin" )
      console.log("Error in signin:", error); // Debug log
      Alert.alert("Error", error?.response?.data?.msg ||"Failed to sign in. Please try again.");
    }

}

export const logout = async (disconnect?: () => void) => {
  if (disconnect) {
    disconnect();
  }

  const { clearData } = useUserStore.getState();
  const { clearRiderData } = useRiderStore.getState();

  tokenStorage.clearAll();
  clearRiderData();
  clearData();
  resetAndNavigate("/role");
};

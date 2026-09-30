import { Try } from "expo-router/build/views/Try";
import { Alert } from "react-native";
import { appAxios } from "./apiInterceptors";
import { router } from "expo-router";
import { resetAndNavigate } from "@/utils/Helpers";

interface coords  {
    address : string,
    latitude : number,
    longitude : number
}

export const createRide = async (payload : {
    vehicle : "bike" | "auto" | "cabEconomy" | "cabPremium";
    pickup : coords,
    drop : coords,
}) => {
    try {
        console.log("Sending Payload:", payload); // Debugging
        const res = await appAxios.post(`/ride/create` , payload);
        router?.navigate({
            pathname:"/customer/liveride",
            params:{
                id:res?.data?.ride?._id,
            },
        });
    } catch (error: any) {
        if (error.response) {
          console.error("Server Response:", error.response.data); // Debugging
        } else {
          console.error("Error in createRide:", error);
        }
        Alert.alert("Oh! There was an error");
      }
};


export const getMyRides = async (isCustomer : boolean = true) => {
    try{
        const res =await appAxios.get(`/ride/rides`);
        const filterRides = res.data?.rides?.filter(
            (ride:any) => ride?.status != "COMPLETED" 
        );
        if (filterRides.length > 0) {
            router?.navigate({
                pathname : isCustomer ? "/customer/liveride" : "/rider/liveride",
                params:{
                    id: filterRides![0]?._id,
                },
            });
        }
    }catch(error:any) {
        Alert.alert("oh! there was an error");
        console.log("Error in getMyRides : ", error); // Debug log
    }
};


export const acceptRiderOffer =async(rideId : string) => {
    try{
        const res = await appAxios.patch(`/ride/accept/${rideId}`);
        resetAndNavigate({
            pathname : "/rider/liveride",
            params:{
                id: rideId,
            },
        }); 
    }catch(error:any) {
        Alert.alert("oh! there was an error");
        console.log("Error in acceptRiderOffer : ", error); // Debug log
    }
};


export const updateRideStatus = async(rideId : string , status:string) => {
    try {
        const res = await appAxios.patch(`/ride/update/${rideId}` , {status} );
        return true; // return true if successfull else false  // Debug log
    } catch (error:any) {
        Alert.alert("ohh there is an error")
        console.log("Error in updateRideStatus : ", error); // Debug log
        return false;
    }
}   
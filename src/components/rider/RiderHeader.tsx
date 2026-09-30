import { View, Text, Alert , SafeAreaView, TouchableOpacity, Image} from "react-native";
import React, { useEffect } from "react";
import { useWs } from "@/service/WSProvider";
import { useRiderStore } from "@/store/riderStore";
import { useIsFocused } from "@react-navigation/native";
import * as Location from "expo-location";
import { rideStyles } from "@/styles/rideStyles";
import { commonStyles } from "@/styles/commonStyles";
import { AntDesign, FontAwesome, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { logout } from "@/service/authService";
import { riderStyles } from "@/styles/riderStyles";
import CustomText from "../shared/CustomText";
import { RFValue } from "react-native-responsive-fontsize";
import { Colors } from "@/utils/Constants";
 
// import * as Location from "expo-location";
const RiderHeader = () => {
  const { disconnect, emit } = useWs();
  const { setOnDuty, onDuty, setLocation } = useRiderStore();
  const isFocused = useIsFocused();

  const toggelOnDuty = async () => {
    if (onDuty) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied ❌ ",
          " location Permission is required to go on duty ✅ "
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude, heading } = location.coords;
      setLocation({
        latitude: latitude,
        longitude: longitude,
        address: "Somewhere ",
        heading: heading as number,
      });
      emit("goOnDuty", {
        latitude: location?.coords?.latitude,
        longitude: location?.coords?.longitude,
        heading: heading,
      });
    } else {
      emit("goOffDuty");
    }
  };

  useEffect(() => {
    if (isFocused) {
        toggelOnDuty();
    }
  } , [isFocused , onDuty]);


  
  return (
    <>
    <View style={riderStyles.headerContainer}>
      <SafeAreaView />

      <View style = {commonStyles.flexRowBetween}>
            <FontAwesome
                onPress={() => logout(disconnect)}
                name="power-off"
                // size={RFValue(20)}
                color={Colors.text}
                size={24}
            />
            <TouchableOpacity 
            style={riderStyles.toggleContainer}
            onPress={() => setOnDuty(!onDuty)}
            >
                <CustomText 
                    fontFamily="SemiBold"
                    fontSize={12}
                    style={{ color : "#888" }}
                >
                    {onDuty ? " ON-DUTY" : "OFF-DUTY" }
                </CustomText>
                <Image 
                    source={
                        onDuty
                        ? require("@/assets/icons/switch_on.png") 
                        : require("@/assets/icons/switch_off.png")
                    }
                    style= {riderStyles.icon}
                />
            </TouchableOpacity>
            <MaterialIcons name="notifications" size={24} color="black" />
      </View>
    </View>

    <View
        style={riderStyles?.earningContainer}
    >
        <CustomText
            fontSize={13} style={{ color : "#fff" }}
            fontFamily="Medium"
        >
            Today's Earnings
        </CustomText>

        <View style={commonStyles?.flexRowGap}>
                    <CustomText style={{ color : "#fff" }}
                        fontSize={14}
                        fontFamily="Medium"
                    >
                    ₹ 39,951.22
                    </CustomText>
                    <MaterialIcons name="arrow-drop-down" size={24} color="#fff" /> 
        </View>
    </View>

    </>
    
  );
};

export default RiderHeader;

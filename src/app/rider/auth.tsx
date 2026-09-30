import {
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import  { useState } from "react";
import { authStyles } from "@/styles/authStyles";
import { commonStyles } from "@/styles/commonStyles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import CustomText from "@/components/shared/CustomText";
import { useWs } from "@/service/WSProvider";
import PhoneInput from "@/components/shared/PhoneInput";
import CustomButton from "@/components/shared/CustomButton";
import { signin } from "@/service/authService";
import { router } from "expo-router";
import React from "react";
const Auth = () => {
  const { updateAccessToken } = useWs();
  const [phone, setPhone] = useState("");

  const handleNext = async () => {
    console.log("Next button clicked");
    console.log("Phone number:", phone);
    if (!phone || phone.length !== 10) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid 10-digit phone number"
      );
      return;
    }
    try {
      await signin({ role: "rider", phone }, updateAccessToken);
    } catch (error) {
      console.log("Error in handleNext:", error); // Log the full error
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };
  // const handleNext = async () => {
  //   //     console.log("Next button clicked");
  //   //     // console.log("Phone number:", phone);
  //   if (!phone || phone.length !== 10) {
  //     Alert.alert(
  //       "Invalid Phone Number",
  //       "Please enter a valid 10-digit phone number"
  //     );
  //     return;
  //   }
  //   try {
  //     await signin({ role: "rider", phone }, updateAccessToken);
  //   } catch (error) {
  //     console.log("Error in handleNext:", error); // Log the full error
  //     Alert.alert("Error", "Something went wrong. Please try again.");
  //   }
  // };

  return (
    <SafeAreaView style={authStyles.container}>
      <ScrollView contentContainerStyle={authStyles.container}>
        <View style={commonStyles.flexRowBetween}>
          <Image
            source={require("@/assets/images/logo_t.png")}
            style={authStyles.logo}
          />

          <TouchableOpacity style={authStyles.flexRowGap}>
            <MaterialIcons name="help" size={18} color="grey" />
            <CustomText fontFamily="Medium" variant="h7">
              Help
            </CustomText>
          </TouchableOpacity>
        </View>

        <CustomText fontFamily="Medium" variant="h6">
          Good to See You, Rider !
        </CustomText>

        <CustomText
          variant="h7"
          fontFamily="Regular"
          style={commonStyles.lightText}
        >
          Enter your phone number to continue
        </CustomText>
        <PhoneInput onChangeText={setPhone} value={phone} />

        <View style={authStyles.footerContainer}>
          <CustomText
            variant="h8"
            fontFamily="Regular"
            style={[
              commonStyles.lightText,
              { textAlign: "center", marginHorizontal: 20 },
            ]}
          >
            BY continuing , you agree to the terms and privacy policy
          </CustomText>

          <CustomButton
            title="Next"
            onPress={handleNext}
            // onPress={() => router.navigate("/rider/home")}
            loading={false}
            disabled={false}
          ></CustomButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Auth;

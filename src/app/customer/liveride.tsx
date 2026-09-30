import { View, Text, Platform, Alert } from "react-native";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { screenHeight } from "@/utils/Constants";
import { useWs } from "@/service/WSProvider";
import { useRoute } from "@react-navigation/native";
import { rideStyles } from "@/styles/rideStyles";
import { StatusBar } from "expo-status-bar";
import LiveTrackingMap from "@/components/customer/LiveTrackingMap";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import CustomText from "@/components/shared/CustomText";
import { ActivityIndicator } from "react-native-paper";
import SearchingRideSheet from "@/components/customer/SearchingRideSheet";
import LiveTrackingSheet from "@/components/customer/LiveTrackingSheet";
import { resetAndNavigate } from "@/utils/Helpers";

const androidHeights = [screenHeight * 0.12, screenHeight * 0.42];
const iosHeights = [screenHeight * 0.2, screenHeight * 0.5];
const LiveRide = () => {
  const { emit, on, off } = useWs();
  const [rideData, setRideData] = useState<any>(null);
  const [ridercoords, setriderCoords] = useState<any>(null);
  const route = useRoute() as any;
  const params = route?.params || {};
  const id = params.id;
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(
    () => (Platform.OS === "ios" ? iosHeights : androidHeights),
    []
  );
  const [mapHeight, setMapHeight] = useState(snapPoints[0]);

  const handleSheetChanges = useCallback((index: number) => {
    let height = screenHeight * 0.8;
    if (index === 1) {
      height = screenHeight * 0.5;
    }
    setMapHeight(height);
  }, []);

  useEffect(() => {
    
    if (id) {
        emit('subscribeRide' , id)

        on('rideData', (data) => {
            setRideData(data)
            if (data?.status === "SEARCHING_FOR_RIDER") {
                emit('searchrider' , id)
            } 
        });

        on('rideUpdate' , (data) => {
            setRideData(data)
        })

        on('rideCanceled' , (error) => {
            resetAndNavigate('/customer/home')
            Alert.alert("Ride canceled")
        })

        on('error', (error) => {
            resetAndNavigate('/customer/home')
            Alert.alert("No rider Found", error?.msg || "No rider Found")
        })
    }

    return () => {
        off('rideData');
        off('rideUpdate');
        off('rideCanceled');
        off('error')
    };
  } , [id , emit , on , off])



  useEffect (() => {
    if (rideData?.rider?._id) {
        emit('subscribeToriderLocation' , rideData?.rider?._id);
        on('riderLocationUpdate' , (data) => {
            setriderCoords(data?.coords);
        })
    }
    return () => {
        off('rideLocationUpdate');
    }
  } , [rideData])




  return (
    <View style={rideStyles.container}>
      <StatusBar style="light" backgroundColor="red" translucent={false} />

      {rideData && (
        <LiveTrackingMap
          height={mapHeight}
          status={rideData?.status}
          drop={{
            latitude: parseFloat(rideData?.drop?.latitude),
            longitude: parseFloat(rideData?.drop?.longitude),
          }}
          pickup={{
            latitude: parseFloat(rideData?.pickup?.latitude),
            longitude: parseFloat(rideData?.pickup?.longitude),
          }}
          rider={
            ridercoords
              ? {
                  latitude: ridercoords.latitude,
                  longitude: ridercoords.longitude,
                  heading: ridercoords.heading,
                }
              : {}
          }
        />
      )}

      {rideData ? (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          handleIndicatorStyle={{
            backgroundColor: "#ccc",
          }}
          enableOverDrag={false}
          enableDynamicSizing={false}
          style={{ zIndex: 4 }}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
        >
          <BottomSheetScrollView
            contentContainerStyle={rideStyles?.container}
          >
            {
                rideData?.status === "SEARCHING_FOR_RIDER" ? (
                    <SearchingRideSheet item = {rideData} />
                ) 
                :(
                    <LiveTrackingSheet item = {rideData} />
                )
               
  
            }
          </BottomSheetScrollView>
        </BottomSheet>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <CustomText variant="h8">Fetching Information...</CustomText>
          <ActivityIndicator color="black" size="small" />
        </View>
      )}
    </View>
  );
};

export default memo(LiveRide);

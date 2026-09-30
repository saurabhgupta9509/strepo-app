import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { FC, memo, useEffect, useMemo, useRef, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useUserStore } from "@/store/userStore";
import MapView, { Marker, Region } from "react-native-maps";
import { Portal } from "react-native-paper";
import { useWs } from "@/service/WSProvider";
import { customMapStyle, indiaIntialRegion } from "@/utils/CustomMap";
import { reverseGeocode } from "@/utils/mapUtils";
import haversine from "haversine-distance";
import { mapStyles } from "@/styles/mapStyles";
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import * as Location from "expo-location";
import { Animated } from "react-native";

const DraggableMap: FC<{ height: number }> = ({ height }) => {
  const isFocused = useIsFocused();
  const [markers, setMarkers] = useState<any>([]);
  const mapRef = useRef<MapView>(null);
  const { setLocation, location, outOfRange, setOutOfRange } = useUserStore();
  const { emit, on, off } = useWs();
  const MAX_DISTANCE_THRESHOLD = 10000;
  const opacity = useRef(new Animated.Value(0)).current;
  //   useEffect(() => {
  //     Animated.timing(opacity, {
  //       toValue: outOfRange ? 1 : 0,
  //       duration: 300,
  //       useNativeDriver: true,
  //     }).start();
  // //   }, [outOfRange]);

  //   const outOfRangeIndicator = useMemo(() => {
  //     return outOfRange ? (
  //       <View style={mapStyles.outOfRange}>
  //         <FontAwesome6 name="road-circle-exclamation" size={24} color="red" />
  //       </View>
  //     ) : null;
  //   }, [outOfRange]);


  useEffect(() => {
    (async () => {
      if (isFocused) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          try {
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            mapRef.current?.fitToCoordinates([{ latitude, longitude }], {
              edgePadding: { top: 50, left: 50, bottom: 50, right: 50 },
              animated: true,
            });
            const newRegion = {
              latitude,
              longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            };
            handleRegionChangeComplete(newRegion);
          } catch (error) {
            console.error("erorr getting current location ", error);
          }
        } else {
          console.log("permission was denied ");
        }
      }
    })();
  }, [mapRef, isFocused]);

  // realtime near b devices 

  useEffect(() => {
    if (location?.latitude && location?.longitude && isFocused) {
      emit("subscribeToZone",{
        latitude: location.latitude,
        longitude: location.longitude,
      });

      on("nearbyRiders" , (riders:any[]) => {
        const updateMarkers = riders.map((rider)=> ({
          id: rider.id,
          latitude: rider.coords.latitude,
          longitude: rider.coords.longitude,
          type: "rider",
          rotation: rider.coords.rotation,
          visible : true
        }));
        setMarkers(updateMarkers);
      })
    }
    return() => {
      off("nearbyRiders");
    };
  }, [location , emit , on , off , isFocused])

  //simulating near by riders
  // const generateRandomMarkers = () => {
  //   if (!location?.latitude || !location?.longitude || outOfRange) return;

  //   const types = ["bike", "auto", "cab"];
  //   const newMarkers = Array.from({ length: 20 }, (_, index) => {
  //     const randomType = types[Math.floor(Math.random() * types.length)];
  //     const randomRotaion = Math.floor(Math.random() * 360);

  //     return {
  //       id: index,
  //       visible: true,
  //       latitude: location?.latitude + (Math.random() - 0.05) * 0.01,
  //       longitude: location?.longitude + (Math.random() - 0.05) * 0.1,
  //       type: randomType,
  //       rotation: randomRotaion,
  //     };
  //   });
  //   setMarkers(newMarkers);
  // };

  // useEffect(() => {
  //   generateRandomMarkers();
  // }, [location]);

  const handleRegionChangeComplete = async (newRegion: Region) => {
    const address = await reverseGeocode(
      newRegion.latitude,
      newRegion.longitude
    );
    setLocation({
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
      address: address,
    });

    const userLocation = {
      latitude: location?.latitude,
      longitude: location?.longitude,
    } as any;

    if (userLocation) {
      const newLocation = {
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      };
      const distance = haversine(userLocation, newLocation);
      setOutOfRange(distance > MAX_DISTANCE_THRESHOLD);
    }
  };

  const handleGpsButtonPress = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      mapRef.current?.fitToCoordinates([{ latitude, longitude }], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
      const address = await reverseGeocode(latitude, longitude);
      setLocation({ latitude, longitude, address });
    } catch (error) {
      console.log("Error in getting location :", error);
    }
  };

  return (
    <View style={{ height: height, width: "100%" }}>
      <MapView
        ref={mapRef}
        mapType="hybrid"
        maxZoomLevel={16}
        minZoomLevel={12}
        pitchEnabled={false}
        onRegionChangeComplete={handleRegionChangeComplete}
        style={{ flex: 1 }}
        initialRegion={indiaIntialRegion}
        provider="google"
        showsMyLocationButton={false}
        showsCompass={false}
        showsIndoors={false}
        showsIndoorLevelPicker={false}
        showsTraffic={false}
        showsScale={false}
        showsBuildings={false}
        showsPointsOfInterest={false}
        customMapStyle={customMapStyle}
        showsUserLocation={true}
      >
        {markers
          ?.filter(
            (marker: any) =>
              marker?.latitude && marker?.longitude && marker?.visible
          )
          .map((marker: any, index: number) => (
            <Marker 
            key={index} 
            zIndex={index + 1}
              flat anchor={{ x: 0.5, y: 0.5 }}
              coordinate=
              {{
                latitude: marker.latitude,
                longitude: marker?.longitude,
              }}>
                <View style={{transform : [{ rotate : `${marker?.roatation}deg`}]}}>
                  <Image
                    source={
                      marker.type === "bike"
                       ? require("@/assets/icons/bike_marker.png")
                        : marker.type === "auto"
                       ? require("@/assets/icons/auto_marker.png")
                        : require("@/assets/icons/cab_marker.png")
                    }
                    style={{height : 40 , width :40 , resizeMode : "contain"}}
                  />
                </View>
  
            </Marker>
          ))}
      </MapView>
      <View style={mapStyles.centerMarkerContainer}>
        <Image
          source={require("@/assets/icons/marker.png")}
          style={mapStyles.marker}
        />
      </View>
      <TouchableOpacity
        style={mapStyles.gpsButton}
        onPress={handleGpsButtonPress}
      >
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={RFValue(16)}
          color="#3C75BE"
        />
      </TouchableOpacity>
      {/* <React.Fragment> */}
      {/* <Portal> */}
      {outOfRange && (
        <View style={mapStyles.outOfRange}>
          <FontAwesome6 
          name="road-circle-exclamation"
           size={24} 
           color="red" />
        </View>
      )}

      {/* </Portal> */}

      {/* {outOfRangeIndicator} */}
      {/* <Animated.View style={[mapStyles.outOfRange, { opacity }]}>
            <FontAwesome6
              name="road-circle-exclamation"
              size={24}
              color="red"
            />
          </Animated.View> */}
      {/* </React.Fragment> */}

      <Text>DraggableMap</Text>
    </View>
  );
};

export default memo(DraggableMap);

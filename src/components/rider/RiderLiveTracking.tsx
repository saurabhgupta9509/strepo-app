import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { FC, memo, useEffect, useRef, useState } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { customMapStyle, indiaIntialRegion } from "@/utils/CustomMap";
import { mapStyles } from "@/styles/mapStyles";
import CustomText from "../shared/CustomText";
import {
  FontAwesome,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import MapViewDirections from "react-native-maps-directions";
import { Colors } from "@/utils/Constants";
import { getPoints } from "@/utils/mapUtils";

const apikey = process.env.EXPO_PUBLIC_MAP_API_KEY || "";
const RiderLiveTracking: FC<{
  drop: any;
  pickup: any;
  rider: any;
  status: string;
}> = ({ drop, status, pickup, rider }) => {
  const mapRef = useRef<MapView>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const fitToMarkers = async () => {
    if (isUserInteracting) return;

    const coordinates = [];

    if (pickup?.latitude && pickup?.longitude && status === "START") {
      coordinates.push({
        latitude: pickup.latitude,
        longitude: pickup.longitude,
      });
    }

    if (drop?.latitude && drop?.longitude && status === "ARRIVED") {
      coordinates.push({
        latitude: drop.latitude,
        longitude: drop.longitude,
      });
    }

    if (rider?.latitude && rider?.longitude) {
      coordinates.push({
        latitude: rider.latitude,
        longitude: rider.longitude,
      });
    }

    if (coordinates.length === 0) return;

    try {
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, left: 50, bottom: 50, right: 50 },
        animated: true,
      });
    } catch (error) {
      console.log("Error fitting map :", error);
    }
  };

  const fitToMarkersWithDelay = () => {
    setTimeout(() => {
      fitToMarkers();
    }, 500);
  };

  const calculateInitialRegion = () => {
    if (pickup?.latitude && drop?.latitude) {
      const latitude = (pickup.latitude + drop.latitude) / 2;
      const longitude = (pickup.longitude + drop.longitude) / 2;
      return {
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return indiaIntialRegion;
  };

  useEffect(() => {
    if (pickup?.latitude && drop?.latitude) fitToMarkers();
  }, [drop?.latitude, pickup?.latitude, rider.latitude]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        followsUserLocation
        provider="google"
        initialRegion={calculateInitialRegion()}
        onRegionChange={() => setIsUserInteracting(true)}
        onRegionChangeComplete={() => setIsUserInteracting(false)}
        style={{ flex: 1 }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsIndoors={false}
        customMapStyle={customMapStyle}
        mapType="hybrid"
      >
        {rider?.latitude && pickup?.latitude && (
          <MapViewDirections
            origin={status === "START" ? pickup : rider}
            destination={status === "START" ? rider : drop}
            onReady={fitToMarkersWithDelay}
            apikey={apikey}
            strokeWidth={5}
            strokeColor={Colors.iosColor}
            strokeColors={[Colors.iosColor]}
            precision="high"
            onError={(error) => console.log("direction eorrr :", error)}
          />
        )}

        {drop?.latitude && (
          <Marker
            coordinate={{ latitude: drop.latitude, longitude: drop.longitude }}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={1}
          >
            <Image
              source={require("@/assets/icons/drop_marker.png")}
              style={{ height: 30, width: 30, resizeMode: "contain" }}
            />
          </Marker>
        )}

        {pickup?.latitude && (
          <Marker
            coordinate={{
              latitude: pickup.latitude,
              longitude: pickup.longitude,
            }}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={2}
          >
            <Image
              source={require("@/assets/icons/marker.png")}
              style={{ height: 30, width: 30, resizeMode: "contain" }}
            />
          </Marker>
        )}

        {rider?.latitude && (
          <Marker
            coordinate={{
              latitude: rider.latitude,
              longitude: rider.longitude,
            }}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={3}
          >
            <View style={{ transform: [{ rotate: `${rider?.heading}deg` }] }}>
              <Image
                source={require("@/assets/icons/cab_marker.png")}
                style={{ height: 40, width: 40, resizeMode: "contain" }}
              />
            </View>
          </Marker>
        )}

        {drop && pickup && (
          <Polyline
            coordinates={getPoints([drop, pickup])}
            strokeColor={Colors.text}
            strokeWidth={2}
            geodesic={true}
            lineDashPattern={[12, 10]}
          />
        )}
      </MapView>

      <TouchableOpacity style={mapStyles.gpsLiveButton} onPress={() => {}}>
        <CustomText fontFamily="SemiBold" fontSize={10}>
          Open Live GPS
        </CustomText>
        <FontAwesome6 name="location-arrow" size={RFValue(12)} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity style={mapStyles.gpsButton} onPress={fitToMarkers}>
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={RFValue(16)}
          color="#3C75BE"
        />
      </TouchableOpacity>
    </View>
  );
};

export default memo(RiderLiveTracking);

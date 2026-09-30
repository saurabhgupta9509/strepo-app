import { View, Text, Platform } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { homeStyles } from '@/styles/homeStyles'
import { StatusBar } from 'expo-status-bar'; 
import LocationBar from '@/components/customer/LocationBar';
import { screenHeight } from '@/utils/Constants';
import DraggableMap from '@/components/customer/DraggableMap';
import { PaperProvider } from 'react-native-paper';
import BottomSheet , {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import SheetContent from '@/components/customer/SheetContent';
import { getMyRides } from '@/service/rideService';

const androidHeights = [screenHeight * 0.2 , screenHeight * 0.42 ,  screenHeight * 0.8]
const iosheights = [screenHeight * 0.2 , screenHeight * 0.5, screenHeight * 0.8]

const CustomerHome = () => {
  
  const bottomSheetRef = useRef(null)
  const snapPoints = useMemo(
    () => (Platform.OS === "ios" ? iosheights: androidHeights ),
  []
);

const [mapHeight , setMapHeight] = useState(snapPoints[0]);

const handleSheetChanges = useCallback((index:number) =>{
  let height = screenHeight * 0.8;
  if (index == 1) {
    height = Platform.OS === "ios"? screenHeight * 0.56 : screenHeight * 0.9;
  }
  setMapHeight(height);
}, []);

    useEffect(() => {
      getMyRides()
    }, []);
    
  return (
    
    <View style = {homeStyles.container}>
      <StatusBar
        style = "light"
        backgroundColor = "orange"
        translucent ={false}
        />
      <LocationBar/>

      <DraggableMap height ={mapHeight}/>

      <BottomSheet
      ref={bottomSheetRef}
      index={1}
      handleIndicatorStyle={{
        backgroundColor :"#CCC"
      }}
      enableOverDrag={false}
      enableDynamicSizing={false}
      style={{zIndex :4}}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      >
        <BottomSheetScrollView contentContainerStyle={homeStyles.scrollContainer}> 
        {/* <SheetContent/> */}
        <SheetContent/>
        </BottomSheetScrollView>
      </BottomSheet>
    
    </View>
   
  )
}

export default CustomerHome;
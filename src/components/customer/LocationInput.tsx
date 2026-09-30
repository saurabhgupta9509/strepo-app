import { View, Text , StyleSheet, TextInput, TouchableOpacity} from "react-native";
import React, { FC } from "react";
import { TextInputProps } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";

interface LocationInputProps extends TextInputProps {
  placeholder: string;
  type: "pickup" | "drop";
  value: string;
  onChangeText: (text: string) => void;
}
const LocationInput: FC<LocationInputProps> = ({
  placeholder,
  type,
  value,
  onChangeText,
  ...props
}) => {
    const dotColor = type === "pickup" ? "green" : "red";

  return (
    <View style={[styles.container , styles.focusedContainer , {
       backgroundColor : value =='' ? '#fff' : '#f2f2f2'
    }]}>
        
        <View style={[styles.dot,{backgroundColor:dotColor}]} />
            <TextInput style= {[styles.input,{
                backgroundColor: value == "" ? "#fff" : "#f2f2f2"
            },
            ]} 
                placeholder={placeholder}
                placeholderTextColor={"#aaa"}
                value={value}
                onChangeText={onChangeText}
                {...props}
                />
                {
                    value != "" && (
                        <TouchableOpacity onPress={() => onChangeText("")}>
                            <Ionicons name="close-circle" size={RFValue(16)} color = "#ccc"/>
                        </TouchableOpacity>
                    )
                }
        {/* </View> */}

    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flexDirection : "row",
        alignItems : "center",
        borderRadius: 8,
        paddingHorizontal: 10,
        marginVertical: 7,
      },
    input: {
        fontSize: 16,
        height: 45,
        width:"90%",
        color : "#000"
    },
    dot: {
       marginRight: 10,
        width: 6,
        height: 6,
        borderRadius: 4,
    },
    focusedContainer :{
        borderColor : "#ccc",
        borderWidth : 1
    }
});
export default LocationInput;

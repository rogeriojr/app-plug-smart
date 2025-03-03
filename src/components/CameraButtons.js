import React from "react";
import { View, TouchableOpacity } from "react-native";
import { colors } from "../views/styles";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function CameraButtons({
  visible = false,
  onTakePicture,
  onChangeCamera,
}) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        flexDirection: "row",
        flex: 1,
        width: "100%",
        padding: 20,
        justifyContent: "space-between",
        left: 0,
      }}
    >
      {visible && (
        <View
          style={{
            alignSelf: "center",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            style={{
              width: 70,
              height: 70,
              bottom: 20,
              borderRadius: 50,
              // backgroundColor: '#fff',
              left: 0,
            }}
          />
          <TouchableOpacity
            onPress={onTakePicture}
            style={{
              width: 70,
              height: 70,
              bottom: 20,
              borderRadius: 50,
              backgroundColor: "#fff",
              left: 0,
            }}
          />
          <TouchableOpacity
            onPress={onChangeCamera}
            style={{
              width: 70,
              height: 70,
              bottom: 20,
              borderRadius: 50,
              left: 40,
            }}
          >
            <Ionicons name="camera-reverse" size={70} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

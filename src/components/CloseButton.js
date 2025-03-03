import React from "react";
import { View, TouchableOpacity } from "react-native";
import { colors } from "../assets/styles";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function CloseButton({
  visible = true,
  onClose,
  isQrCode = false,
}) {
  return (
    visible && (
      <View
        style={{
          position: "absolute",
          top: 20,
          right: isQrCode ? 20 : null,
          left: isQrCode ? null : 20,
          zIndex: 10,
        }}
      >
        <TouchableOpacity
          onPress={onClose}
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="close-circle"
            size={55}
            color={isQrCode ? colors.primary : colors.white}
          />
        </TouchableOpacity>
      </View>
    )
  );
}

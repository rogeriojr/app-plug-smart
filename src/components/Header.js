import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { colors, styles } from "../assets/styles";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Header({ onClickAccess, onClickUser }) {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onClickAccess}>
        <Ionicons name="receipt" size={35} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onClickUser}>
        <Ionicons name="person" size={35} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

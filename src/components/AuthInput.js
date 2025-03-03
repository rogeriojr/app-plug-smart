import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, styles } from "../views/styles";

const AuthInput = ({
  icon,
  label,
  field,
  formData,
  setFormData,
  errors,
  secure = false,
  requirements = [],
  statusIcon,
  onBlur,
  inputRef,
  returnKeyType,
  onSubmitEditing,
  formatter,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Manipula a formatação especial
  const handleChange = (value) => {
    const formattedValue = formatter ? formatter(value) : value;
    setFormData(field, formattedValue);
  };

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Label e indicador de obrigatório */}
      <View style={localStyles.labelContainer}>
        <Text style={localStyles.label}>{label}</Text>
        {props.required && <Text style={localStyles.required}>*</Text>}
      </View>

      {/* Container do input */}
      <View
        style={[
          styles.inputContainer,
          errors[field] && styles.inputError,
          statusIcon && localStyles.statusContainer,
        ]}
      >
        {/* Ícone esquerdo */}
        <Ionicons
          name={errors[field] ? "alert-circle" : icon}
          size={24}
          color={errors[field] ? "red" : colors.primary}
          style={localStyles.icon}
        />

        {/* Campo de texto principal */}
        <TextInput
          ref={inputRef}
          style={localStyles.input}
          value={formData[field]}
          onChangeText={handleChange}
          onBlur={() => onBlur?.(field)}
          secureTextEntry={secure && !showPassword}
          placeholderTextColor="#999"
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          {...props}
        />

        {/* Ícones direitos (olho, status) */}
        <View style={localStyles.rightIcons}>
          {secure && (
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={localStyles.eyeButton}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}

          {statusIcon && (
            <Ionicons
              name={statusIcon}
              size={20}
              color={
                statusIcon === "checkmark-circle"
                  ? colors.success
                  : colors.danger
              }
              style={localStyles.statusIcon}
            />
          )}
        </View>
      </View>

      {/* Mensagem de erro */}
      {errors[field] && (
        <Text style={localStyles.errorText}>{errors[field]}</Text>
      )}

      {/* Requisitos (ex: para senha) */}
      {requirements.length > 0 && (
        <View style={localStyles.requirements}>
          {requirements.map((req, index) => (
            <Text key={index} style={localStyles.requirementText}>
              • {req}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

// Estilos locais para customização
const localStyles = StyleSheet.create({
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  label: {
    fontWeight: "600",
    color: colors.darkGray,
  },
  required: {
    color: colors.danger,
    marginLeft: 3,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: colors.black,
    minHeight: 40, // Garante altura mínima para toque
  },
  icon: {
    marginRight: 10,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eyeButton: {
    padding: 5,
  },
  statusIcon: {
    marginLeft: 5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 5,
  },
  requirements: {
    marginTop: 8,
    marginLeft: 5,
  },
  requirementText: {
    color: colors.darkGray,
    fontSize: 12,
  },
  statusContainer: {
    paddingRight: 10,
  },
});

export default AuthInput;

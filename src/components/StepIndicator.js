// components/StepIndicator.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../views/styles";

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <View
            style={[
              styles.stepCircle,
              currentStep > index + 1 && styles.completedStep,
              currentStep === index + 1 && styles.currentStep,
            ]}
          >
            {currentStep > index + 1 ? (
              <Text style={styles.stepIcon}>✓</Text>
            ) : (
              <Text
                style={
                  currentStep === index + 1
                    ? [styles.stepNumber, { color: colors.white }]
                    : [styles.stepNumber]
                }
              >
                {index + 1}
              </Text>
            )}
          </View>
          <Text style={styles.stepLabel}>{step}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 25,
    paddingHorizontal: 10,
  },
  stepContainer: {
    alignItems: "center",
    width: 80,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  completedStep: {
    backgroundColor: colors.success,
  },
  currentStep: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    color: colors.black,
    fontWeight: "bold",
  },
  stepIcon: {
    color: colors.white,
    fontSize: 16,
  },
  stepLabel: {
    fontSize: 12,
    textAlign: "center",
    color: colors.darkGray,
    marginTop: 5,
  },
});

export default StepIndicator;

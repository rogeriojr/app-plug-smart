import { StyleSheet } from "react-native";

export const colors = {
  primary: "#0081f1",
  secondary: "#6170af",
  main: "#fea000",
  black: "#333333",
  white: "#FFFFFF",
  success: "#44C10C",
  background: "#F5F5F5",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginVertical: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.black,
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: colors.black,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: "#FFEBEE",
  },
  errorText: {
    color: colors.danger,
    marginTop: 5,
    marginLeft: 10,
    fontSize: 14,
  },
  requirements: {
    marginTop: 5,
    marginLeft: 10,
  },
  requirementText: {
    color: "#666",
    fontSize: 12,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: colors.primary,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  finishButton: {
    backgroundColor: colors.success,
  },
  disabledButton: {
    backgroundColor: "#CCC",
  },
  buttonText: {
    color: colors.white,
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: "600",
  },
});

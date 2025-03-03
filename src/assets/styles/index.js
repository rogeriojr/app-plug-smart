import { StyleSheet } from "react-native";
export const colors = {
  primary: "#0081f1",
  secondary: "#6170af",
  main: "#fea000",
  black: "#333333",
  white: "#FFFFFF",
  success: "#44C10C",
};
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    padding: 10,
    // width: '80%',
    borderRadius: 5,
    fontSize: 18,
    flex: 1,
    marginLeft: 10,
  },
  inputLabel: {
    marginVertical: 3,
    width: "90%",
    fontSize: 16,
  },
  button: {
    padding: 10,
    height: 44,
    borderRadius: 5,
    margin: 6,
    marginTop: 12,
    backgroundColor: colors.primary,
    width: "90%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    // fontSize: '22px',
    fontWeight: "bold",
  },
  buttonSecondary: {
    padding: 10,
    height: 44,
    borderRadius: 5,
    margin: 6,
    backgroundColor: colors.secondary,
    width: "90%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSecondaryText: {
    color: colors.white,
  },
  textButton: {
    margin: 6,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  textButtonText: {
    color: colors.black,
  },
  errorText: {
    color: colors.main,
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "700",
  },
  textButtonTextLink: {
    color: colors.main,
    fontWeight: "bold",
  },
  pageTitle: {
    color: "#333333",
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 10,
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 10,
  },
  inputWithIcon: {
    // flex: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    marginTop: 10,
  },
  buttonRow: {
    // flex: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
  },
  buttonFromRow: {
    padding: 10,
    height: 44,
    borderRadius: 5,
    margin: 6,
    backgroundColor: colors.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  rowButtonWithIcon: {
    // flex: 1,
    backgroundColor: colors.primary,
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 5,
    width: "90%",
    paddingHorizontal: 20,
    marginVertical: 6,
  },
  buttonWithIcon: {
    padding: 10,
    borderRadius: 5,
    margin: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: colors.black + "30",
    height: 100,
    width: "90%",
  },
  mainContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: colors.secondary,
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreview: { width: "90%", height: "50%", borderRadius: 10 },
  actionButtons: { flexDirection: "row", marginTop: 20 },
  cancelButton: { backgroundColor: "red", padding: 10, borderRadius: 5 },
  confirmButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
  },
});

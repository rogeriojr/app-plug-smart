import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { colors } from "../assets/styles";
import * as Location from "expo-location";
import QRCode from "../components/QRCode";
import accessServices from "../services/access";
import { useSelector } from "react-redux";
import Ionicons from "@expo/vector-icons/Ionicons";
import StandardModal from "../components/StandardModal";
import Header from "../components/Header";
import AcessosModal from "../components/AcessosModal";
import UserInfoModal from "../components/UserInfoModal";
import { Camera } from "expo-camera";
import CameraButtons from "../components/CameraButtons";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { logoutUser, updateUser } from "../../store/actions/users";
import { useDispatch } from "react-redux";
import usersServices from "../services/users";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const storePermission = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Erro ao salvar permissão ${key}:`, error);
  }
};

const getPermission = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    console.error(`Erro ao recuperar permissão ${key}:`, error);
    return null;
  }
};

const Home = () => {
  const user = useSelector((state) => (state?.user ? state.user : {}));
  const [userState, setUserState] = useState({ ...user });
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [toScan, setToScan] = useState(false);
  const [access, setAccess] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [acessosModal, setAcessosModal] = useState({
    visible: false,
    text: "",
  });
  const [userModal, setUserModal] = useState({ visible: false, text: "" });
  const [modalText, setModalText] = useState();
  const [isCamVisible, setIsCamVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [image, setImage] = useState(null);
  const [type, setType] = useState("back");
  const [cameraReady, setCameraReady] = useState(false);
  const dispatch = useDispatch();
  let cameraRef = useRef(null);

  const refreshAuthToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) {
        dispatch(logoutUser());
        return false;
      }

      const response = await usersServices.refreshToken(refreshToken);

      // Atualiza tokens na store e AsyncStorage
      await AsyncStorage.multiSet([
        ["authToken", response.newAuthToken],
        ["refreshToken", response.newRefreshToken],
      ]);

      dispatch(
        updateUser({
          ...user,
          authToken: response.newAuthToken,
          refreshToken: response.newRefreshToken,
        })
      );

      return true;
    } catch (error) {
      console.error("Erro na renovação do token:", error);
      dispatch(logoutUser());
      return false;
    }
  };

  useEffect(() => {
    console.log("User state atualizado");
    // console.log("User state atualizado:", user);
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoadingUser(true);
      console.log("Buscando dados atualizados do usuário...");

      if (!user?.authToken || !user?.usuario?._id) {
        console.log("Usuário não autenticado ou ID faltando");
        setLoadingUser(false);
        return;
      }

      const response = await usersServices.getUserById(user.usuario._id);

      const updatedUser = {
        usuario: response,
        authToken: user.authToken,
        refreshToken: user.refreshToken,
      };

      dispatch(updateUser(updatedUser));
      setLoadingUser(false);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setLoadingUser(false);
      if (error.response?.status === 401) {
        const tokenRefreshed = await refreshAuthToken();
        if (tokenRefreshed) {
          await fetchUserData(); // Tenta novamente com novo token
        } else {
          dispatch(logoutUser());
        }
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        if (isActive) {
          await fetchUserData();
          await handleGetAccess();
          await handleGetPermissions();
        }
      };

      loadData();
      return () => {
        isActive = false;
      };
    }, [])
  );

  useEffect(() => {
    if (!acessosModal.visible) {
      console.log("Modal de acessos fechado - atualizando...");
      const updateData = async () => {
        await fetchUserData();
        await handleGetAccess();
      };
      updateData();
    }
  }, [acessosModal.visible]);

  useEffect(() => {
    if (!userModal.visible) {
      fetchUserData();
    }
  }, [userModal.visible]);

  const handleUpdateUser = async (updatedUser) => {
    try {
      const response = await usersServices.update(
        user.usuario._id,
        updatedUser,
        user.authToken
      );

      dispatch(
        updateUser({
          ...user,
          usuario: response,
        })
      );
    } catch (error) {
      if (error.response?.status === 401) {
        const refreshed = await refreshAuthToken();
        if (refreshed) {
          await handleUpdateUser(updatedUser);
        }
      }
    }
  };

  const toggleCameraType = () => {
    setType((current) =>
      current === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const takePicture = async () => {
    try {
      if (!cameraRef.current) return;
      const photo = await cameraRef.current.takePictureAsync();
      const resizedUri = await resizeImage(photo.uri);
      if (resizedUri) {
        setImage(resizedUri);
        await uploadImageBase64(resizedUri);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Erro", "Falha ao capturar imagem");
    }
  };

  const uploadImageBase64 = async (imageUri) => {
    if (!imageUri) {
      Alert.alert("Erro", "Imagem não encontrada.");
      return;
    }

    try {
      setLoading(true);
      const imageBlob = await (await fetch(imageUri)).blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64data = reader.result.split(",")[1];
          await usersServices.updateImage(user?.usuario?.email, base64data);
          await fetchUserData();
          Alert.alert("Sucesso", "Imagem salva com sucesso!");
        } catch (error) {
          console.error("Erro ao enviar imagem:", error);
          Alert.alert("Erro", "Falha ao enviar a imagem.");
        } finally {
          setLoading(false);
        }
      };

      reader.readAsDataURL(imageBlob);
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      Alert.alert("Erro", "Falha ao processar a imagem.");
      setLoading(false);
    }
  };

  const handleGetAccess = async () => {
    try {
      console.log("Buscando histórico de acessos...");
      if (!user?.usuario?._id) return;

      const authToken = await AsyncStorage.getItem("authToken");
      const response = await accessServices.getAccessByUserId(
        user.usuario._id,
        authToken
      );

      console.log("Acessos recebidos:", response.length);
      setAccess(response);
    } catch (error) {
      console.error("Erro ao buscar acessos:", error);
      if (error.response?.status === 401) {
        const refreshed = await refreshAuthToken();
        if (!refreshed) return;
        await handleGetAccess();
      } else {
        Alert.alert("Erro", "Falha ao carregar histórico");
      }
    }
  };

  const resizeImage = async (uri) => {
    try {
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { height: 394, width: 177 } }],
        { compress: 0.2, format: SaveFormat.PNG }
      );
      return manipResult.uri;
    } catch (error) {
      console.error("Error resizing image:", error);
      return uri;
    }
  };

  const handleGetPermissions = async () => {
    const storedPermission = await getPermission("locationPermission");

    if (storedPermission === "granted") {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();

    await storePermission("locationPermission", status);

    if (status !== "granted") {
      setErrorMsg("Permissão para acessar localização foi negada.");
      setModalText("Erro: Permissão negada");
      setModalVisible(true);
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  const requestCameraPermissions = async () => {
    const storedPermission = await getPermission("cameraPermission");

    if (storedPermission === "granted") {
      return true;
    }

    const { status } = await Camera.requestCameraPermissionsAsync();
    await storePermission("cameraPermission", status);

    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "É necessário acesso à câmera para esta funcionalidade"
      );
      return false;
    }
    return true;
  };

  const handleScanQRCode = async () => {
    const cameraPermission = await requestCameraPermissions();
    const locationPermission = await getPermission("locationPermission");

    if (cameraPermission && locationPermission === "granted") {
      setToScan(true);
    } else {
      Alert.alert(
        "Permissões necessárias",
        "Por favor, conceda permissões de câmera e localização para continuar."
      );
    }
  };

  useEffect(() => {
    if (errorMsg) {
      setModalText(errorMsg);
      setModalVisible(true);
    }
  }, [errorMsg]);

  useEffect(() => {
    setUserState({ ...user });
  }, [user]);

  const renderProfile = () => {
    try {
      const imgUsuario = user?.usuario?.imgUsuario;

      if (imgUsuario) {
        const imageUri = imgUsuario.startsWith("data:image/")
          ? imgUsuario
          : `data:image/png;base64,${imgUsuario}`;

        return (
          <Image
            source={{ uri: imageUri }}
            style={styles.profileImage}
            onError={(error) =>
              console.warn("Falha ao carregar imagem:", error)
            }
          />
        );
      }
    } catch (error) {
      console.error("Erro ao renderizar imagem:", error);
    }

    return (
      <View style={styles.profilePlaceholder}>
        <Ionicons name="person-outline" size={50} color="white" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loadingUser ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          {modalVisible && (
            <StandardModal
              visible={modalVisible}
              text={modalText}
              onClose={() => setModalVisible(false)}
            />
          )}
          {acessosModal?.visible && (
            <AcessosModal
              visible={acessosModal.visible}
              access={access}
              setVisible={() =>
                setAcessosModal({ ...acessosModal, visible: false })
              }
            />
          )}
          {userModal?.visible && (
            <UserInfoModal
              visible={userModal.visible}
              user={user}
              setVisible={() => setUserModal({ ...userModal, visible: false })}
              onUpdateUser={handleUpdateUser}
            />
          )}
          {!toScan ? (
            <>
              <Header
                onClickAccess={() =>
                  setAcessosModal({ ...acessosModal, visible: true })
                }
                onClickUser={() =>
                  setUserModal({ ...userModal, visible: true })
                }
              />

              <View style={styles.mainContent}>
                {isCamVisible ? (
                  <>
                    {image ? (
                      <Image
                        source={{ uri: image }}
                        style={styles.imagePreview}
                      />
                    ) : (
                      <Camera
                        ref={cameraRef}
                        style={StyleSheet.absoluteFillObject}
                        type={type}
                        onCameraReady={() => setCameraReady(true)}
                      >
                        <View style={{ flex: 1 }}>
                          <CameraButtons
                            visible={true}
                            onChangeCamera={toggleCameraType}
                            onTakePicture={takePicture}
                          />
                        </View>
                      </Camera>
                    )}

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setIsCamVisible(false)}
                      >
                        <Text style={styles.buttonText}>CANCELAR</Text>
                      </TouchableOpacity>

                      {image && (
                        <TouchableOpacity
                          style={styles.confirmButton}
                          onPress={() => handleUpdateUser(userState)}
                        >
                          <Text style={styles.buttonText}>CONFIRMAR</Text>
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="white"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                ) : (
                  <View style={styles.profileSection}>
                    <TouchableOpacity onPress={() => setIsCamVisible(true)}>
                      {renderProfile()}
                    </TouchableOpacity>
                    <Text style={styles.pageTitle}>
                      Olá, {user?.usuario?.nome}
                    </Text>
                  </View>
                )}

                {userState?.usuario?.status !== "ativo" && (
                  <View style={styles.warningContainer}>
                    <Text style={styles.warningTitle}>Atenção!</Text>
                    <Text style={styles.warningText}>Seu usuário está</Text>
                    <Text style={styles.warningStatus}>INATIVO</Text>
                    <Text style={styles.warningText}>
                      Ative-o para continuar.
                    </Text>

                    <TouchableOpacity
                      style={styles.activateButton}
                      onPress={() =>
                        setUserModal({ ...userModal, visible: true })
                      }
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="white"
                      />
                      <Text style={styles.buttonText}>Ativar Usuário</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!isCamVisible && (
                  <View style={styles.scanSection}>
                    <View style={styles.scanButtonContainer}>
                      <TouchableOpacity
                        style={styles.scanButton}
                        onPress={handleScanQRCode}
                      >
                        <Text style={styles.scanButtonText}>LER QR CODE</Text>
                        <Ionicons
                          name="qr-code"
                          size={36}
                          color={colors.white}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.scanInstructions}>
                      <Text style={styles.instructionText}>
                        Para acessar, basta{" "}
                        <Text style={styles.highlightText}>clicar</Text> no
                        botão acima e ler o QR Code.
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View
              style={{
                flex: 1,
                width: Dimensions.get("window").width * 1,
                height: Dimensions.get("window").height * 1,
              }}
            >
              <QRCode
                toScan={toScan}
                setToScan={setToScan}
                lat={location?.coords?.latitude ?? ""}
                long={location?.coords?.longitude ?? ""}
                accuracy={location?.coords?.accuracy ?? ""}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default Home;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 10,
  },
  warningContainer: {
    width: "100%",
    borderRadius: 15,
    backgroundColor: colors.white,
    padding: 20,
    alignItems: "center",
    marginVertical: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.danger,
    marginBottom: 5,
  },
  warningText: {
    color: colors.danger,
    fontSize: 16,
  },
  warningStatus: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.danger,
    marginVertical: 5,
  },
  activateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 15,
  },
  scanSection: {
    width: "100%",
    marginTop: 30,
  },
  scanButtonContainer: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    marginHorizontal: 20,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
  },
  scanButtonText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: "bold",
    marginRight: 15,
  },
  scanInstructions: {
    marginTop: 15,
    paddingHorizontal: 25,
  },
  instructionText: {
    fontSize: 16,
    color: colors.text,
    textAlign: "center",
  },
  highlightText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  imagePreview: {
    width: "100%",
    height: "70%",
    borderRadius: 10,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: colors.danger,
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: colors.success,
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 5,
  },
  qrCodeContainer: {
    flex: 1,
    width: windowWidth,
    height: windowHeight,
  },
});

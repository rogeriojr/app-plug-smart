import React, { useState, useEffect, forwardRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import Ionicons from "@expo/vector-icons/Ionicons";
import Modal from "react-native-modal";
import { colors } from "../assets/styles";

const ViewCamera = forwardRef(({ onCapture, onRetake, navigation }, ref) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState("front");
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const cameraRef = React.useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos acessar sua câmera para a verificação facial",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    })();
  }, []);

  const handleTakePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsLoading(true);
      const photo = await cameraRef.current.takePictureAsync();

      // Adicionar base64: true para gerar a string base64
      const processedPhoto = await manipulateAsync(
        photo.uri,
        [{ resize: { width: 500 } }],
        {
          compress: 0.7,
          format: SaveFormat.JPEG,
          base64: true, // Gerar base64
        }
      );

      // Enviar a string completa via onCapture
      onCapture(`data:image/jpeg;base64,${processedPhoto.base64}`);
      setCapturedImage(processedPhoto.uri);
    } catch (error) {
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setShowError(false);
    onRetake();
  };

  function toggleCameraType() {
    setCameraType((current) => (current === "back" ? "front" : "back"));
  }

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={localStyles.errorContainer}>
        <Text style={localStyles.errorText}>Acesso à câmera não permitido</Text>
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      {!capturedImage ? (
        <CameraView
          ref={cameraRef}
          style={localStyles.camera}
          facing={cameraType}
          ratio="16:9"
        >
          <View style={localStyles.buttonContainer}>
            <TouchableOpacity
              style={localStyles.switchButton}
              onPress={toggleCameraType}
            >
              <Ionicons name="camera-reverse" size={32} color={colors.white} />
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <Image source={{ uri: capturedImage }} style={localStyles.preview} />
      )}

      <View style={localStyles.controls}>
        {!capturedImage ? (
          <TouchableOpacity
            style={localStyles.captureButton}
            onPress={handleTakePicture}
            disabled={isLoading}
          >
            <Ionicons name="camera" size={40} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={localStyles.retakeContainer}>
            <TouchableOpacity
              style={[localStyles.button, localStyles.retakeButton]}
              onPress={handleRetake}
            >
              <Ionicons name="refresh" size={24} color={colors.white} />
              <Text style={localStyles.buttonText}>Tirar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal isVisible={isLoading}>
        <View style={localStyles.loadingModal}>
          <Ionicons name="camera" size={40} color={colors.primary} />
          <Text style={localStyles.modalText}>Processando imagem...</Text>
        </View>
      </Modal>

      <Modal isVisible={showError}>
        <View style={localStyles.errorModal}>
          <Ionicons name="alert-circle" size={40} color={colors.danger} />
          <Text style={localStyles.modalText}>Erro ao capturar imagem!</Text>
          <TouchableOpacity
            style={localStyles.modalButton}
            onPress={() => setShowError(false)}
          >
            <Text style={localStyles.modalButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
});

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    borderRadius: 15,
    overflow: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  camera: {
    flex: 1,
  },
  preview: {
    flex: 1,
    borderRadius: 15,
  },
  buttonContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 10,
  },
  controls: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
  },
  captureButton: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    padding: 20,
    elevation: 5,
  },
  retakeContainer: {
    flexDirection: "row",
    gap: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 3,
  },
  retakeButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: colors.white,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  loadingModal: {
    backgroundColor: colors.white,
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
  },
  errorModal: {
    backgroundColor: colors.white,
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
  },
  modalText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: "center",
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.danger + "20",
  },
  errorText: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ViewCamera;

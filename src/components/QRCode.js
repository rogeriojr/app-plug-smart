import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { colors, styles } from "../assets/styles";
import accessServices from "../services/access";
import { calcularIdade } from "../services/utils";
import { useSelector } from "react-redux";
import Modal from "react-native-modal";
import CloseButton from "./CloseButton";

function ModalLoading({ visible }) {
  return (
    <Modal isVisible={visible}>
      <View style={modalStyles.container}>
        <ActivityIndicator size="large" color={colors.success} />
        <Text style={modalStyles.text}>Abrindo porta, aguarde...</Text>
      </View>
    </Modal>
  );
}

export default function QRCode({ toScan, setToScan, lat, long, accuracy }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [oppeningDoor, setOppeningDoor] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [closeButtonVisible, setCloseButtonVisible] = useState(true);
  const user = useSelector((state) => state.user);

  const getBarCodeScannerPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === "granted");
  };

  useEffect(() => {
    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    setToScan(false);
    setQrCodeData(data);
    await openDoor(data);
  };

  const openDoor = async (doorQrCode) => {
    try {
      // Verificação frontal do usuário desabilitado
      if (user?.usuario?.desabilitarUsuario) {
        Alert.alert(
          "Erro",
          "Este usuário está bloqueado e não pode realizar esta ação."
        );
        return;
      }

      setOppeningDoor(true);

      const response = await accessServices.access({
        qrCode: doorQrCode,
        usuarioId: user?.usuario._id,
        idade: calcularIdade(user?.usuario?.dataDeNascimento) || "12",
        lat,
        long,
        accuracy,
        status: "true",
      });
      console.log(response, "response");
      console.log(response.data, "response.data");
      // Verificação de sucesso com base nos códigos de status da resposta
      if (response.data.travaId) {
        const porta =
          doorQrCode.split("acesso_com_auto_ligamento/")[1] || "desconhecida";
        Alert.alert("Porta aberta!", `Porta ${porta} aberta com sucesso!`);
      }

      // Caso a resposta seja diferente de 200 ou 201, mas ainda contenha um erro
      else if (response?.data?.error || response?.data?.message) {
        const errorMessage =
          response?.data?.message ||
          response?.data?.error ||
          "Erro ao processar a solicitação";
        Alert.alert("Erro", errorMessage);
      }
      // Se o status da resposta for diferente, mas não for um erro esperado
      else {
        Alert.alert("Erro", "Erro inesperado ao acessar a porta");
      }
    } catch (error) {
      // Caso ocorra um erro de rede ou resposta não 2xx
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Erro inesperado ao acessar a porta";

      Alert.alert("Erro", errorMessage);
    } finally {
      setOppeningDoor(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={permissionStyles.container}>
        <Text style={permissionStyles.text}>
          Solicitando permissão para acessar a câmera...
        </Text>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={permissionStyles.container}>
        <Text style={permissionStyles.text}>
          Acesso à câmera não concedido. Por favor, habilite a câmera nas
          configurações do dispositivo.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ ...styles.container, width: "100%" }}>
      <ModalLoading visible={oppeningDoor} />
      {toScan && (
        <>
          <BarCodeScanner
            onBarCodeScanned={toScan ? handleBarCodeScanned : undefined}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={qrCodeStyles.text}>
            Aponte para o QR Code ao lado da porta
          </Text>
          <CloseButton
            onClose={() => setToScan(false)}
            visible={closeButtonVisible}
            isQrCode
          />
        </>
      )}
      <View style={qrCodeStyles.scannerBox} />
    </View>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: colors.dark,
    textAlign: "center",
  },
});

const permissionStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 18,
    color: colors.dark,
    textAlign: "center",
    marginBottom: 20,
  },
});

const qrCodeStyles = StyleSheet.create({
  text: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    textShadowColor: "#333",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  scannerBox: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").width * 0.9,
    borderColor: colors.success,
    borderWidth: 5,
    borderRadius: 10,
  },
});

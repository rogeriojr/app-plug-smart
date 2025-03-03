import React from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import { colors } from "../assets/styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Linking from "expo-linking";

// Função para formatar datas, com validação de entrada
const formatDate = (dateString) => {
  if (!dateString || isNaN(new Date(dateString).getTime())) {
    console.warn("Data inválida fornecida:", dateString);
    return "Data inválida";
  }
  const data = new Date(dateString);
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  const hora = String(data.getHours()).padStart(2, "0");
  const minutos = String(data.getMinutes()).padStart(2, "0");
  const segundos = String(data.getSeconds()).padStart(2, "0");

  return `${dia}/${mes}/${ano} ${hora}:${minutos}:${segundos}`;
};

// Função para abrir o mapa
const openInMaps = (latitude, longitude) => {
  if (!latitude || !longitude) {
    Alert.alert("Erro", "Coordenadas inválidas.");
    return;
  }

  const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
  Linking.openURL(url).catch(() => {
    Alert.alert("Erro", "Não foi possível abrir o mapa.");
  });
};

// Componente para exibir os detalhes de um acesso
const Acesso = ({ data }) => {
  const travaId = data?.travaId?.deviceId ?? "N/A";
  const latitude = data?.lat ?? null;
  const longitude = data?.long ?? null;
  const date = data?.data ? formatDate(data.data) : "Data não disponível";

  return (
    <View style={stylesLocal.acessoItem}>
      <Text>ID da Trava: {String(travaId)}</Text>
      <Text>Latitude: {String(latitude || "Não disponível")}</Text>
      <Text>Longitude: {String(longitude || "Não disponível")}</Text>
      <Text>Data: {String(date)}</Text>

      {latitude && longitude && (
        <TouchableOpacity
          style={stylesLocal.mapButton}
          onPress={() => openInMaps(latitude, longitude)}
        >
          <Text style={stylesLocal.mapButtonText}>Abrir no mapa</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Componente principal para exibir o modal de acessos
export default function AcessosModal({ visible, access, setVisible }) {
  console.log("Acessos:", access);
  return (
    <Modal
      isVisible={visible}
      style={stylesLocal.modal}
      onBackdropPress={setVisible} // Fecha ao clicar fora
    >
      <View style={stylesLocal.modalContainer}>
        <TouchableOpacity style={stylesLocal.closeButton} onPress={setVisible}>
          <Ionicons name="close" size={30} color={colors.black} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={stylesLocal.scrollContent}
        >
          <Text style={stylesLocal.pageTitle}>Meus Acessos</Text>
          {Array.isArray(access) && access.length > 0 ? (
            access
              .slice() // Cria uma cópia do array
              .reverse() // Reverte sem modificar o array original
              .map((item, index) => (
                <Acesso key={item?._id || index} data={item} />
              ))
          ) : (
            <Text style={stylesLocal.noAccessText}>
              Nenhum acesso encontrado.
            </Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// Estilos locais do componente
const stylesLocal = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "95%",
    maxHeight: "95%",
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  scrollContent: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  acessoItem: {
    width: "100%",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
    borderRadius: 10,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 10,
  },
  noAccessText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 10,
    textAlign: "center",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginVertical: 15,
  },
  mapButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
  },
  mapButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

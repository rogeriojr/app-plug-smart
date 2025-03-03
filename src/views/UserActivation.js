import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../assets/styles";
import usersServices from "../services/users";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserActivation = ({ route }) => {
  const navigation = useNavigation();
  const user = useSelector((state) => state.user);
  const [email, setEmail] = useState(""); // E-mail para ativação
  const [code, setCode] = useState(""); // Código inserido pelo usuário
  const [isLoading, setIsLoading] = useState(false); // Controle de carregamento
  const [timeRemaining, setTimeRemaining] = useState(30); // Contador para reenviar código
  const [canResend, setCanResend] = useState(false); // Habilita botão de reenvio
  const [hasRequestedActivation, setHasRequestedActivation] = useState(false); // Controle de solicitação

  // Controla o contador para habilitar o botão de reenviar
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeRemaining]);

  // Obtém o e-mail e solicita o código automaticamente
  useEffect(() => {
    const initializeEmailAndRequestCode = async () => {
      if (hasRequestedActivation) return; // Evita solicitações repetidas

      try {
        const emailFromRoute = route.params?.email; // E-mail passado via navegação
        const emailFromRedux = user?.usuario?.email; // E-mail armazenado no Redux
        const emailFromStorage = await AsyncStorage.getItem("email"); // E-mail salvo no dispositivo

        // Define o e-mail pela prioridade: route.params > Redux > AsyncStorage
        const finalEmail = emailFromRoute || emailFromRedux || emailFromStorage;

        if (finalEmail) {
          setEmail(finalEmail);
          console.log("E-mail utilizado para ativação:", finalEmail);

          // Solicita o código de ativação
          await handleRequestActivate(finalEmail);

          // Salva o e-mail no AsyncStorage para futuras sessões
          if (!emailFromStorage || emailFromStorage !== finalEmail) {
            await AsyncStorage.setItem("email", finalEmail);
          }

          setHasRequestedActivation(true); // Evita futuras execuções desnecessárias
        } else {
          Alert.alert(
            "Erro",
            "Não foi possível recuperar o e-mail. Por favor, faça login novamente."
          );
          navigation.navigate("Login");
        }
      } catch (error) {
        console.error("Erro ao inicializar:", error);
        Alert.alert("Erro", "Falha ao configurar a ativação.");
      }
    };

    initializeEmailAndRequestCode();
  }, [route.params?.email, user?.usuario?.email]);

  // Solicita o código de ativação
  const handleRequestActivate = async (email) => {
    try {
      const response = await usersServices.requestActivateUser(email);
      if (response.message === "Código de ativação enviado com sucesso") {
        console.log("Código de ativação solicitado com sucesso para:", email);
      } else {
        throw new Error(response.message || "Erro ao solicitar o código.");
      }
    } catch (error) {
      console.error("Erro ao solicitar ativação:", error);
      // Alert.alert("Erro", "Falha ao solicitar o código. Tente novamente.");
    }
  };

  // Ativa o usuário com o código fornecido
  const handleActivate = async () => {
    if (code.trim().length === 0) {
      Alert.alert("Erro", "Por favor, insira o código.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await usersServices.activateUser(email, code);
      console.log("Resposta da ativação:", response);

      if (route.params?.register && response.status === 200) {
        navigation.navigate("Login", {
          email: route.params?.email,
          senha: route.params?.senha,
        });
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível ativar a conta. Verifique o código."
        );
      }
    } catch (error) {
      console.error("Erro na ativação:", error.message);
      Alert.alert(
        "Erro",
        "Não foi possível ativar a conta. Verifique o código."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reenvia o código de ativação
  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      setCanResend(false);
      setTimeRemaining(30); // Reinicia o contador
      const response = await usersServices.requestActivateUser(email);

      if (response?.message === "Código de ativação enviado com sucesso") {
        Alert.alert("Sucesso", "O código foi reenviado para o seu Celular.");
      } else {
        throw new Error(response.message || "Erro ao reenviar o código.");
      }
    } catch (error) {
      console.error("Erro ao reenviar código:", error);
      Alert.alert(
        "Erro",
        "Não foi possível reenviar o código. Tente novamente."
      );
      setCanResend(true);
    }
  };

  const handleCancel = () => {
    navigation.navigate(route.params?.register ? "Login" : "Home");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={80}
          color={colors.primary}
        />
        <Text style={styles.title}>Ativação de Usuário</Text>
        <Text style={styles.instructions}>
          Insira o código enviado para o Seu celular.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Código SMS"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleActivate}
          disabled={isLoading}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="white" />
          <Text style={styles.buttonText}>Ativar Usuário</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendCode}
          disabled={!canResend}
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color={canResend ? colors.primary : "#aaa"}
          />
          <Text
            style={[
              styles.resendButtonText,
              { color: canResend ? colors.primary : "#aaa" },
            ]}
          >
            Reenviar Código {timeRemaining > 0 && `(${timeRemaining}s)`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  content: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 15,
  },
  instructions: {
    fontSize: 16,
    color: colors.text,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 5,
    padding: 10,
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success,
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    marginLeft: 8,
  },
  resendButton: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  resendButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  cancelButtonText: {
    marginLeft: 8,
    fontSize: 18,
    color: colors.primary,
  },
});

export default UserActivation;

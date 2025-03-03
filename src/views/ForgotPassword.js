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

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [step, setStep] = useState(1); // Controla os steps (1 = email, 2 = código)

  // Controla o temporizador para reenviar o código
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeRemaining]);

  // Enviar código de recuperação para o email
  const handleSendEmail = async () => {
    if (!email.trim()) {
      Alert.alert("Erro", "Por favor, insira o email.");
      return;
    }

    setIsLoading(true);
    try {
      await usersServices.sendActivationCode(email); // Altere para endpoint de recuperação se necessário
      Alert.alert(
        "Sucesso",
        "Um código foi enviado via sms para o seu telefone. Por favor, insira-o para continuar."
      );
      setStep(2); // Avança para a próxima etapa
    } catch (error) {
      console.error("Erro ao enviar código:", error);
      Alert.alert("Erro", "Não foi possível enviar o sms. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar o código de recuperação
  const handleConfirmCode = async () => {
    if (!code.trim()) {
      Alert.alert("Erro", "Por favor, insira o código.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await usersServices.confirmCodeForgot(email, code); // Endpoint para verificar o código
      if (
        response.status === "success" ||
        response.status === "ok" ||
        response.status === 200
      ) {
        Alert.alert("Sucesso", "Código verificado com sucesso!");
        navigation.navigate("UpdatePassword", { email, code });
      } else {
        Alert.alert("Erro", response.message || "Código inválido.");
      }
    } catch (error) {
      console.error("Erro ao verificar código:", error);
      Alert.alert("Erro", "Não foi possível verificar o código.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar o código
  const handleResendCode = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      setCanResend(false);
      setTimeRemaining(30); // Reinicia o temporizador
      await usersServices.sendActivationCode(email); // Reenvia o código para o email
      Alert.alert("Código Enviado", "O código foi reenviado para o seu email.");
    } catch (error) {
      console.error("Erro ao reenviar código:", error);
      Alert.alert("Erro", "Não foi possível reenviar o código.");
    } finally {
      setIsLoading(false);
    }
  };

  // Voltar para a tela inicial de recuperação
  const handleCancel = () => {
    navigation.navigate("Login");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Ionicons name="key-outline" size={80} color={colors.primary} />
        <Text style={styles.title}>
          {step === 1 ? "Recuperação de Senha" : "Confirmação do Código"}
        </Text>

        {step === 1 && (
          <>
            <Text style={styles.instructions}>
              Insira o email associado à sua conta. Enviaremos um código para
              recuperação.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Seu email"
              value={email}
              onChangeText={(text) => setEmail(text.toLowerCase())}
              keyboardType="email-address"
            />
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSendEmail}
              disabled={isLoading}
            >
              <Ionicons name="mail-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.instructions}>
              Insira o código enviado para o seu email para confirmar a
              recuperação.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Código"
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleConfirmCode}
              disabled={isLoading}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="white"
              />
              <Text style={styles.buttonText}>Confirmar Código</Text>
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
          </>
        )}

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={styles.cancelButtonText}>Voltar</Text>
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

export default ForgotPassword;

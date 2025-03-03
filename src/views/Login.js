import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { colors, styles } from "../assets/styles";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import usersServices from "../services/users";
import { logoutUser, updateUser } from "../../store/actions/users";
import logo from "../assets/images/pegpag-logo.jpeg";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = ({ route }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    setErrorMessage("");
  }, []);

  useEffect(() => {
    if (route.params?.email && route.params?.senha) {
      setEmail(route.params.email);
      setPassword(route.params.senha);
      setTimeout(
        () => handleLogin(route.params.email, route.params.senha),
        500
      ); // Aguarda para garantir atualização do estado
    }
  }, [route]);

  const clearStorageAndLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("refreshToken");
      dispatch(logoutUser()); // Despacha ação de logout no Redux
    } catch (error) {
      console.error("Erro ao limpar o armazenamento:", error);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);

      if (!email || !password) {
        setErrorMessage("Preencha todos os campos");
        setTimeout(() => setErrorMessage(""), 3000);
        setIsLoading(false);
        return;
      }

      const response = await usersServices.login(email, password);

      if (response?.error || !response.usuario) {
        throw new Error(
          response?.error || "Erro ao fazer login. Verifique os dados."
        );
      }

      const { authToken } = response.usuario;
      if (authToken) {
        await AsyncStorage.setItem("authToken", authToken);
        dispatch(updateUser(response));
        navigation.navigate("Home");
      } else {
        throw new Error("Token inválido recebido.");
      }
    } catch (error) {
      console.error("Erro no login:", error.response.data.error);
      await clearStorageAndLogout();

      let customErrorMessage = "Erro ao fazer login. Tente novamente.";
      if (error.response.data.error.includes("Usuário bloqueado")) {
        customErrorMessage =
          "Usuário desabilitado. Entre em contato com o suporte.";
      } else if (error.response.data.error.includes("Conta inativa")) {
        customErrorMessage = "Sua conta precisa ser ativada.";
      } else if (error.response.data.error.includes("Credenciais inválidas")) {
        customErrorMessage = "Senha incorreta. Verifique suas credenciais.";
      }

      setErrorMessage(customErrorMessage);
      setTimeout(() => setErrorMessage(""), 30000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Image source={logo} style={[styles.logo, { marginBottom: 20 }]} />
      {isLoading && <Text style={styles.pageTitle}>Carregando...</Text>}
      {isLoading && <ActivityIndicator />}
      {!isLoading && (
        <>
          <Text style={styles.pageTitle}>Login</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons name="mail" size={32} color={colors.primary} />
            <TextInput
              style={styles.input}
              onChangeText={setEmail}
              value={email}
              placeholder="E-mail"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputWithIcon}>
            <Ionicons name="lock-closed" size={32} color={colors.primary} />
            <TextInput
              style={styles.input}
              onChangeText={setPassword}
              value={password}
              placeholder="Senha"
              autoCapitalize="none"
              secureTextEntry
            />
          </View>
          {errorMessage !== "" && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.textButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.textButtonText}>Ainda não é cadastrado? </Text>
            <Text style={styles.textButtonTextLink}>Clique aqui </Text>
            <Text style={styles.textButtonText}>e realize o seu cadastro.</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.textButton}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={[styles.textButtonTextLink, { color: "#0081f1" }]}>
              Esqueci minha senha
            </Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

export default Login;

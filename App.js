import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";

import { store, persistor } from "./store";
import Login from "./src/views/Login";
import Register from "./src/views/Register";
import Home from "./src/views/Home";
import UserActivation from "./src/views/UserActivation";
import ForgotPassword from "./src/views/ForgotPassword";
import UpdatePassword from "./src/views/UpdatePassword";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true); // Controla o carregamento inicial
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Controla a autenticação do usuário

  // Solicitação de permissão de rastreamento
  useEffect(() => {
    const requestPermission = async () => {
      Alert.alert(
        "Por que precisamos da sua permissão?",
        "Utilizamos permissões de rastreamento, localização e imagens para garantir a segurança do usuário e verificar se ele está utilizando a trava correta no local adequado. Isso impede acessos não autorizados e melhora sua experiência.",
        [
          {
            text: "Entendi",
            onPress: async () => {
              const { status } = await requestTrackingPermissionsAsync();
              if (status === "granted") {
                console.log("Permissão de rastreamento concedida.");
              } else {
                console.log("Permissão de rastreamento negada.");
              }
            },
          },
        ]
      );
    };

    requestPermission();
  }, []);

  // Verificar se o token está salvo no AsyncStorage
  useEffect(() => {
    const checkAuthToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        setIsAuthenticated(!!token); // Define autenticação como verdadeira se o token existir
      } catch (error) {
        console.error("Erro ao verificar o token:", error);
      } finally {
        setIsLoading(false); // Finaliza o carregamento inicial
      }
    };

    checkAuthToken();
  }, []);

  // Exibe tela de carregamento enquanto a autenticação está sendo verificada
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate
        loading={<ActivityIndicator size="large" />}
        persistor={persistor}
      >
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={isAuthenticated ? "Home" : "Login"}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="UserActivation" component={UserActivation} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="UpdatePassword" component={UpdatePassword} />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

// Estilos básicos para a tela de carregamento
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});

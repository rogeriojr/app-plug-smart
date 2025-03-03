import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import { colors } from "../assets/styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { logoutUser } from "../../store/actions/users";
import UserController from "../services/users";
import * as Linking from "expo-linking";
import { formatarCPF, removerMascara } from "../../utils/validations";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserInfoModal = ({ visible, user, setVisible }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    usuario: {
      cpf: "",
      telefone: "",
      nome: "",
      dataDeNascimento: "",
      email: "",
    },
  });

  const [isInternational, setIsInternational] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    setVisible(false);
    navigation.navigate("Login");
  };

  // Função para formatar a data durante a digitação
  const formatarDataInput = (text) => {
    // Remove caracteres não numéricos e limita a 8 dígitos
    let cleaned = text.replace(/\D/g, "").slice(0, 8);

    // Aplica a máscara DD/MM/YYYY
    const parts = [];
    if (cleaned.length > 0) parts.push(cleaned.slice(0, 2));
    if (cleaned.length > 2) parts.push(cleaned.slice(2, 4));
    if (cleaned.length > 4) parts.push(cleaned.slice(4, 8));

    return parts.join("/");
  };

  // Função atualizada para formatar a data final
  const formatarDataBR = (data) => {
    if (!data) return "";

    // Se já estiver no formato DD/MM/YYYY
    if (typeof data === "string" && data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return data;
    }

    try {
      const date = new Date(data);
      if (isNaN(date)) return "";

      const dia = String(date.getDate()).padStart(2, "0");
      const mes = String(date.getMonth() + 1).padStart(2, "0");
      return `${dia}/${mes}/${date.getFullYear()}`;
    } catch {
      return "";
    }
  };

  const limparTelefone = (telefone) => telefone.replace(/\D/g, "");

  const handleDeleteUser = async () => {
    try {
      const userId = user?.usuario?._id;
      if (!userId) {
        Alert.alert("Erro", "Usuário não encontrado.");
        return;
      }

      // Obtém o token antes da requisição
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      // Agora passamos o token para o controlador
      await UserController.deleteAccount(userId, token);

      Alert.alert(
        "Sucesso",
        "Sua solicitação foi registrada. Todos os seus dados serão excluídos permanentemente em até 90 dias."
      );

      setVisible(false);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      Alert.alert("Erro", "Não foi possível excluir a conta.");
    }
  };

  const handleSave = async () => {
    try {
      const usuario = formData?.usuario;

      if (!usuario) {
        throw new Error("Dados do usuário estão incompletos.");
      }

      const dataToSend = {
        _id: user?.usuario?._id,
        cpf: removerMascara(usuario.cpf || ""),
        telefone: limparTelefone(usuario.telefone),
        nome: usuario.nome,
        nome: usuario.nome,
        dataDeNascimento: usuario.dataDeNascimento
          .split("/")
          .reverse()
          .join("-"),
        email: usuario.email,
        tipo: "comum",
      };

      const response = await UserController.update(
        user?.usuario?._id,
        dataToSend
      );
      if (response) {
        Alert.alert("Sucesso", "Dados atualizados com sucesso.");
        setFormData((prev) => ({
          ...prev,
          usuario: { ...usuario },
        }));
        setIsEditing(false);
      } else {
        throw new Error("Erro ao atualizar os dados. Verifique a API.");
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        error.message || "Não foi possível salvar as alterações."
      );
    }
  };

  const handlePasswordChange = () => {
    // ADICIONAR SUA API
    Linking.openURL("https://plugsmart.com/alterar-senha");
  };

  const renderInput = (
    label,
    value,
    key,
    isDisabled = false,
    customOnChange
  ) => (
    <View style={stylesLocal.inputContainer}>
      <Text style={stylesLocal.inputLabel}>{label}:</Text>
      <TextInput
        value={value || ""}
        editable={!isDisabled && isEditing}
        onChangeText={
          customOnChange ||
          ((text) =>
            setFormData((prev) => ({
              ...prev,
              usuario: {
                ...prev.usuario,
                [key]: text,
              },
            })))
        }
        style={[
          stylesLocal.input,
          isDisabled && stylesLocal.disabledInput,
          !isEditing && stylesLocal.disabledInput,
        ]}
        keyboardType={
          key === "telefone" || key === "cpf" ? "numeric" : "default"
        }
        maxLength={key === "dataDeNascimento" ? 10 : undefined}
      />
    </View>
  );

  const renderPhoneInput = () => {
    const formatarTelefoneNacional = (text) => {
      // Remove todos os caracteres não numéricos
      const apenasNumeros = text.replace(/\D/g, "");

      // Remove o prefixo "+55" ou "55" inicial, se presente
      const semPrefixo = apenasNumeros.startsWith("55")
        ? apenasNumeros.slice(2)
        : apenasNumeros;

      // Formata o número restante
      if (semPrefixo.length <= 2) return `+55 (${semPrefixo}`;
      if (semPrefixo.length <= 7)
        return `+55 (${semPrefixo.slice(0, 2)}) ${semPrefixo.slice(2)}`;
      if (semPrefixo.length <= 11)
        return `+55 (${semPrefixo.slice(0, 2)}) ${semPrefixo.slice(
          2,
          7
        )}-${semPrefixo.slice(7)}`;
      return `+55 (${semPrefixo.slice(0, 2)}) ${semPrefixo.slice(
        2,
        7
      )}-${semPrefixo.slice(7, 11)}`;
    };

    const formatarTelefoneInternacional = (text) => {
      const apenasNumeros = text.replace(/\D/g, "");
      return `+${apenasNumeros}`;
    };

    const formatarTelefone = (text) =>
      isInternational
        ? formatarTelefoneInternacional(text)
        : formatarTelefoneNacional(text);

    const handleChangeText = (text) => {
      const formattedText = formatarTelefone(text);
      setFormData((prev) => ({
        ...prev,
        usuario: {
          ...prev.usuario,
          telefone: formattedText,
        },
      }));
    };

    return (
      <View style={stylesLocal.inputContainer}>
        <Text style={stylesLocal.inputLabel}>Telefone:</Text>
        <TextInput
          value={formData.usuario.telefone}
          editable={isEditing}
          onChangeText={handleChangeText}
          style={[stylesLocal.input, !isEditing && stylesLocal.disabledInput]}
          keyboardType="phone-pad"
          placeholder={
            isInternational
              ? "Digite o número internacional"
              : "+55 (00) 00000-0000"
          }
        />
        {isEditing && (
          <>
            <View style={stylesLocal.checkboxContainer}>
              <Text style={stylesLocal.checkboxLabel}>
                Número Internacional
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsInternational((prev) => !prev);
                  setFormData((prev) => ({
                    ...prev,
                    usuario: {
                      ...prev.usuario,
                      telefone: "",
                    },
                  }));
                }}
                style={stylesLocal.checkbox}
              >
                <Ionicons
                  name={isInternational ? "checkbox" : "square-outline"}
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
            {!isInternational && (
              <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                Para números nacionais, o código +55 deve ser mantido.
              </Text>
            )}
          </>
        )}
      </View>
    );
  };

  useEffect(() => {
    if (user) {
      const limparTelefone = (telefone) => telefone.replace(/\D/g, ""); // Remove caracteres não numéricos
      const formatarTelefoneNacional = (telefone) => {
        const apenasNumeros = limparTelefone(telefone);

        // Remove o prefixo "55", se presente
        const semPrefixo = apenasNumeros.startsWith("55")
          ? apenasNumeros.slice(2)
          : apenasNumeros;

        // Formata o número nacional
        if (semPrefixo.length <= 2) return `+55 (${semPrefixo}`;
        if (semPrefixo.length <= 7)
          return `+55 (${semPrefixo.slice(0, 2)}) ${semPrefixo.slice(2)}`;
        return `+55 (${semPrefixo.slice(0, 2)}) ${semPrefixo.slice(
          2,
          7
        )}-${semPrefixo.slice(7, 11)}`;
      };

      setFormData({
        usuario: {
          ...user.usuario,
          cpf: formatarCPF(user.usuario.cpf || ""),
          telefone: user.usuario.telefone
            ? formatarTelefoneNacional(user.usuario.telefone)
            : "+55 ",
          dataDeNascimento: formatarDataBR(user.usuario.dataDeNascimento),
        },
      });
    }
  }, [user]);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={() => setVisible(false)}
      style={stylesLocal.modal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={stylesLocal.modalContainer}>
          <TouchableOpacity
            style={stylesLocal.closeButton}
            onPress={() => setVisible(false)}
          >
            <Ionicons name="close" size={30} color={colors.black} />
          </TouchableOpacity>

          <Text style={stylesLocal.pageTitle}>Meus dados</Text>
          <ScrollView contentContainerStyle={stylesLocal.scrollContent}>
            {renderInput("Nome", formData?.usuario?.nome, "nome")}
            {renderInput("CPF", formatarCPF(formData?.usuario?.cpf), "cpf")}
            {renderInput("E-mail", formData?.usuario?.email, "email", true)}
            {renderPhoneInput()}
            {renderInput(
              "Data de Nascimento",
              isEditing
                ? formData?.usuario?.dataDeNascimento // Mantém o valor formatado durante edição
                : formatarDataBR(formData?.usuario?.dataDeNascimento),
              "dataDeNascimento",
              false,
              (text) => {
                const formatted = formatarDataInput(text);
                setFormData((prev) => ({
                  ...prev,
                  usuario: {
                    ...prev.usuario,
                    dataDeNascimento: formatted,
                  },
                }));
              }
            )}

            <View style={stylesLocal.buttonsContainer}>
              {!isEditing ? (
                <TouchableOpacity
                  style={stylesLocal.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons name="pencil" size={20} color={colors.white} />
                  <Text style={stylesLocal.buttonText}>Editar</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={stylesLocal.cancelButton}
                    onPress={() => {
                      setFormData({ ...user });
                      setIsEditing(false);
                    }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={colors.white}
                    />
                    <Text style={stylesLocal.buttonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={stylesLocal.saveButton}
                    onPress={handleSave}
                  >
                    <Ionicons name="save" size={20} color={colors.white} />
                    <Text style={stylesLocal.buttonText}>Salvar</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <TouchableOpacity
              style={stylesLocal.passwordChangeButton}
              onPress={handlePasswordChange}
            >
              <Ionicons name="key" size={20} color={colors.primary} />
              <Text style={stylesLocal.passwordChangeText}>Alterar senha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={stylesLocal.deleteButton}
              onPress={() => {
                Alert.alert(
                  "Confirmação de Exclusão",
                  "Sua solicitação será processada e todos os seus dados serão excluídos permanentemente em até 90 dias. Deseja continuar?",
                  [
                    {
                      text: "Cancelar",
                      onPress: () => console.log("Exclusão cancelada"),
                      style: "cancel",
                    },
                    {
                      text: "Confirmar",
                      onPress: handleDeleteUser, // Chama a função para excluir
                    },
                  ],
                  { cancelable: false } // O alerta só fecha ao clicar em uma opção
                );
              }}
            >
              <Text style={stylesLocal.deleteText}>Excluir conta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={stylesLocal.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="red" />
              <Text style={stylesLocal.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>

            {/* {confirmDelete && (
              <View style={stylesLocal.confirmContainer}>
                <Text style={stylesLocal.confirmationText}>
                  Sua solicitação será processada e todos os seus dados serão excluídos permanentemente em até 90 dias.
                </Text>
                <View style={stylesLocal.confirmButtonContainer}>
                  <TouchableOpacity
                    style={stylesLocal.cancelButton}
                    onPress={() => setConfirmDelete(false)} // Fecha a confirmação
                  >
                    <Text style={stylesLocal.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={stylesLocal.confirmButton}
                    onPress={handleDeleteUser} // Chama a função de exclusão
                  >
                    <Text style={stylesLocal.buttonText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )} */}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const stylesLocal = StyleSheet.create({
  modal: {
    flex: 1,
    margin: 20,
    marginTop: "6%",
    marginRight: 0,
  },
  modalContainer: {
    width: "95%",
    height: "100%",
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 10,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 15,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: colors.text,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#aaa",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  passwordChangeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  passwordChangeText: {
    marginLeft: 8,
    fontSize: 18,
    color: colors.primary,
    textDecorationLine: "underline",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 18,
    color: "red",
  },
  deleteButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  deleteText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  checkboxLabel: {
    marginRight: 10,
    fontSize: 16,
    color: colors.text,
  },
  checkbox: {
    padding: 5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    marginLeft: 5,
  },
});

export default UserInfoModal;

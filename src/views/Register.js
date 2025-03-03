import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Camera } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import Ionicons from "@expo/vector-icons/Ionicons";
import Modal from "react-native-modal";
import { colors, styles } from "../views/styles";
import {
  validateStepFields,
  formatarCPF,
  checkEmailExists,
  registerUser,
  formatarTelefone,
  removerMascara,
  removerMascaraTel,
} from "../services/utils";
import AuthInput from "../components/AuthInput";
import ViewCamera from "../components/ViewCamera";
import AuthButton from "../components/AuthButton";
import StepIndicator from "../components/StepIndicator";
import { aplicarMascaraData, formatarDataEnvio } from "../../utils/validations";
import usersServices from "../services/users";

const Register = ({ navigation }) => {
  // Estados principais
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "+55", // Inicializa com +55 para números nacionais
    senha: "",
    confirmSenha: "",
    dataDeNascimento: "",
    imgUsuario: null,
    termos: false,
    isInternational: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  // Novo estado para rastrear campos que já receberam foco
  const [touchedFields, setTouchedFields] = useState({});

  // Refs para controle de foco e scroll
  const scrollViewRef = useRef(null);
  const inputsRef = useRef([]);
  const cameraRef = useRef(null);

  // Passos do formulário
  const steps = [
    "Dados de Acesso",
    "Inf. Pessoais",
    "Contato",
    "Verificação Facial",
    "Termos",
  ];

  // Atualiza o telefone quando mudar entre nacional e internacional
  useEffect(() => {
    if (formData.isInternational) {
      setFormData((prev) => ({ ...prev, telefone: "" }));
    } else {
      setFormData((prev) => ({ ...prev, telefone: "+55" }));
    }
  }, [formData.isInternational]);

  // Solicitar permissão da câmera ao montar
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos acessar sua câmera para a verificação facial"
        );
      }
    })();
  }, []);

  // Validação de campos customizada que substitui validateStepFields
  const validateCustomFields = (step, data) => {
    const stepErrors = {};

    switch (step) {
      case 1:
        // Validação do passo 1 - manter a lógica original do validateStepFields
        if (
          touchedFields.email &&
          (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        ) {
          stepErrors.email = "E-mail inválido";
        }

        if (
          touchedFields.senha &&
          (!data.senha ||
            data.senha.length < 8 ||
            !/[A-Z]/.test(data.senha) ||
            !/[a-z]/.test(data.senha) ||
            !/[0-9]/.test(data.senha) ||
            !/[^A-Za-z0-9]/.test(data.senha))
        ) {
          stepErrors.senha = "Senha não atende aos requisitos";
        }

        if (touchedFields.confirmSenha && data.senha !== data.confirmSenha) {
          stepErrors.confirmSenha = "As senhas não coincidem";
        }
        break;

      case 2:
        // Validação do passo 2
        if (touchedFields.nome && (!data.nome || data.nome.trim().length < 3)) {
          stepErrors.nome = "Nome inválido";
        }

        if (
          touchedFields.cpf &&
          (!data.cpf || data.cpf.replace(/\D/g, "").length !== 11)
        ) {
          stepErrors.cpf = "CPF inválido";
        }
        break;

      case 3:
        // Validação do passo 3 com lógica atualizada para telefone
        if (touchedFields.telefone) {
          if (data.isInternational) {
            // Para internacional, apenas verificar se não está vazio
            if (!data.telefone || data.telefone.trim() === "") {
              stepErrors.telefone = "Telefone inválido";
            }
          } else {
            // Para nacional, verificar o formato do número
            const numerosApenas = data.telefone.replace(/\D/g, "");
            // Descontando os 2 dígitos do código de país (+55), deve ter 10 ou 11 dígitos
            // (10 para telefones fixos ou 11 para celulares)
            const isValidLength =
              numerosApenas.length >= 10 && numerosApenas.length <= 13;

            if (!data.telefone || !isValidLength) {
              stepErrors.telefone = "Telefone inválido";
            }
          }
        }

        if (
          touchedFields.dataDeNascimento &&
          (!data.dataDeNascimento ||
            data.dataDeNascimento.replace(/\D/g, "").length !== 8)
        ) {
          stepErrors.dataDeNascimento = "Data inválida";
        }
        break;
    }

    return stepErrors;
  };

  useEffect(() => {
    const stepErrors = validateCustomFields(currentStep, formData);
    setErrors(stepErrors);
  }, [formData, currentStep, touchedFields]);

  // Foca no próximo campo ao pressionar 'próximo' no teclado
  const focusNextField = (nextField) => {
    inputsRef.current[nextField]?.focus();
  };

  // Função para marcar um campo como tocado/focado
  const handleFieldFocus = (field) => {
    if (!touchedFields[field]) {
      setTouchedFields((prev) => ({
        ...prev,
        [field]: true,
      }));
    }
  };

  // Validação em tempo real ao sair do campo
  const handleBlur = (field) => {
    // Garante que o campo está marcado como tocado
    if (!touchedFields[field]) {
      setTouchedFields((prev) => ({
        ...prev,
        [field]: true,
      }));
    }

    if (field === "email") {
      verifyEmailAvailability();
    }
  };

  // Validação geral do step atual
  const validateCurrentStep = () => {
    // Marcar todos os campos do step atual como tocados
    const fieldsByStep = {
      1: ["email", "senha", "confirmSenha"],
      2: ["nome", "cpf"],
      3: ["telefone", "dataDeNascimento"],
    };

    const currentStepFields = fieldsByStep[currentStep] || [];

    // Marcar todos os campos como tocados
    const newTouchedFields = { ...touchedFields };
    currentStepFields.forEach((field) => {
      newTouchedFields[field] = true;
    });
    setTouchedFields(newTouchedFields);

    // Revalidar com todos os campos marcados como tocados
    const stepErrors = validateCustomFields(currentStep, formData);
    setErrors(stepErrors);

    return Object.keys(stepErrors).length === 0;
  };

  // Navegação entre steps
  const handleStepNavigation = async (direction) => {
    // Valida campos antes de avançar
    if (direction === "next" && !validateCurrentStep()) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    // Verificação especial para email
    if (currentStep === 1 && direction === "next") {
      if (!(await verifyEmailAvailability())) return;
    }

    // Atualiza o step
    setCurrentStep((prev) => {
      const newStep = direction === "next" ? prev + 1 : prev - 1;
      return Math.max(1, Math.min(newStep, steps.length));
    });

    setErrors({});
  };

  // Verifica disponibilidade do email
  const verifyEmailAvailability = async () => {
    if (!formData.email || errors.email) return false;

    try {
      setIsLoading(true);
      const exists = await checkEmailExists(formData.email);
      setEmailStatus(exists ? "unavailable" : "available");

      if (exists) {
        setErrors((prev) => ({ ...prev, email: "E-mail já cadastrado" }));
        return false;
      }
      return true;
    } catch (error) {
      Alert.alert("Erro", "Falha na verificação do e-mail");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para formatar telefone dependendo do tipo (nacional ou internacional)
  const formatarTelefoneCustom = (value) => {
    if (formData.isInternational) {
      // Telefone internacional - sem formatação específica
      return value;
    } else {
      // Se o usuário apagar tudo, manter o prefixo +55
      if (value.trim() === "" || value === "+55") {
        return "+55";
      }

      // Remove caracteres não numéricos
      let cleaned = value.replace(/\D/g, "");

      // Se começar com 55, considere que é o código do país
      if (cleaned.startsWith("55") && cleaned.length > 2) {
        cleaned = cleaned.substring(2);
      }

      // Para entrada como 64981294566, garantimos que não tenha o 55 no início
      // para evitar duplicação quando formatarmos com o +55

      // Formata conforme o padrão brasileiro
      if (cleaned.length <= 2) {
        return `+55 (${cleaned}`;
      } else if (cleaned.length <= 7) {
        return `+55 (${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
      } else if (cleaned.length <= 11) {
        return `+55 (${cleaned.substring(0, 2)}) ${cleaned.substring(
          2,
          7
        )} - ${cleaned.substring(7)}`;
      } else {
        // Caso haja mais dígitos, limita ao tamanho máximo esperado
        return `+55 (${cleaned.substring(0, 2)}) ${cleaned.substring(
          2,
          7
        )} - ${cleaned.substring(7, 11)}`;
      }
    }
  };

  // Função para remover a formatação do telefone para envio à API
  const prepararTelefoneParaAPI = (telefone) => {
    if (formData.isInternational) {
      // Para telefone internacional, remove espaços e caracteres especiais
      return telefone.replace(/\s+/g, "").replace(/-/g, "");
    } else {
      // Para telefone nacional, formata como +55XXXXXXXXXX
      let numerosApenas = telefone.replace(/\D/g, "");

      // Se começar com 55, não adiciona novamente
      if (numerosApenas.startsWith("55")) {
        return "+" + numerosApenas;
      } else {
        return "+55" + numerosApenas;
      }
    }
  };

  // Log para debug
  const logTelefoneInfo = (telefone) => {
    const original = telefone;
    const preparado = prepararTelefoneParaAPI(telefone);
    const numerosApenas = telefone.replace(/\D/g, "");

    console.log("Telefone original:", original);
    console.log("Telefone preparado para API:", preparado);
    console.log("Apenas números:", numerosApenas);
    console.log("Comprimento apenas números:", numerosApenas.length);
  };

  // Solicita o código de ativação
  const handleRequestActivate = async (number) => {
    try {
      console.log("Enviando número para ativação:", number);
      const response = await usersServices.requestActivateUser(number);
      if (response.message === "Código de ativação enviado com sucesso") {
        console.log("Código de ativação solicitado com sucesso para:", number);
      } else {
        throw new Error(response.message || "Erro ao solicitar o código.");
      }
    } catch (error) {
      console.error("Erro ao solicitar ativação:", error);
      // Alert.alert("Erro", "Falha ao solicitar o código. Tente novamente.");
    }
  };

  // Submissão final do formulário
  const handleRegistration = async () => {
    try {
      // Log para debug
      logTelefoneInfo(formData.telefone);

      console.log("Formulário final:", formData);
      console.log("formData.dataDeNascimento", formData.dataDeNascimento);

      // Prepare o número de telefone para API
      const telefoneParaAPI = prepararTelefoneParaAPI(formData.telefone);

      const formattedData = {
        ...formData,
        telefone: telefoneParaAPI,
        cpf: removerMascara(formData.cpf),
        dataDeNascimento: formatarDataEnvio(formData.dataDeNascimento),
      };

      console.log("Dados formatados para envio:", formattedData);

      await registerUser(formattedData);
      await handleRequestActivate(telefoneParaAPI);
      navigation.navigate("UserActivation", { email: formData.email });
    } catch (error) {
      console.error("Erro ao registrar:", error);
      Alert.alert("Erro", error.message || "Falha no cadastro");
    }
  };

  const showPhotoAlert = () => {
    Alert.alert(
      "Atenção: Foto de Identificação Facial 📸",
      "Na próxima tela, você deverá tirar sua foto de perfil.\n\n🔹 **Essa imagem será usada para identificação facial e ficará permanentemente associada à sua conta.**\n\n✅ **Regras para a foto:**\n- Seu rosto deve estar **totalmente visível e centralizado**.\n- Utilize **boa iluminação**, evitando sombras.\n- **Não utilize acessórios** que possam dificultar o reconhecimento (óculos escuros, bonés, máscaras, etc.).\n- **Não fotografe objetos, ambientes ou outras pessoas.**\n- Evite expressões exageradas.\n\nCertifique-se de seguir todas as orientações para evitar problemas futuros.",
      [{ text: "Entendi", onPress: () => handleStepNavigation("next") }]
    );
  };

  const openLinkTerms = () => {
    // ADICIONAR SUA API
    Linking.openURL("https://plugsmart.com/politica-privacidade").catch((err) =>
      console.error("Erro ao abrir o link:", err)
    );
  };

  // Renderização condicional por step
  const renderStepContent = () => {
    const commonProps = {
      formData,
      setFormData: (field, value) =>
        setFormData((prev) => ({ ...prev, [field]: value })),
      errors,
      onBlur: handleBlur,
      inputRef: (field) => (ref) => (inputsRef.current[field] = ref),
      onFocus: handleFieldFocus, // Adicionado o handler de foco
    };

    switch (currentStep) {
      case 1:
        return (
          /* Step 1 - Dados de Acesso */
          <>
            <AuthInput
              icon="mail"
              label="E-mail"
              field="email"
              returnKeyType="next"
              onSubmitEditing={() => focusNextField("senha")}
              statusIcon={
                emailStatus === "available"
                  ? "checkmark-circle"
                  : emailStatus === "unavailable"
                  ? "close-circle"
                  : null
              }
              {...commonProps}
            />

            <AuthInput
              icon="lock-closed"
              label="Senha"
              field="senha"
              secure
              returnKeyType="next"
              onSubmitEditing={() => focusNextField("confirmSenha")}
              requirements={[
                "Mínimo 8 caracteres",
                "1 letra maiúscula e minúscula",
                "1 número e caractere especial",
              ]}
              {...commonProps}
            />

            <AuthInput
              icon="lock-closed"
              label="Confirmar Senha"
              field="confirmSenha"
              secure
              returnKeyType="done"
              {...commonProps}
            />
          </>
        );

      case 2:
        return (
          <>
            <AuthInput
              icon="person"
              label="Nome Completo"
              field="nome"
              {...commonProps}
            />
            <AuthInput
              icon="id-card"
              label="CPF"
              field="cpf"
              formatter={formatarCPF}
              maxLength={14}
              keyboardType="numeric"
              {...commonProps}
            />
          </>
        );

      case 3:
        return (
          <>
            <AuthInput
              icon="call"
              label="Telefone"
              field="telefone"
              formatter={formatarTelefoneCustom}
              maxLength={formData.isInternational ? 30 : 25}
              keyboardType="phone-pad"
              autoFocus={false}
              {...commonProps}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 30,
              }}
            >
              <Text style={{ marginRight: 10 }}>Número Internacional</Text>
              <TouchableOpacity
                onPress={() => {
                  setFormData((prev) => ({
                    ...prev,
                    isInternational: !prev.isInternational,
                    // Telefone será redefinido no useEffect
                  }));
                }}
                style={{ padding: 5 }}
              >
                <Ionicons
                  name={
                    formData.isInternational ? "checkbox" : "square-outline"
                  }
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
            <AuthInput
              icon="calendar"
              label="Data de Nascimento"
              field="dataDeNascimento"
              formatter={aplicarMascaraData}
              maxLength={10}
              keyboardType="numeric"
              {...commonProps}
            />
          </>
        );

      case 4:
        return (
          /* Step 4 - Câmera */
          <ViewCamera
            ref={cameraRef}
            onCapture={(base64Image) => {
              setFormData((prev) => ({
                ...prev,
                imgUsuario: base64Image,
              }));
            }}
            onRetake={() =>
              setFormData((prev) => ({ ...prev, imgUsuario: null }))
            }
          />
        );

      case 5:
        return (
          <View style={localStyles.termsContainer}>
            <AuthButton
              icon="document-text"
              label="Visualizar Termos"
              onPress={openLinkTerms}
              color={colors.primary}
              style={{ marginBottom: 20 }}
            />
            <AuthButton
              icon={formData.termos ? "checkbox" : "square-outline"}
              label={formData.termos ? "Termos Aceitos" : "Aceitar Termos"}
              onPress={() =>
                setFormData((prev) => ({ ...prev, termos: !prev.termos }))
              }
              color={formData.termos ? colors.success : colors.primary}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={5} // Ajuste para header/navegação
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../assets/images/pegpag-logo.jpeg")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.pageTitle}>Cadastro - Passo {currentStep}</Text>

        <StepIndicator steps={steps} currentStep={currentStep} />

        {renderStepContent()}
      </ScrollView>

      {/* Botões de navegação */}
      <View
        style={[
          localStyles.buttonGroup,
          steps.length === 0 || currentStep === 0
            ? { justifyContent: "flex-end" } // Apenas um botão ou primeiro step → botão à direita
            : currentStep === steps.length
            ? { justifyContent: "space-between" } // Último step → botão à esquerda
            : { justifyContent: "space-between" }, // Dois botões → um à esquerda, outro à direita
        ]}
      >
        {currentStep == 1 && (
          <AuthButton
            icon="arrow-back"
            label="Cancelar"
            onPress={() => navigation.navigate("Login")}
            color="red"
          />
        )}
        {currentStep > 1 && (
          <AuthButton
            icon="arrow-back"
            label="Voltar"
            onPress={() => handleStepNavigation("prev")}
            color={colors.secondary}
          />
        )}

        <AuthButton
          icon={currentStep === steps.length ? "checkmark" : "arrow-forward"}
          label={currentStep === steps.length ? "Finalizar" : "Continuar"}
          onPress={
            currentStep === steps.length
              ? handleRegistration
              : currentStep === 3
              ? () => {
                  showPhotoAlert();
                  // handleStepNavigation("next");
                }
              : () => handleStepNavigation("next")
          }
          disabled={
            (currentStep === steps.length && !formData.termos) ||
            (currentStep === 4 && !formData.imgUsuario) // Bloquear sem foto
          }
          color={currentStep === steps.length ? colors.success : colors.primary}
        />
      </View>

      {/* Modal de loading */}
      <Modal isVisible={isLoading}>
        <View style={localStyles.loadingModal}>
          <Ionicons name="time" size={40} color={colors.primary} />
          <Text style={localStyles.modalText}>Processando...</Text>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// Estilos locais
const localStyles = StyleSheet.create({
  termsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 30,
  },
  loadingModal: {
    backgroundColor: colors.white,
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
  },
  modalText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.primary,
  },
});

export default Register;

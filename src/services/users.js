import AsyncStorage from "@react-native-async-storage/async-storage";
import base from "./base";

const usersServices = {
  getUsers: async () => {
    return (await base.get("/usuarios/")).data;
  },
  getUserByEmail: async (email) => {
    console.log(email, "email");
    return (await base.get(`/usuarios/email/${email}`)).data;
  },
  // Nova função para buscar usuário por ID
  getUserById: async (userId) => {
    const authToken = await AsyncStorage.getItem("authToken");
    return (
      await base.get(`/usuarios/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
    ).data;
  },
  login: async (email, senha) => {
    return (await base.post("/login", { email, senha })).data;
  },
  register: async (data) => {
    return (await base.post("/usuarios/", data)).data;
  },
  update: async (_id, data) => {
    try {
      const endpoint = `/usuarios/${_id}`;

      const response = await base.put(endpoint, data);

      // A resposta agora será manipulada corretamente
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Erro: Status ${response.status}`);
      }
    } catch (error) {
      console.error(
        "Erro ao atualizar usuário:",
        error.response?.data || error.message
      );
      throw error; // Lança o erro para ser tratado no componente
    }
  },
  remove: async (idDoUsuario) => {
    return (await base.delete("/usuarios/" + idDoUsuario)).data;
  },
  updateImage: async (email, base64Image) => {
    return (await base.put("/atualizar-imagem", { email, image: base64Image }))
      .data;
  },
  requestActivateUser: async (email) => {
    return (await base.post("/codigo-ativacao", { email })).data;
  },
  activateUser: async (email, code) => {
    return await base.post("/ativar-usuario", { email, codigo: code });
  },
  confirmCodeForgot: async (email, code) => {
    return await base.post("/confirmar-codigo-senha", { email, codigo: code });
  },
  sendActivationCode: async (email) => {
    return (await base.post("/codigo-senha", { email })).data;
  },
  updatePassword: async (senhaAtual, novaSenha) => {
    return (await base.put("/atualizar-senha", { senhaAtual, novaSenha })).data;
  },
  recoverPassword: async (email, codigo, senha) => {
    return await base.put("/recuperar-senha", { email, codigo, senha });
  },
};

export default usersServices;

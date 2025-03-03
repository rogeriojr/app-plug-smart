import base from "./base";

const accessServices = {
  getAccess: async () => {
    return (await base.get("/acessos/")).data;
  },
  getAccessByUserId: async (userId) => {
    return (await base.get("/acessos/usuario/" + userId)).data;
  },
  login: async (email, password) => {
    return (await base.get("/acessos/email/" + email)).data;
  },
  access: async (data) => {
    /**
     * { qrCode, usuarioId, idade, lat, lon, accuracy}
     */
    try {
      const response = await base.post(`${data.qrCode}`, data);
      if (response?.data) {
        return { status: false, data: response.data };
      }
    } catch (error) {
      console.log({ error: error?.response?.data }, "error");
      return { status: false, data: error?.response?.data };
    }
  },
};

export default accessServices;

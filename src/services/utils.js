import {
  formatarDataEnvio,
  validarSenhasIguais,
} from "../../utils/validations";
import renderBase from "./base";

export const calcularIdade = (dataNascimento) => {
  // Dividir a data de nascimento em dia, mês e ano
  const partes = dataNascimento.split("/");
  const diaNasc = parseInt(partes[0], 10);
  const mesNasc = parseInt(partes[1], 10);
  const anoNasc = parseInt(partes[2], 10);

  // Obter a data atual
  const dataAtual = new Date();
  const diaAtual = dataAtual.getDate();
  const mesAtual = dataAtual.getMonth() + 1; // Os meses em JavaScript são de 0-11
  const anoAtual = dataAtual.getFullYear();

  // Calcular a idade
  let idade = anoAtual - anoNasc;

  // Ajustar a idade se ainda não passou o aniversário neste ano
  if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
    idade--;
  }

  return idade;
};

// Validação de CPF
export const validarCPF = (cpf) => {
  cpf = cpf.replace(/\D/g, "");

  if (
    cpf.length !== 11 ||
    cpf === "00000000000" ||
    cpf === "11111111111" ||
    cpf === "22222222222" ||
    cpf === "33333333333" ||
    cpf === "44444444444" ||
    cpf === "55555555555" ||
    cpf === "66666666666" ||
    cpf === "77777777777" ||
    cpf === "88888888888" ||
    cpf === "99999999999"
  )
    return false;

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;

  return resto === parseInt(cpf.substring(10, 11));
};

// Formatação de dados
export const formatarCPF = (cpf) => {
  return cpf
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .substring(0, 14);
};

export const formatarTelefone = (telefone, isInternational) => {
  let cleaned = telefone.replace(/\D/g, "");

  if (!isInternational) {
    cleaned = cleaned.replace(/^55/, ""); // Remove DDI anterior se existir
    cleaned = cleaned.substring(0, 11); // Limita ao tamanho máximo

    // Aplica máscara (XX) XXXXX-XXXX com DDI
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    const part1 = match[1] ? `(${match[1]}` : "";
    const part2 = match[2] ? `) ${match[2]}` : "";
    const part3 = match[3] ? `-${match[3]}` : "";

    return `+55 ${part1}${part2}${part3}`.trim();
  }

  // Mantém o DDI para internacionais
  return cleaned;
};

export const removerMascaraTel = (valor) => {
  return valor.replace(/[^\d+]/g, ""); // Mantém números e '+'
};

export const aplicarMascaraData = (data) => {
  return data
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{4})\d+?$/, "$1");
};

// Validações básicas
export const validarEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// validations.js
export const validarSenha = (senha) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
    senha
  );
};

export const validarNome = (nome) => {
  const partes = nome
    .trim()
    .split(" ")
    .filter((p) => p.length > 0);
  return (
    partes.length >= 2 &&
    partes[0].length >= 2 &&
    partes.slice(1).join(" ").length >= 3
  );
};

// Validação de idade
export const validarIdadeMinima = (dataNascimento, idadeMinima = 12) => {
  if (!validarDataNascimento(dataNascimento)) return false; // Adicione esta linha

  const [dia, mes, ano] = dataNascimento.split("/").map(Number);
  const nascimento = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const diferencaMes = hoje.getMonth() - nascimento.getMonth();

  if (
    diferencaMes < 0 ||
    (diferencaMes === 0 && hoje.getDate() < nascimento.getDate())
  ) {
    idade--;
  }

  return idade >= idadeMinima;
};

// Validação de telefone
export const validarTelefone = (telefone) => {
  const numeros = telefone.replace(/\D/g, "");
  return numeros.length === 11;
};

// Validação de data
export const validarDataNascimento = (data) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return false;

  const [dia, mes, ano] = data.split("/").map(Number);
  const dataObj = new Date(ano, mes - 1, dia);

  return (
    dataObj.getDate() === dia &&
    dataObj.getMonth() === mes - 1 &&
    dataObj.getFullYear() === ano &&
    dataObj <= new Date()
  );
};

// Validação de termos
export const validarTermos = (termos) => {
  return termos === true;
};

// Validação de imagem
export const validarImagem = (imagem) => {
  return imagem !== null && imagem.startsWith("data:image/");
};

// Validação por etapa
export const validarEtapa = (etapa, dados) => {
  const erros = {};

  switch (etapa) {
    case 1:
      if (!validarEmail(dados.email)) erros.email = "E-mail inválido";
      if (!validarSenha(dados.senha))
        erros.senha = "Senha não atende aos requisitos mínimos";
      if (dados.senha !== dados.confirmSenha)
        erros.confirmSenha = "Senhas não coincidem";
      break;

    case 2:
      if (!validarNome(dados.nome)) erros.nome = "Nome completo inválido";
      if (!validarCPF(dados.cpf)) erros.cpf = "CPF inválido";
      break;

    case 3:
      if (!validarTelefone(dados.telefone))
        erros.telefone = "Telefone inválido";
      if (!validarDataNascimento(dados.dataNascimento))
        erros.dataNascimento = "Data de nascimento inválida";
      if (!validarIdadeMinima(dados.dataNascimento))
        erros.dataNascimento = "Idade mínima de 12 anos";
      break;

    case 4:
      if (!validarImagem(dados.imgUsuario))
        erros.imgUsuario = "Imagem inválida ou não selecionada";
      break;

    case 5:
      if (!validarTermos(dados.termos))
        erros.termos = "Você deve aceitar os termos";
      break;

    default:
      break;
  }

  return erros;
};

// Formatação para API
export const formatarParaAPI = (dados) => {
  return {
    ...dados,
    cpf: dados.cpf.replace(/\D/g, ""),
    telefone: dados.telefone.replace(/\D/g, ""),
    dataNascimento: dados.dataNascimento.split("/").reverse().join("-"),
    imgUsuario: dados.imgUsuario?.split("base64,")[1] || null,
  };
};

// Utilitários
export const removerMascara = (valor) => valor.replace(/\D/g, "");

export const formatarDataISO = (data) => {
  const [dia, mes, ano] = data.split("/");
  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
};

export const formatarDataExibicao = (dataISO) => {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
};

// Validação de tamanho de imagem
export const validarTamanhoImagem = (base64String, tamanhoMaximoMB = 2) => {
  try {
    const stringLength = base64String.length - (base64String.indexOf(",") + 1);
    const tamanhoBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
    return tamanhoBytes <= tamanhoMaximoMB * 1024 * 1024;
  } catch {
    return false;
  }
};

// Validação de tipo de imagem
export const validarTipoImagem = (
  base64String,
  tiposPermitidos = ["image/jpeg", "image/png"]
) => {
  try {
    const tipo = base64String.split(";")[0].split(":")[1];
    return tiposPermitidos.includes(tipo);
  } catch {
    return false;
  }
};

// Verifica se o e-mail já está cadastrado
export const checkEmailExists = async (email) => {
  try {
    const response = await renderBase.get(`/usuarios/email/${email}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // E-mail disponível
    }
    throw new Error(
      error.response?.data?.message || "Falha na verificação do e-mail"
    );
  }
};

// Registra um novo usuário
export const registerUser = async (userData) => {
  try {
    console.log(userData, "userData");
    const response = await renderBase.post("/usuarios", {
      ...userData,
      cpf: removerMascara(userData.cpf),
      telefone: removerMascaraTel(userData.telefone),
      dataDeNascimento: formatarDataEnvio(userData.dataDeNascimento),
      imgUsuario: userData.imgUsuario?.split("base64,")[1] || null, // Remover prefixo
    });
    return response.data;
  } catch (error) {
    console.log(error, "error");
    let message = "Falha no processo de cadastro";

    if (error.response) {
      switch (error.response.status) {
        case 400:
          message =
            "Dados inválidos: " +
            Object.values(error.response.data.errors).join(", ");
          break;
        case 409:
          message = "Este e-mail já está cadastrado";
          break;
        default:
          message = error.response.data?.message || message;
      }
    }

    throw new Error(message);
  }
};

// Em validations.js atualize a função validateStepFields
export const validateStepFields = (step, formData) => {
  const errors = {};

  if (step === 1) {
    if (!validarEmail(formData.email)) errors.email = "Email inválido.";
    if (!validarSenha(formData.senha)) errors.senha = "Senha muito curta.";
    if (!validarSenhasIguais(formData.senha, formData.confirmSenha))
      errors.confirmSenha = "Senhas não coincidem.";
  }

  if (step === 2) {
    if (!validarNome(formData.nome)) errors.nome = "Informe nome completo.";
    if (!validarCPF(removerMascara(formData.cpf))) errors.cpf = "CPF inválido.";
  }

  if (step === 3) {
    if (!validarTelefone(formData.telefone, formData.isInternational))
      errors.telefone = "Telefone inválido.";
    if (!validarDataNascimento(formData.dataDeNascimento))
      errors.dataDeNascimento = "Data de nascimento inválida.";
    if (!validarIdadeMinima(formData.dataDeNascimento))
      errors.dataDeNascimento = "Você deve ter pelo menos 12 anos.";
  }

  return errors;
};

// utils.js
export const formatUserData = (data) => ({
  ...data,
  cpf: removerMascara(data.cpf),
  telefone: removerMascaraTel(data.telefone),
  dataDeNascimento: formatarDataEnvio(data.dataDeNascimento),
  imgUsuario: data.imgUsuario.split("base64,")[1],
});

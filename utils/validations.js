// Valida se o CPF é válido
export const validarCPF = (cpf) => {
  cpf = cpf.replace(/\D/g, ""); // Remove caracteres não numéricos
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0,
    resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf[10]);
};

// Formata CPF: 123.456.789-09
export const formatarCPF = (cpf) =>
  cpf
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

// Remove máscara do CPF
export const removerMascara = (valor) => valor.replace(/\D/g, "");

// Formata Telefone: (99) 99999-9999
export const formatarTelefone = (telefone) =>
  telefone
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");

// Valida se a data indica pelo menos 12 anos
export const validarIdadeMinima = (data) => {
  const hoje = new Date();
  const [dia, mes, ano] = data.split("/").map(Number);
  const nascimento = new Date(ano, mes - 1, dia);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  if (
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < dia)
  ) {
    idade--;
  }
  return idade >= 12;
};

// Valida se o email está no formato correto
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Valida se a senha tem no mínimo 6 caracteres
export const validarSenha = (senha) => senha.length >= 6;

// Valida se as senhas coincidem
export const validarSenhasIguais = (senha, confirmSenha) =>
  senha === confirmSenha;

// Função para validar o nome completo
export const validarNome = (nome) => {
  if (!nome || typeof nome !== "string") return false;

  const partes = nome.trim().split(" ");

  // Verifica se há pelo menos duas partes (nome e sobrenome)
  if (partes.length < 2) return false;

  const [primeiroNome, ...sobrenome] = partes;

  // Verifica se o primeiro nome tem pelo menos 4 letras
  if (primeiroNome.length < 4) return false;

  // Verifica se o sobrenome tem pelo menos 3 letras
  const sobrenomeCompleto = sobrenome.join(" ");
  if (sobrenomeCompleto.length < 3) return false;

  return true;
};

// Função para validar um número de celular no formato (99) 99999-9999
export const validarTelefone = (telefone) => {
  const regex = /^\(\d{2}\) \d{5}-\d{4}$/; // Formato (99) 99999-9999

  // Verifica se o telefone segue o padrão
  return regex.test(telefone);
};

// Valida se a data de nascimento é válida e segue o formato DD/MM/AAAA
export const validarDataNascimento = (data) => {
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

  if (!regex.test(data)) return false; // Verifica o formato DD/MM/AAAA

  const [dia, mes, ano] = data.split("/").map(Number);
  const dataNascimento = new Date(ano, mes - 1, dia);

  // Verifica se a data é válida e não é no futuro
  return (
    dataNascimento instanceof Date &&
    !isNaN(dataNascimento) &&
    dataNascimento <= new Date()
  );
};

export const aplicarMascaraData = (data) => {
  return data
    .replace(/\D/g, "") // Remove caracteres não numéricos
    .replace(/(\d{2})(\d)/, "$1/$2") // Adiciona a primeira "/"
    .replace(/(\d{2})(\d)/, "$1/$2") // Adiciona a segunda "/"
    .replace(/(\d{4})\d+?$/, "$1"); // Limita o ano a 4 dígitos
};

// validations.js - Garantir formatação correta
export const formatarDataEnvio = (data) => {
  const [dia, mes, ano] = data.split("/");
  return `${ano}-${mes?.padStart(2, "0")}-${dia?.padStart(2, "0")}`;
};

export const validateFields = (step, data) => {
  const errors = {};

  // Validações para cada passo
  switch (step) {
    case 1:
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "E-mail inválido";
      }
      if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          data.senha
        )
      ) {
        errors.senha = "Senha não atende aos requisitos";
      }
      if (data.senha !== data.confirmSenha) {
        errors.confirmSenha = "Senhas não coincidem";
      }
      break;

    case 2:
      if (!data.nome.trim() || data.nome.split(" ").length < 2) {
        errors.nome = "Nome completo obrigatório";
      }
      if (!validarCPF(data.cpf)) {
        errors.cpf = "CPF inválido";
      }
      break;

    case 3:
      if (!/^(\+\d{1,3})?\d{10,11}$/.test(data.telefone.replace(/\D/g, ""))) {
        errors.telefone = "Telefone inválido";
      }
      if (!validarIdade(data.dataDeNascimento)) {
        errors.dataDeNascimento = "Idade mínima 12 anos";
      }
      break;
  }

  return errors;
};

export const formatFields = (data) => ({
  ...data,
  cpf: data.cpf.replace(/\D/g, ""),
  telefone: data.telefone.replace(/\D/g, ""),
  dataDeNascimento: formatarDataISO(data.dataDeNascimento),
});

const validarIdade = (data) => {
  const [dia, mes, ano] = data.split("/").map(Number);
  const hoje = new Date();
  const nascimento = new Date(ano, mes - 1, dia);

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const diferencaMes = hoje.getMonth() - nascimento.getMonth();

  if (
    diferencaMes < 0 ||
    (diferencaMes === 0 && hoje.getDate() < nascimento.getDate())
  ) {
    idade--;
  }

  return idade >= 12; // Altere para idadeMinima se necessário
};

const formatarDataISO = (data) => {
  const [day, month, year] = data.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

// ============ Auth Stub ============
// Protótipo: dados em localStorage. Substituir por backend real (Supabase/Firebase/custom).
// Estrutura:
//   localStorage.pc_users = [{id, email, senha, lojaNome, lojaIniciais, criadoEm}]
//   localStorage.pc_session = {userId, email, lojaNome, lojaIniciais}

const AUTH = {
  getUsers() {
    try { return JSON.parse(localStorage.getItem('pc_users')) || []; } catch { return []; }
  },
  saveUsers(users) { localStorage.setItem('pc_users', JSON.stringify(users)); },

  getSession() {
    try { return JSON.parse(localStorage.getItem('pc_session')); } catch { return null; }
  },
  setSession(session) { localStorage.setItem('pc_session', JSON.stringify(session)); },
  clearSession() { localStorage.removeItem('pc_session'); },

  register({ email, senha, lojaNome, lojaIniciais }) {
    const users = AUTH.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'E-mail já cadastrado.' };
    }
    const user = {
      id: 'u_' + Date.now(),
      email: email.trim(),
      senha, // NUNCA armazenar senha em claro em produção
      lojaNome: lojaNome.trim(),
      lojaIniciais: (lojaIniciais || lojaNome.slice(0, 2)).toUpperCase(),
      plano: 'trial',
      simulacoesUsadas: 0,
      criadoEm: new Date().toISOString(),
    };
    users.push(user);
    AUTH.saveUsers(users);
    AUTH.setSession({ userId: user.id, email: user.email, lojaNome: user.lojaNome, lojaIniciais: user.lojaIniciais, plano: user.plano });
    return { ok: true, user };
  },

  incrementSimulacoes(userId) {
    const users = AUTH.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return 0;
    if (user.plano === 'admin') return user; // admin não gasta tokens
    user.simulacoesUsadas = (user.simulacoesUsadas || 0) + 1;
    if (user.plano === 'pro') {
      user.saldoTokens = (user.saldoTokens || 0) + 1;
    }
    AUTH.saveUsers(users);
    return user;
  },

  getUser(userId) {
    return AUTH.getUsers().find(u => u.id === userId);
  },

  updateUser(userId, patch) {
    const users = AUTH.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    Object.assign(user, patch);
    AUTH.saveUsers(users);
    return user;
  },

  upgradePro(userId, { cartaoUltimos4, cartaoNome, softCap }) {
    const ciclos = (window.APP_CONFIG && window.APP_CONFIG.ciclosDias) || 30;
    const proxima = new Date();
    proxima.setDate(proxima.getDate() + ciclos);
    return AUTH.updateUser(userId, {
      plano: 'pro',
      saldoTokens: 0,
      softCap: softCap || 300,
      cartaoUltimos4,
      cartaoNome,
      proximaCobranca: proxima.toISOString(),
      faturas: [],
      upgradeEm: new Date().toISOString(),
    });
  },

  fecharFatura(userId) {
    const users = AUTH.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user || user.plano !== 'pro') return null;
    const ciclos = (window.APP_CONFIG && window.APP_CONFIG.ciclosDias) || 30;
    const preco = (window.APP_CONFIG && window.APP_CONFIG.precoPorSimulacao) || 1;
    const tokens = user.saldoTokens || 0;
    const valor = tokens * preco;

    user.faturas = user.faturas || [];
    user.faturas.unshift({
      id: 'f_' + Date.now(),
      data: new Date().toISOString(),
      tokens,
      valor,
      cartaoUltimos4: user.cartaoUltimos4,
      status: 'paga',
    });
    user.saldoTokens = 0;
    const proxima = new Date();
    proxima.setDate(proxima.getDate() + ciclos);
    user.proximaCobranca = proxima.toISOString();
    AUTH.saveUsers(users);
    return user;
  },

  login({ email, senha }) {
    const user = AUTH.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha);
    if (!user) return { ok: false, error: 'E-mail ou senha incorretos.' };
    AUTH.setSession({ userId: user.id, email: user.email, lojaNome: user.lojaNome, lojaIniciais: user.lojaIniciais, plano: user.plano || 'trial' });
    return { ok: true, user };
  },

  logout() { AUTH.clearSession(); window.location.href = 'index.html'; },

  require() {
    const session = AUTH.getSession();
    if (!session) { window.location.href = 'login.html'; return null; }
    return session;
  },
};

// Criar conta admin na primeira carga (se não existir)
(function seedAdmin() {
  const users = AUTH.getUsers();
  if (!users.some(u => u.email === 'admin@parcelacerta.com')) {
    users.push({
      id: 'u_admin',
      email: 'admin@parcelacerta.com',
      senha: 'pc2026',
      lojaNome: 'ParcelaCerta',
      lojaIniciais: 'PC',
      plano: 'admin',
      simulacoesUsadas: 0,
      criadoEm: new Date().toISOString(),
    });
    AUTH.saveUsers(users);
  }
})();

window.AUTH = AUTH;

/** localStorage com proteção (pode falhar em aba anônima). */
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sem armazenamento: segue sem salvar */
  }
}

export const storage = { read, write };

export const getAdminToken = () => read<string | null>("feijuca.adminToken", null);
export const setAdminToken = (t: string) => write("feijuca.adminToken", t);
export const clearAdminToken = () => write("feijuca.adminToken", null);

/** Dados do cliente lembrados para o próximo pedido. */
export interface SavedCustomer {
  name: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  reference: string;
}
export const getSavedCustomer = () => read<SavedCustomer | null>("feijuca.customer", null);
export const saveCustomer = (c: SavedCustomer) => write("feijuca.customer", c);

export const getMyOrders = () => read<string[]>("feijuca.orders", []);
export const addMyOrder = (id: string) => write("feijuca.orders", [id, ...getMyOrders().filter((x) => x !== id)].slice(0, 20));

export const getMySubscription = () => read<string | null>("feijuca.subscription", null);
export const setMySubscription = (id: string) => write("feijuca.subscription", id);

// JWT helpers for buyer

import sellers from "../data/sellers.json";

export function findSellerByEmail(email) {
  return sellers.find((seller) => seller.email === email);
}

// JWT helpers for buyer

import buyers from "../data/buyers.json";

export function findBuyerByEmail(email) {
  return buyers.find((buyer) => buyer.email === email);
}

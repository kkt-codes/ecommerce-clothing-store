// Hook for modal control

import { useState } from "react";

let modalSetters = []; // We allow multiple components to control the modal

export function useSignupLoginModal() {
  const [isOpen, setIsOpen] = useState(false);

  modalSetters.push(setIsOpen);

  const openModal = () => {
    modalSetters.forEach((setter) => setter(true));
  };

  const closeModal = () => {
    modalSetters.forEach((setter) => setter(false));
  };

  return { isOpen, openModal, closeModal };
}

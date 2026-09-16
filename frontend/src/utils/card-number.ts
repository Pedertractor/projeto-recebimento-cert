const CARD_NUMBER_PATTERN = /^\d+$/;
const LOGIN_CARD_NUMBER_MAX_LENGTH = 8;

export function parseCardNumberInput(value: string): string | null {
  const cardNumber = value.trim();

  if (!CARD_NUMBER_PATTERN.test(cardNumber)) {
    return null;
  }

  if (
    cardNumber.length < 1 ||
    cardNumber.length > LOGIN_CARD_NUMBER_MAX_LENGTH
  ) {
    return null;
  }

  return cardNumber;
}

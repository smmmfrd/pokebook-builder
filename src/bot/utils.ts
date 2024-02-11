const PUNCTUATION_MAP = {
  0: ".",
  1: "!",
  2: "?",
};

export function randomPostContent(name: string): string {
  const messageLength = Math.floor(Math.random() * 8) + 2;

  const randPunctuation = () =>
    PUNCTUATION_MAP[
      Math.floor(Math.random() * 3) as keyof typeof PUNCTUATION_MAP
    ];

  const randText = () =>
    Math.random() > 0.5 ? name.slice(0, Math.ceil(name.length / 2) + 1) : name;

  const resetPuncTime = () => (sinceLastPunc = Math.floor(Math.random() * 4));
  // Controlling variable set by the above function.
  let sinceLastPunc = 0;

  let message = "";
  resetPuncTime();

  for (let i = 0; i < messageLength; i++) {
    if (sinceLastPunc > 0) {
      sinceLastPunc--;

      if (i === messageLength - 1) {
        // If this is the last content added, attach a punctuation mark.
        message += `${name}${randPunctuation()}`;
      } else {
        message += `${randText()} `;
      }
    } else {
      // Always ending a sentence with the full name.
      message += `${name}${randPunctuation()}${
        i === messageLength - 1 ? "" : " "
      }`;
      resetPuncTime();
    }
  }

  return message;

  // I know you can do it like this, but it's unreadable, having this index logic in the same area is easier on the eyes.
  // let message = Array.from({ length: messageLength }, (_, i) =>
  //   randContent(i)
  // ).join("");
}

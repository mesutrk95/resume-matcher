export const shakeElement = (id: string) => {
  const target = document.getElementById(id) as HTMLElement | null;
  if (!target) return;
  target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  target.classList.remove('highlight-animation');

  setTimeout(() => {
    target.classList.add('highlight-animation');
    setTimeout(() => {
      target.classList.remove('highlight-animation');
    }, 600);
  });
};

export function countWords(text?: string): number {
  if (!text) return 0;
  let count = 0;
  let isInWord = false;

  for (let i = 0; i < text.length; i++) {
    // Check if current character is a word separator (whitespace or punctuation)
    const isSeparator = /[\s,\-;:!?()[\]{}'"\\/]/.test(text[i]);

    // If we transition from separator to non-separator, we've found a new word
    if (!isSeparator && !isInWord) {
      count++;
      isInWord = true;
    }
    // If we transition from non-separator to separator, we've finished a word
    else if (isSeparator) {
      isInWord = false;
    }
  }

  return count;
}

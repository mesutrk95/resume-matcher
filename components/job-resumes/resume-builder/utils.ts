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

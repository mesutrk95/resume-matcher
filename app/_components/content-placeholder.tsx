export const ContentPlaceholder = ({
  show,
  placeholder,
  children,
}: {
  show: boolean;
  placeholder: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  if (!show) {
    return children;
  }
  return placeholder
};

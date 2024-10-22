const EllipsisText = ({
  children,
  maxWidth,
  iconWidth,
}: {
  children: React.ReactNode;
  maxWidth: number | string;
  iconWidth?: number;
}) => {
  const parsedMaxWidth =
    typeof maxWidth === 'number'
      ? maxWidth - (iconWidth ? iconWidth : 0)
      : maxWidth;
  return (
    <div
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: parsedMaxWidth,
      }}
    >
      {children}
    </div>
  );
};

export default EllipsisText;

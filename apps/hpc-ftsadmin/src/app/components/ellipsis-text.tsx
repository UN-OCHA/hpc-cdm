const EllipsisText = ({
  children,
  maxWidth,
}: {
  children: React.ReactNode;
  maxWidth: number | string;
}) => {
  return (
    <div
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth,
      }}
    >
      {children}
    </div>
  );
};

export default EllipsisText;

const EllipsisText = ({
  children,
  maxWidth,
  dataTest,
}: {
  children: React.ReactNode;
  maxWidth: number | string;
  dataTest?: string;
}) => {
  return (
    <div
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth,
      }}
      data-test={dataTest}
    >
      {children}
    </div>
  );
};

export default EllipsisText;

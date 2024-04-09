import { useState } from 'react';

type SharePath = string;

function useSharePath(
  initialValue: SharePath
): [SharePath, (newPath: SharePath) => void] {
  const [path, setPath] = useState<SharePath>(initialValue);

  const updateData = (newPath: SharePath) => {
    setPath(newPath);
  };
  return [path, updateData];
}

export default useSharePath;

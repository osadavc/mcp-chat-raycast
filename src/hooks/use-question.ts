import { useCallback, useMemo, useState } from "react";

export const useQuestion = ({ initialQuestion }: { initialQuestion: string }) => {
  const [data, setData] = useState<string>(initialQuestion);
  const [isLoading, setLoading] = useState<boolean>(false);

  const update = useCallback(
    async (question: string) => {
      setData(question);
    },
    [setData, data],
  );

  return useMemo(() => ({ data, isLoading, update }), [data, isLoading, update]);
};

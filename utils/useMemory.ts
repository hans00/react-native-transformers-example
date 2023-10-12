import { useCallback, useState, useEffect } from 'react';

export default function useMemory<Type>(createFn: ()=>Type, disposeFn: (v:Type)=>void, deps: any[]): Type {
  const [memory, setMemory] = useState<Type|null>(null);

  const create = useCallback(createFn, deps);

  const dispose = useCallback(disposeFn, deps);

  useEffect(() => {
    const data = create();
    setMemory(data);
    return () => dispose(data);
  }, [create, dispose]);

  return memory;
}

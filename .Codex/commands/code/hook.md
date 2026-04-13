# /code:hook - 커스텀 훅 생성

> 코드 생성 전 `docs/coding-conventions.md`를 Read 도구로 읽고 전체 규칙을 확인한다.

프로젝트 컨벤션에 맞는 커스텀 훅을 생성합니다.

## 사용법

```
/code:hook useCart
/code:hook useProductFilter --feature=products
/code:hook useDebounce --common
```

## 옵션

- `--feature=<name>`: `src/features/<name>/hooks/`에 생성
- `--common`: `src/hooks/`에 생성 (기본값)

## 생성 파일

```
src/hooks/use-cart.ts           # --common
src/features/cart/hooks/use-cart.ts  # --feature=cart
```

## 훅 템플릿

```tsx
// src/hooks/use-cart.ts
'use client';

import { useCallback, useState } from 'react';

interface UseCartOptions {
  initialItems?: CartItem[];
}

interface UseCartReturn {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
}

export const useCart = (options: UseCartOptions = {}): UseCartReturn => {
  const { initialItems = [] } = options;
  const [items, setItems] = useState<CartItem[]>(initialItems);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  return {
    items,
    addItem,
    removeItem,
    clearCart,
    totalPrice,
  };
};
```

## 유틸리티 훅 예시

```tsx
// useDebounce
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// useLocalStorage
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue((prev) => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue] as const;
};
```

## 규칙

1. 파일명: `use-{name}.ts` (kebab-case)
2. 훅 이름: `use{Name}` (camelCase)
3. 클라이언트 훅은 `'use client'` 지시어 필수
4. Options/Return 타입 명시적 정의
5. 콜백은 useCallback으로 메모이제이션

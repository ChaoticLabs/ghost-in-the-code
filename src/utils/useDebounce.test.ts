import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 100));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 100 });
    
    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Wait for the debounced value to update
    await waitFor(() => {
      expect(result.current).toBe('updated');
    }, { timeout: 200 });
  });

  it('should work with different data types', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 42, delay: 50 } }
    );

    expect(result.current).toBe(42);

    rerender({ value: 100, delay: 50 });

    await waitFor(() => {
      expect(result.current).toBe(100);
    }, { timeout: 150 });
  });

  it('should handle object values', async () => {
    const obj1 = { name: 'test1' };
    const obj2 = { name: 'test2' };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: obj1, delay: 50 } }
    );

    expect(result.current).toBe(obj1);

    rerender({ value: obj2, delay: 50 });

    await waitFor(() => {
      expect(result.current).toBe(obj2);
    }, { timeout: 150 });
  });
});

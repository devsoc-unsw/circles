import * as reactRouterDom from 'react-router-dom';
import { vi } from 'vitest';

// use to mock useMediaQuery
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: () => ({ pathname: '/' })
}));

const dummyNavigate = vi.fn();
const useNavigateMock = vi.spyOn(reactRouterDom, 'useNavigate');
useNavigateMock.mockReturnValue(dummyNavigate);

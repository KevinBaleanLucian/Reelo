import { useLocation } from 'react-router';

export function useAuthLinkState() {
  const location = useLocation();
  return { background: location };
}
/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Custom App component for web vitals reporting
 */
import { AppProps } from 'next/app';
import { reportWebVitals as reportToAnalytics } from '@/lib/performance';

export function reportWebVitals(metric: any) {
  reportToAnalytics(metric);
}

/**
 * Custom App component
 * @constructor
 */
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
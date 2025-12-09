import '../styles/globals.css';
import { OrderProvider } from '../context/OrderContext';

function MyApp({ Component, pageProps }) {
  return (
    <OrderProvider>
      <Component {...pageProps} />
    </OrderProvider>
  );
}

export default MyApp;

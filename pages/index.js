import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <section className="screen active">
        <div className="hero">
          <h2>Monte seu burger em camadas</h2>
          <p>Escolha pão, carne, queijos e camadas extras. Peça sem sair de casa em Caraguá.</p>
          <Link className="btn primary" href="/montar">
            Começar meu lanche
          </Link>
        </div>
        <div className="secondary-action">
          <Link className="btn ghost" href="/montar">
            Ver burgers da casa
          </Link>
        </div>
      </section>
    </Layout>
  );
}

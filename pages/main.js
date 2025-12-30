import Head from 'next/head';

export default function Main() {
  return (
    <>
      <Head>
        <title>Angebot - Visualisierungsangebot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <iframe 
        src="/main.html" 
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          overflow: 'auto'
        }}
      />
    </>
  );
}

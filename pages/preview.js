import Head from 'next/head';

export default function Preview() {
  return (
    <>
      <Head>
        <title>Proposal Preview</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <iframe 
        src="/preview.html" 
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

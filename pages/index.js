import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function ProposalForm() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // Load proposal config
    if (typeof window !== 'undefined') {
      import('../proposal-config.js').then(() => {
        setConfig(window.PROPOSAL_CONFIG || {});
      });
    }
  }, []);

  return (
    <>
      <Head>
        <title>Generate Client Proposals</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <iframe 
        src="/proposal-form.html" 
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

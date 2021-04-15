import { useEffect } from 'react';

export function Comment(): JSX.Element {
  useEffect(() => {
    const script = document.createElement('script');
    const acnhor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('repo', 'leobonfimm/ignite-desafio-05');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'async');
    acnhor.appendChild(script);
  }, []);

  return <div id="inject-comments-for-uterances" />;
}

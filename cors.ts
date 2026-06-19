async function check() {
    const Ac = new AbortController();
    const res = await fetch('https://backup.qurango.net/radio/mohammad_siddiq_alminshawi_tarteel', { 
        method: 'GET',
        headers: {
            'Origin': 'http://localhost:3000'
        },
        signal: Ac.signal
    });
    console.log(res.status);
    console.log([...res.headers.entries()]);
    Ac.abort();
}
check();

const express = require('express');
const fs = require('fs');
const path = require('path');

// app.js
// GitHub Copilot


const app = express();
const PORT = process.env.PORT || 3000;
const MACROS_PATH = path.join(__dirname, 'macros.json');

app.get('/macros', (req, res) => {
    fs.readFile(MACROS_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read macros.json:', err);
            return res.status(500).json({ error: 'Failed to load macros' });
        }
        try {
            const parsed = JSON.parse(data);
            // Ensure we always return an array
            res.json(Array.isArray(parsed) ? parsed : []);
        } catch (parseErr) {
            console.error('Failed to parse macros.json:', parseErr);
            res.status(500).json({ error: 'Invalid macros.json' });
        }
    });
});

app.get('/', (req, res) => {
    res.type('html').send(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Macro List</title>
<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    #search { width: 100%; padding: 12px; font-size: 18px; box-sizing: border-box; }
    #count { margin: 8px 0; color: #666; }
    #list { list-style: none; padding: 0; margin: 0; }
    .item { padding: 12px; border-bottom: 1px solid #eee; }
    .name { font-weight: 700; font-size: 18px; }
    .desc { color: #444; margin-top: 6px; white-space: pre-wrap; font-family: monospace; font-size: 13px; }
    .empty { color: #999; padding: 20px; text-align: center; }
</style>
</head>
<body>
    <input id="search" placeholder="Search macros by name..." autofocus />
    <div id="count"></div>
    <ul id="list"></ul>

<script>
(async function(){
    const elSearch = document.getElementById('search');
    const elList = document.getElementById('list');
    const elCount = document.getElementById('count');

    let macros = [];
    try {
        const res = await fetch('/macros');
        macros = await res.json();
    } catch (e) {
        elList.innerHTML = '<li class="empty">Failed to load macros.</li>';
        console.error(e);
        return;
    }

    function render(items) {
        elList.innerHTML = '';
        if (!items.length) {
            elList.innerHTML = '<li class="empty">No macros found.</li>';
            elCount.textContent = '0 results';
            return;
        }
        elCount.textContent = items.length + (items.length === 1 ? ' result' : ' results');
        const frag = document.createDocumentFragment();
        for (const m of items) {
            const li = document.createElement('li');
            li.className = 'item';
            const name = document.createElement('div');
            name.className = 'name';
            name.textContent = m.name || '(unnamed)';
            li.appendChild(name);
            if (m.description || m.content || m.command) {
                const desc = document.createElement('div');
                desc.className = 'desc';
                desc.textContent = m.description || m.content || m.command || '';
                li.appendChild(desc);
            }
            frag.appendChild(li);
        }
        elList.appendChild(frag);
    }

    function normalize(s){ return (s||'').toLowerCase(); }

    function filter(q){
        q = normalize(q);
        if (!q) return macros;
        return macros.filter(m => normalize(m.name).includes(q));
    }

    // initial
    render(macros);

    let timer = null;
    elSearch.addEventListener('input', (e) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            render(filter(e.target.value));
        }, 120);
    });
})();
</script>
</body>
</html>`);
});

app.listen(PORT, () => {
    console.log('Server listening on http://localhost:' + PORT);
});
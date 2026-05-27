// Script para baixar e juntar pedaços do game.zip
async function downloadAndAssembleGameZip() {
  const statusEl = document.getElementById('status');
  statusEl.innerHTML = 'Downloading game data...<br>';
  
  try {
    // Detecta quantos pedaços existem fazendo HEAD requests
    let partCount = 0;
    let totalSize = 0;
    
    for (let i = 1; i <= 20; i++) {
      const url = `game.zip.part${i}`;
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        partCount = i;
        totalSize += parseInt(response.headers.get('content-length') || 0);
      } else {
        break;
      }
    }
    
    if (partCount === 0) {
      // Se não tem pedaços, tenta game.zip direto (arquivo único)
      const response = await fetch('game.zip');
      if (response.ok) {
        const blob = await response.blob();
        FS.writeFile('/game.zip', new Uint8Array(await blob.arrayBuffer()));
        gameExtractAndRun();
        return;
      }
      throw new Error('Nenhum arquivo game.zip encontrado');
    }
    
    console.log(`Encontrados ${partCount} pedaços, total: ${(totalSize / 1024 / 1024).toFixed(1)}MB`);
    
    // Baixa todos os pedaços
    const chunks = [];
    let downloaded = 0;
    
    for (let i = 1; i <= partCount; i++) {
      const url = `game.zip.part${i}`;
      statusEl.innerHTML = `Downloading... (${i}/${partCount})<br>`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Erro ao baixar ${url}`);
      
      const blob = await response.blob();
      chunks.push(new Uint8Array(await blob.arrayBuffer()));
      
      downloaded += blob.size;
      const percent = Math.round((downloaded / totalSize) * 100);
      statusEl.innerHTML = `Downloaded ${percent}% (${(downloaded / 1024 / 1024).toFixed(1)}MB / ${(totalSize / 1024 / 1024).toFixed(1)}MB)<br>`;
    }
    
    // Junta todos os pedaços em um único arquivo
    statusEl.innerHTML = 'Assembling game data...<br>';
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const assembled = new Uint8Array(totalLength);
    
    let offset = 0;
    for (const chunk of chunks) {
      assembled.set(chunk, offset);
      offset += chunk.length;
    }
    
    // Escreve no filesystem virtual do Emscripten
    statusEl.innerHTML = 'Writing to filesystem...<br>';
    FS.writeFile('/game.zip', assembled);
    
    console.log(`✅ Game.zip assembled: ${assembled.length} bytes`);
    
    // Descompacta e executa o jogo
    gameExtractAndRun();
    
  } catch (error) {
    console.error('Erro ao montar game:', error);
    statusEl.innerHTML = `❌ Erro: ${error.message}<br><small>Recarregue a página</small>`;
  }
}

// Chama quando o Module tá pronto
if (typeof Module !== 'undefined') {
  if (Module.calledRun) {
    downloadAndAssembleGameZip();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module['preRun'].push(downloadAndAssembleGameZip);
  }
}

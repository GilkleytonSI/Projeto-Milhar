function gerarQRCode(numerosDiv) {
    // Extrai o texto dos números das divs filhas
    const numeros = Array.from(numerosDiv.children)
        .map(div => div.textContent.trim()) // Extrai e remove espaços extras
        .join(', '); // Junta os números separados por vírgulas

    // Retorna a URL do QR Code usando a API externa
    return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(numeros)}`;
}



// Recupera o cache armazenado no localStorage
const cacheSequencias = JSON.parse(localStorage.getItem('cacheSequencias')) || {};

function salvarCache() {
    localStorage.setItem('cacheSequencias', JSON.stringify(cacheSequencias));
}

function gerarCaixas() {
    const milharInput = document.getElementById('milhar');
    const milhar = milharInput.value;

    // Validação
    if (milhar.length !== 4 || isNaN(milhar)) {
        alert('Por favor, digite um número de 4 dígitos.');
        return;
    }

    const container = document.getElementById('caixinhas');
    container.innerHTML = ''; // Limpa as caixinhas existentes

    // Gerar 20 caixinhas com sequências únicas
    for (let i = 0; i < 20; i++) {
        const sequencia = String(parseInt(milhar) + i).padStart(4, '0');

        // Interrompe se ultrapassar 9999
        if (parseInt(sequencia, 10) > 9999) {
            break;
        }

        if (!cacheSequencias[sequencia]) {
            // Gerar combinações para a sequência, caso ainda não exista no cache
            const combinacoes = [sequencia]; // Inicia a lista com a própria sequência
            while (combinacoes.length < 4) { // Garante no máximo 4 combinações
                const novaCombinacao = Math.floor(1000 + Math.random() * 9000).toString();
                if (!combinacoes.includes(novaCombinacao)) { // Verifica se o número é único
                    combinacoes.push(novaCombinacao);
                }
            }
            cacheSequencias[sequencia] = combinacoes; // Armazena no cache
            salvarCache();
        }

        const caixa = document.createElement('div');
        caixa.className = 'box';

        const titulo = document.createElement('div');
        titulo.className = 'box-title';
        titulo.textContent = 'BILHETE DOS AMIGOS';
        caixa.appendChild(titulo);

        
        const numerosDiv = document.createElement('div');
                numerosDiv.className = 'box-numbers';
                cacheSequencias[sequencia].forEach(numero => {
                    const numeroDiv = document.createElement('div');
                    numeroDiv.textContent = numero;
                    numerosDiv.appendChild(numeroDiv);
            });
            caixa.appendChild(numerosDiv);

        const telefone = document.createElement('div');
        telefone.className = 'box-phone';
        telefone.textContent = 'Tel. (00) 90000-0000';
        caixa.appendChild(telefone);

        const subtitulo = document.createElement('div');
        subtitulo.className = 'box-subtitle';
        subtitulo.textContent = 'Não serão aceito bilhetes que estejam rasurados ou rasgados.\nBilhete válido por 12h';
        caixa.appendChild(subtitulo);
        
        // Adiciona QR Code
        const qrCodeImg = document.createElement('img');
        qrCodeImg.classList.add('qr-code');

        // Gera a URL do QR Code a partir dos números
        qrCodeImg.src = gerarQRCode(numerosDiv);
        qrCodeImg.alt = "QR Code";
        caixa.appendChild(qrCodeImg);

        
        container.appendChild(caixa);
    }

    // Habilita o botão de imprimir
    document.getElementById('imprimir-button').disabled = false;

}

function imprimirCaixinhas() {
    const container = document.getElementById('caixinhas');

    // Verifica se há caixinhas para imprimir
    if (container.children.length === 0) {
        alert('Por favor, gere as caixinhas antes de imprimir.');
        return;
    }

    window.print();
}

function salvarCombinacoesTxt() {
    if (Object.keys(cacheSequencias).length === 0) {
        alert('Não há combinações para salvar. Por favor, gere as caixinhas primeiro.');
        return;
    }

    // Confirmação antes de salvar
    const confirmar = confirm('Deseja salvar as combinações em alguma pasta especifica? Escolha a localização na próxima janela.');
    if (!confirmar) {
        return;
    }

    // Converte o cache de combinações em JSON formatado
    const conteudoJson = JSON.stringify(cacheSequencias, null, 4);

    // Cria um blob com o conteúdo
    const blob = new Blob([conteudoJson], { type: 'text/plain' });

    // Cria um link temporário para download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'combinacoes.txt'; // Nome do arquivo
    document.body.appendChild(link);

    // Aciona o download
    link.click();

    // Remove o link após o download
    document.body.removeChild(link);
}

function carregarArquivo(event) {
    const file = event.target.files[0];

    if (!file) {
        alert('Por favor, selecione um arquivo válido.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const conteudo = e.target.result;
            const dados = JSON.parse(conteudo);

            if (typeof dados !== 'object') {
                throw new Error('O arquivo não contém um JSON válido.');
            }

            // Atualiza o cache com os dados carregados
            Object.assign(cacheSequencias, dados);
            salvarCache(); // Atualiza o cache no localStorage
            alert('Arquivo carregado com sucesso! As caixinhas serão atualizadas.');

            // Gera as caixinhas com base nos dados carregados
            gerarCaixas();
        } catch (error) {
            console.error('Erro ao carregar o arquivo:', error);
            alert('O arquivo selecionado não é válido ou está corrompido.');
        }
    };

    reader.readAsText(file);
}


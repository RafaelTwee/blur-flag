document.addEventListener("DOMContentLoaded", function() {
    const formPalpite = document.getElementById("form-palpite");
    const inputPalpite = document.getElementById("palpite");
    const imgBandeira = document.getElementById("bandeira");
    const feedbackElement = document.getElementById("feedback");
    const dropdownList = document.getElementById("paises-dropdown");
    const nextFlagBtn = document.getElementById("next-flag");
    const settingsIcon = document.getElementById("settings-icon");
    const settingsModal = document.getElementById("settings-modal");
    const closeModal = document.querySelector(".close-modal");
    
    // O nomePais é definido no HTML diretamente
    let tentativas = 0;
    
    // Abrir modal de configurações
    settingsIcon.addEventListener("click", function() {
        settingsModal.style.display = "block";
    });
    
    // Fechar modal de configurações
    closeModal.addEventListener("click", function() {
        settingsModal.style.display = "none";
    });
    
    // Fechar modal ao clicar fora dele
    window.addEventListener("click", function(event) {
        if (event.target == settingsModal) {
            settingsModal.style.display = "none";
        }
    });
    
    // Botão para mudar bandeira (apenas para testes)
    nextFlagBtn.addEventListener("click", function() {
        fetch('/proxima_bandeira', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                // Atualizar a imagem da bandeira
                imgBandeira.src = data.url;
                // Redefinir o blur
                imgBandeira.style.filter = "blur(10px)";
                // Redefinir o nome do país
                window.nomePais = data.nome.toLowerCase();
                // Redefinir o estado do jogo
                tentativas = 0;
                inputPalpite.disabled = false;
                formPalpite.querySelector("button").disabled = false;
                inputPalpite.value = "";
                feedbackElement.innerHTML = "";
            })
            .catch(error => {
                console.error('Erro ao buscar próxima bandeira:', error);
            });
    });
    
    // Lista de todos os países para o autocomplete
    fetch('/paises')
        .then(response => response.json())
        .then(data => {
            const listaPaises = data;
            
            // Função para filtrar e mostrar o dropdown
            inputPalpite.addEventListener('input', function() {
                const valor = this.value.toLowerCase();
                
                // Limpar lista atual
                dropdownList.innerHTML = '';
                
                if (valor.length < 1) {
                    dropdownList.style.display = 'none';
                    return;
                }
                
                // Filtrar países que começam com o texto digitado
                const paisesFiltrados = listaPaises.filter(pais => 
                    pais.toLowerCase().includes(valor)
                ).slice(0, 5); // Limitar a 5 resultados
                
                if (paisesFiltrados.length > 0) {
                    dropdownList.style.display = 'block';
                    paisesFiltrados.forEach(pais => {
                        const item = document.createElement('div');
                        item.className = 'dropdown-item';
                        item.textContent = pais;
                        item.addEventListener('click', function() {
                            inputPalpite.value = pais;
                            dropdownList.style.display = 'none';
                        });
                        dropdownList.appendChild(item);
                    });
                } else {
                    dropdownList.style.display = 'none';
                }
            });
            
            // Fechar dropdown ao clicar fora
            document.addEventListener('click', function(e) {
                if (e.target !== inputPalpite && e.target !== dropdownList) {
                    dropdownList.style.display = 'none';
                }
            });
        });
    
    formPalpite.addEventListener("submit", function(event) {
        event.preventDefault();
        tentativas++;
        
        let palpite = inputPalpite.value.trim().toLowerCase();
        
        // Usando a variável nomePais definida no HTML
        if (palpite === window.nomePais || palpite === nomePais) {
            imgBandeira.style.filter = "blur(0px)";
            feedbackElement.innerHTML = `<div class="success">Parabéns! Você acertou em ${tentativas} tentativa(s)!</div>`;
            inputPalpite.disabled = true;
            formPalpite.querySelector("button").disabled = true;
            
            // Registrar o acerto
            fetch('/acertou');
        } else {
            // Reduzindo o blur gradualmente
            let blurAtual = getComputedStyle(imgBandeira).filter;
            let valorBlur = 10; // Valor padrão inicial
            
            if (blurAtual.includes("blur")) {
                valorBlur = parseFloat(blurAtual.match(/blur\(([^)]+)px\)/)[1]);
            }
            
            if (valorBlur > 0) {
                valorBlur = Math.max(0, valorBlur - 2);
                imgBandeira.style.filter = `blur(${valorBlur}px)`;
            }
            
            // Dando dicas baseadas na primeira letra
            let primeiraPalpite = palpite.charAt(0);
            let paisCorreto = window.nomePais || nomePais;
            let primeiraCorreta = paisCorreto.charAt(0);
            
            if (primeiraPalpite === primeiraCorreta) {
                feedbackElement.innerHTML = "<div class='hint'>A primeira letra está correta. Continue tentando!</div>";
            } else {
                feedbackElement.innerHTML = `<div class='hint'>Tente um país que começa com a letra "${primeiraCorreta.toUpperCase()}"</div>`;
            }
            
            // Limpando o campo de entrada
            inputPalpite.value = "";
            inputPalpite.focus();
            dropdownList.style.display = 'none';
        }
    });
});
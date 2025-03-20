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
    const cronometroElement = document.getElementById("cronometro");
    
    // O nomePais é definido no HTML diretamente
    let tentativas = 0;
    const maxTentativas = 5;
    let selectedItemIndex = -1;
    let blurInicial = 50; // Blur inicial mais intenso
    
    // Função para atualizar o contador regressivo
    function atualizarCronometro() {
        // Obter a data e hora atual
        const agora = new Date();
        
        // Calcular a próxima meia-noite (00:00:00)
        const amanha = new Date(agora);
        amanha.setDate(amanha.getDate() + 1);
        amanha.setHours(0, 0, 0, 0);
        
        // Calcular a diferença em milissegundos
        const diferenca = amanha - agora;
        
        // Converter para horas, minutos e segundos
        let horas = Math.floor(diferenca / (1000 * 60 * 60));
        let minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
        let segundos = Math.floor((diferenca % (1000 * 60)) / 1000);
        
        // Adicionar zeros à esquerda se necessário
        horas = horas.toString().padStart(2, "0");
        minutos = minutos.toString().padStart(2, "0");
        segundos = segundos.toString().padStart(2, "0");
        
        // Atualizar o elemento HTML
        cronometroElement.textContent = `Nova bandeira em: ${horas}:${minutos}:${segundos}`;
    }
    
    // Atualizar o cronômetro imediatamente
    atualizarCronometro();
    
    // Atualizar o cronômetro a cada segundo
    setInterval(atualizarCronometro, 1000);
    
    // Função para atualizar o feedback com as tentativas restantes
    function atualizarContadorTentativas() {
        const tentativasRestantes = maxTentativas - tentativas;
        document.querySelector(".contador").innerHTML = 
            `Tentativas restantes: <strong>${tentativasRestantes}</strong><br>Cada tentativa incorreta diminui o desfoque da imagem`;
    }
    
    // Inicializar o contador de tentativas
    atualizarContadorTentativas();
    
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
    
    /* Botão para mudar bandeira (apenas para testes)
    nextFlagBtn.addEventListener("click", function() {
        fetch('/proxima_bandeira', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                // Atualizar a imagem da bandeira
                imgBandeira.src = data.url;
                // Redefinir o blur para o valor inicial
                imgBandeira.style.filter = `blur(${blurInicial}px)`;
                // Redefinir o nome do país
                window.nomePais = data.nome.toLowerCase();
                // Redefinir o estado do jogo
                tentativas = 0;
                atualizarContadorTentativas();
                inputPalpite.disabled = false;
                formPalpite.querySelector("button").disabled = false;
                inputPalpite.value = "";
                feedbackElement.innerHTML = "";
            })
            .catch(error => {
                console.error('Erro ao buscar próxima bandeira:', error);
            });
    });
    */
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
                ).slice(0, 10); // Aumentado para 10 resultados
                
                if (paisesFiltrados.length > 0) {
                    dropdownList.style.display = 'block';
                    paisesFiltrados.forEach((pais, index) => {
                        const item = document.createElement('div');
                        item.className = 'dropdown-item';
                        item.textContent = pais;
                        item.setAttribute('data-index', index);
                        item.addEventListener('click', function() {
                            inputPalpite.value = pais;
                            dropdownList.style.display = 'none';
                            selectedItemIndex = -1;
                        });
                        item.addEventListener('mouseenter', function() {
                            resetSelectedItems();
                            item.classList.add('selected');
                            selectedItemIndex = parseInt(item.getAttribute('data-index'));
                        });
                        dropdownList.appendChild(item);
                    });
                    
                    selectedItemIndex = -1; // Reset selection on new dropdown
                } else {
                    dropdownList.style.display = 'none';
                }
            });
            
            // Navegação por teclado no dropdown
            inputPalpite.addEventListener('keydown', function(e) {
                const items = dropdownList.querySelectorAll('.dropdown-item');
                
                if (dropdownList.style.display !== 'block' || items.length === 0) {
                    return;
                }
                
                // Navegar para baixo
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectedItemIndex = Math.min(selectedItemIndex + 1, items.length - 1);
                    updateSelection(items);
                    ensureVisible(items[selectedItemIndex]);
                }
                // Navegar para cima
                else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selectedItemIndex = Math.max(selectedItemIndex - 1, 0);
                    updateSelection(items);
                    ensureVisible(items[selectedItemIndex]);
                }
                // Selecionar item com Enter
                else if (e.key === 'Enter' && selectedItemIndex >= 0) {
                    e.preventDefault();
                    inputPalpite.value = items[selectedItemIndex].textContent;
                    dropdownList.style.display = 'none';
                    selectedItemIndex = -1;
                }
                // Fechar dropdown com Escape
                else if (e.key === 'Escape') {
                    dropdownList.style.display = 'none';
                    selectedItemIndex = -1;
                }
            });
            
            // Garantir que o item selecionado esteja visível (scroll para ele)
            function ensureVisible(element) {
                const container = dropdownList;
                const containerTop = container.scrollTop;
                const containerBottom = containerTop + container.clientHeight;
                const elementTop = element.offsetTop;
                const elementBottom = elementTop + element.clientHeight;
                
                // Verificar se o elemento está fora da área visível
                if (elementTop < containerTop) {
                    // Scroll para cima
                    container.scrollTop = elementTop;
                } else if (elementBottom > containerBottom) {
                    // Scroll para baixo
                    container.scrollTop = elementBottom - container.clientHeight;
                }
            }
            
            // Atualizar a seleção visual dos itens
            function updateSelection(items) {
                resetSelectedItems();
                if (selectedItemIndex >= 0) {
                    items[selectedItemIndex].classList.add('selected');
                }
            }
            
            // Remover seleção de todos os itens
            function resetSelectedItems() {
                const selectedItems = dropdownList.querySelectorAll('.dropdown-item.selected');
                selectedItems.forEach(item => item.classList.remove('selected'));
            }
            
            // Fechar dropdown ao clicar fora
            document.addEventListener('click', function(e) {
                if (e.target !== inputPalpite && e.target !== dropdownList) {
                    dropdownList.style.display = 'none';
                    selectedItemIndex = -1;
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
            // Reduzindo o blur gradualmente baseado no número máximo de tentativas
            const blurDecremento = blurInicial / maxTentativas;
            const novoBlur = Math.max(0, blurInicial - (blurDecremento * tentativas));
            imgBandeira.style.filter = `blur(${novoBlur}px)`;
            
            // Atualizar contador de tentativas
            atualizarContadorTentativas();
            
            // Verificar se acabaram as tentativas
            if (tentativas >= maxTentativas) {
                feedbackElement.innerHTML = `<div class='hint'>Suas tentativas acabaram! O país correto era ${window.nomePais || nomePais}.</div>`;
                imgBandeira.style.filter = "blur(0px)";
                inputPalpite.disabled = true;
                formPalpite.querySelector("button").disabled = true;
            } else {
                // Dando dicas baseadas na primeira letra
                let primeiraPalpite = palpite.charAt(0);
                let paisCorreto = window.nomePais || nomePais;
                let primeiraCorreta = paisCorreto.charAt(0);
                
                if (primeiraPalpite === primeiraCorreta) {
                    feedbackElement.innerHTML = "<div class='hint'>A primeira letra está correta. Continue tentando!</div>";
                } else {
                    feedbackElement.innerHTML = `<div class='hint'>Tente um país que começa com a letra "${primeiraCorreta.toUpperCase()}"</div>`;
                }
            }
            
            // Limpando o campo de entrada
            inputPalpite.value = "";
            inputPalpite.focus();
            dropdownList.style.display = 'none';
        }
    });
});
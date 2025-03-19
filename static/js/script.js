document.addEventListener("DOMContentLoaded", function() {
    const formPalpite = document.getElementById("form-palpite");
    const inputPalpite = document.getElementById("palpite");
    const imgBandeira = document.getElementById("bandeira");
    const feedbackElement = document.getElementById("feedback");
    
    // O nomePais é definido no HTML diretamente
    
    let tentativas = 0;
    
    formPalpite.addEventListener("submit", function(event) {
        event.preventDefault();
        tentativas++;
        
        let palpite = inputPalpite.value.trim().toLowerCase();
        
        // Usando a variável nomePais definida no HTML
        if (palpite === nomePais) {
            imgBandeira.style.filter = "blur(0px)";
            feedbackElement.innerHTML = `<div class="success">Parabéns! Você acertou em ${tentativas} tentativa(s)!</div>`;
            inputPalpite.disabled = true;
            formPalpite.querySelector("button").disabled = true;
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
            let primeiraCorreta = nomePais.charAt(0);
            
            if (primeiraPalpite === primeiraCorreta) {
                feedbackElement.innerHTML = "<div class='hint'>A primeira letra está correta. Continue tentando!</div>";
            } else {
                feedbackElement.innerHTML = `<div class='hint'>Tente um país que começa com a letra "${primeiraCorreta.toUpperCase()}"</div>`;
            }
            
            // Limpando o campo de entrada
            inputPalpite.value = "";
            inputPalpite.focus();
        }
    });
});
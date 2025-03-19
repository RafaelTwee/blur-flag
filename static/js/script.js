document.getElementById("form-palpite").addEventListener("submit", function(event) {
    event.preventDefault();
    let input = document.getElementById("palpite").value.trim().toLowerCase();

    // Nome correto da bandeira (recebido do Flask no HTML)
    let respostaCorreta = "{{ bandeira[0].lower() }}";

    let imagem = document.getElementById("bandeira");
    let blurAtual = parseInt(imagem.style.filter.replace("blur(", "").replace("px)", ""));

    if (input === respostaCorreta) {
        imagem.style.filter = "blur(0px)";
        alert("Parabéns! Você acertou!");
    } else {
        if (blurAtual > 2) {
            imagem.style.filter = `blur(${blurAtual - 2}px)`;
        }
    }
});

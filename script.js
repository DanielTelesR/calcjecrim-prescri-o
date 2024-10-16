document.getElementById("denuncia").addEventListener("change", function() {
    const denuncia = document.getElementById("denuncia").value;
    const denunciaDateContainer = document.getElementById("denunciaDateContainer");

    if (denuncia === "sim") {
        denunciaDateContainer.style.display = "block";
    } else {
        denunciaDateContainer.style.display = "none";
        document.getElementById("denunciaDate").value = ""; // Limpa o campo se não houver denúncia
    }
});

document.getElementById("prescriptionForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Obtendo a data do fato delituoso e o máximo da pena
    const crimeDateInput = document.getElementById("crimeDate").value;
    const crimeDate = new Date(crimeDateInput + "T00:00:00"); // Adiciona a hora para evitar problemas com fusos horários
    const birthDateInput = document.getElementById("birthDate").value;
    const birthDate = new Date(birthDateInput + "T00:00:00"); // Mesma correção para data de nascimento
    const maxPenalty = parseFloat(document.getElementById("maxPenalty").value);
    const denuncia = document.getElementById("denuncia").value;

    const today = new Date();
    const ageAtCrime = Math.floor((crimeDate - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    const ageAtSentence = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

    // Verificar se a data está válida
    if (isNaN(crimeDate.getTime()) || isNaN(birthDate.getTime())) {
        document.getElementById("result").innerHTML = "<p>Por favor, insira uma data válida.</p>";
        return;
    }

    // Verificar se a pena máxima é válida
    if (isNaN(maxPenalty) || maxPenalty <= 0) {
        document.getElementById("result").innerHTML = "<p>Por favor, insira um valor válido para a pena.</p>";
        return;
    }

    // Definir o prazo de prescrição com base no máximo da pena
    let prescriptionPeriodYears;
    if (maxPenalty > 12) {
        prescriptionPeriodYears = 20;
    } else if (maxPenalty > 8 && maxPenalty <= 12) {
        prescriptionPeriodYears = 16;
    } else if (maxPenalty > 4 && maxPenalty <= 8) {
        prescriptionPeriodYears = 12;
    } else if (maxPenalty > 2 && maxPenalty <= 4) {
        prescriptionPeriodYears = 8;
    } else if (maxPenalty > 1 && maxPenalty <= 2) {
        prescriptionPeriodYears = 4;
    } else {
        prescriptionPeriodYears = 3;
    }

    // Aplicar a redução pela metade se o réu tinha menos de 21 anos no crime ou mais de 70 anos na sentença
    if (ageAtCrime < 21 || ageAtSentence > 70) {
        prescriptionPeriodYears /= 2;
    }

    // Adicionando o período de prescrição à data do crime
    let startingDate = new Date(crimeDate); // Certifique-se de que é a data correta, sem modificações

    // Se houve denúncia, atualizar a data de início para a data da denúncia
    if (denuncia === "sim") {
        const denunciaDateInput = document.getElementById("denunciaDate").value;
        const denunciaDate = new Date(denunciaDateInput + "T00:00:00"); // Adiciona a hora para evitar problemas de fuso

        // Verificar se a data da denúncia é válida
        if (isNaN(denunciaDate.getTime())) {
            document.getElementById("result").innerHTML = "<p>Por favor, insira uma data válida para o recebimento da denúncia.</p>";
            return;
        }

        startingDate = denunciaDate; // O marco interruptivo reinicia a contagem
    }

    const prescriptionDate = new Date(startingDate);
    prescriptionDate.setFullYear(startingDate.getFullYear() + prescriptionPeriodYears);

    // Formatando a data de prescrição para o formato dd/mm/aaaa
    const formattedPrescriptionDate = prescriptionDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Formatando a data de início (para exibir no resumo)
    const formattedStartingDate = startingDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Verificando se já houve prescrição
    let resultText;
    if (today > prescriptionDate) {
        resultText = `<p>A pretensão punitiva estatal já prescreveu em ${formattedPrescriptionDate}.</p>`;
    } else {
        resultText = `<p>A pretensão punitiva estatal ainda não prescreveu. Prescreverá em ${formattedPrescriptionDate}.</p>`;
    }

    // Adicionar as idades à resposta
    resultText += `<p>Idade do réu à época dos fatos: ${ageAtCrime} anos.</p>`;
    resultText += `<p>Idade do réu na data da sentença (hoje): ${ageAtSentence} anos.</p>`;

    // Resumo detalhado do cálculo
    resultText += `<p><strong>Resumo do Cálculo:</strong></p>`;
    resultText += `<p>A contagem da prescrição começou em ${formattedStartingDate}, sendo este o marco inicial. O prazo prescricional aplicado foi de ${prescriptionPeriodYears} anos, com base no art. 109 do Código Penal, considerando a pena máxima de ${maxPenalty} anos.</p>`;

    if (ageAtCrime < 21 || ageAtSentence > 70) {
        resultText += `<p>O prazo foi reduzido pela metade, conforme o art. 115 do Código Penal, devido à idade do réu (menor de 21 anos à época dos fatos ou maior de 70 anos na data da sentença).</p>`;
    }

    if (denuncia === "sim") {
        resultText += `<p>Como houve recebimento de denúncia, o marco interruptivo foi a data de ${formattedStartingDate}, conforme o art. 117, I, do Código Penal.</p>`;
    } else {
        resultText += `<p>Como não houve recebimento de denúncia, a contagem da prescrição começou na data do fato delituoso: ${formattedStartingDate}.</p>`;
    }

    // Exibindo o resultado no elemento result
    document.getElementById("result").innerHTML = resultText;
});

const form = document.querySelector('.contato-form');

form.onsubmit = async (e) => {
    e.preventDefault(); // Agora sim ele vai impedir o redirecionamento

    const formData = new FormData(form);
    const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
        alert('E-mail enviado com sucesso! Logo entrarei em contato. 😉');
        form.reset();
    } else {
        alert('Ops! Ocorreu um erro. Verifique o preenchimento e tente novamente.');
    }
};
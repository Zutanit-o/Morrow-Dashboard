const ids = ['main', 'forecast-daily', 'forecast-hourly'];

for (const id of ids) {
    let element_id = `close-${id}`;
    let button = document.getElementById(element_id);
    let window = document.getElementById(id);

    button.addEventListener('click', () => {
        window.classList.toggle('active');
    });
}

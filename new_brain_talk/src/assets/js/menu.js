const btnMenu = document.querySelector('.btn_menu');
const mainMenu = document.querySelector('.main_menu');
const closeBtn = document.querySelector('.close_btn');

btnMenu.addEventListener('click', () => {
    mainMenu.classList.add('active');
});
closeBtn.addEventListener('click', () => {
    mainMenu.classList.remove('active');
});

// 해더

const headerMenu = document.querySelector('.header_menu');

window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
        headerMenu.classList.add('active');
    } else {
        headerMenu.classList.remove('active');
    }
});
const header = document.querySelector('.header_menu')

window.addEventListener('scroll',()=>{
    if(window.scrollY > 10){
        header.classList.add('active')
    } else if(window.scrollY < 10){
        header.classList.remove('active')
    }
})
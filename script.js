document.getElementById('mobile-menu-toggle').addEventListener('click', function () {
    document.querySelector('nav').classList.toggle('show-menu');
    document.querySelector('.menu-toggle').classList.toggle('hide');
    document.querySelector('.menu-toggle1').classList.toggle('show');
});

document.querySelector('.menu-toggle1').addEventListener('click', function () {
    document.querySelector('nav').classList.remove('show-menu');
    document.querySelector('.menu-toggle').classList.remove('hide');
    document.querySelector('.menu-toggle1').classList.remove('show');
});


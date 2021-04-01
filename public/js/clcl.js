document.addEventListener('DOMContentLoaded', function () {
    var menu_btn = document.querySelector('#menu-button');
    menu_btn.addEventListener('click', function (event) {
        
        var main_menu = document.querySelector('#drop-down');
        main_menu.classList.toggle('open');

    });

    var list_items = document.querySelectorAll('.list-item');
    list_items.forEach(function (item) {
        item.addEventListener('click', function (event) {
            item.classList.toggle('active');

            // show edit btn if 1 selected.

            // show delete "X" if >= 1 selected.
        });
    });
});
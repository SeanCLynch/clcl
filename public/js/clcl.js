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

            var num_items_selected = document.querySelectorAll('.active').length;

            // show edit btn if 1 & only 1 selected.
            var edit_btn = document.querySelector('#edit-item-btn');
            if (num_items_selected == 1) {
                edit_btn.classList.remove('is-hidden');
            } else {
                edit_btn.classList.add('is-hidden');
            }

            // show delete "X" if >= 1 selected.
            var delete_btn = document.querySelector('#delete-item-btn');
            if (num_items_selected == 1) {
                delete_btn.classList.remove('is-hidden');
            } else {
                delete_btn.classList.add('is-hidden');
            }
            
        });
    });

    var edit_btn;
    var delete_btn;
});
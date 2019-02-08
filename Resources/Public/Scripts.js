$(document).ready(function () {
    $('.acl-autocompletition').on('keyup', function () {
        if($(this).val() != "" && $(this).val().charAt(0) != "/" && $(this).val().length > 1) {
            aclFetchNodesForAutocompletion($(this), $(this).val());
        } else {
            $(this).parent().find('.acl-dropdown').hide();
        }
    });



    (function($) {
        $('.acl-toggle').click(function() {
            $(this).html('Show all');
            $(this).parent().find('.acl-data').toggle();
        });
    })(jQuery);
});

function aclFetchNodesForAutocompletion(input, query) {
    var searchEndpoint = '/neos/service/nodes';

    var dropdown = input.parent().find('.acl-dropdown');
    dropdown.html('<span><i class="icon-white icon-spin icon-spinner"></i> Loading</span>');
    dropdown.show();

    $.get(
        searchEndpoint,
        {searchTerm: query},
        function(data) {
            dropdown.html('');
            $.each(data, function () {
                dropdown.append('<span class="result" data-nodepath="' + this.path + '">' + this.name + ' <span class="acl-info">(' + this.identifier + ')</span></span>');
            });

            $.each(dropdown.find('span.result'), function (input) {
                $(this).click(function () {
                    input = $(this).parent().parent().find('input');
                    $(input).val($(this).data('nodepath'));
                    dropdown.hide();
                });
            })
        },
        'json'
    )
}






$(document).ready(function()    {
    $.ajax({
        type: 'GET',
        url: '/assets/json/projects.json',
        dataType: 'json',
        success: function(responseData, status){
            var finalOutput = '';
            $.each(responseData, function(i, item) {
                finalOutput += '<div class="projectbox"><h2>'+item.name+'</h2><img src="'+item.image+'" alt="'+item.name+'">'
                finalOutput += '<a href="'+item.link+'" target="_blank">Link</a>'
                finalOutput += '<p>'+item.description+'</p></div>'
            });
            console.log(finalOutput);
            $('.pagecontent').append(finalOutput);
        }
    });
});
$(document).ready(function()    {
    $.ajax({
        type: 'GET',
        url: '/assets/json/projects.json',
        dataType: 'json',
        success: function(responseData, status){
            var finalOutput = '';
            $.each(responseData, function(i, item) {
                finalOutput += '<div class="projectbox"><a class="title-link" href="'+item.link+'"><h2>'+item.name+'</h2></a><a class="image-link" href="'+item.link+'"><img src="'+item.image+'" alt="'+item.name+'"></a>'
                finalOutput += '<a class="github-link" href="'+item.github+'" target="_blank">GitHub</a>'
                finalOutput += '<p>'+item.description+'</p></div>'
            });
            console.log(finalOutput);
            $('.projectbody').html(finalOutput);
        }
    });
});
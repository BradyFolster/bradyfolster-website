$(document).ready(function()    {
    $.ajax({
        type: 'GET',
        url: '/assets/json/projects.json',
        dataType: 'json',
        success: function(responseData, status){
            var currentPath = window.location.pathname.replace(/\/+$/, '');
            var matchedProject = null;

            $.each(responseData, function(i, item) {
                var projectPath = item.link.replace(/\/+$/, '');
                if (currentPath === projectPath) {
                    matchedProject = item;
                    return false;
                }
            });

            if (!matchedProject) {
                $('#project-detail').html('<h1 class="title">Project Not Found</h1>');
                return;
            }

            var finalOutput = '';
            finalOutput += '<h1 class="title project-detail-title">'+matchedProject.name+'</h1>';
            finalOutput += '<img class="project-detail-image" src="'+matchedProject.image+'" alt="'+matchedProject.name+'">';
            finalOutput += '<a class="project-detail-link bodylink" href="'+matchedProject.github+'" target="_blank" rel="noopener noreferrer">GitHub</a>';

            $('#project-detail').html(finalOutput);
        }
    });
});
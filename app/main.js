import $ from 'jquery'

function uploadFiles(e){
    e.preventDefault();
    var formData = new FormData($(this)[0]);
    console.debug(formData);

    $.ajax({
        url: '/uploads',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function(data){
            console.debug(data);
        }
    });

}
$(() => {
    $('#file-upload').submit(uploadFiles);
})
